import 'server-only'

type AccessToken = { token: string; expiresAt: number }
let cached: AccessToken | null = null

export class PayPalError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'PayPalError'
    this.status = status
    this.body = body
  }
}

export class PayPalNotConfiguredError extends Error {
  constructor() {
    super('PayPal is not configured (missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET).')
    this.name = 'PayPalNotConfiguredError'
  }
}

export function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

function requireCreds(): { id: string; secret: string } {
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) throw new PayPalNotConfiguredError()
  return { id, secret }
}

export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now()
  if (cached && cached.expiresAt - 60_000 > now) return cached.token

  const { id, secret } = requireCreds()
  const auth = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  const body = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!res.ok || !body.access_token) {
    throw new PayPalError('Failed to obtain PayPal access token', res.status, body)
  }
  cached = {
    token: body.access_token,
    expiresAt: now + (body.expires_in ?? 3000) * 1000,
  }
  return cached.token
}

type PayPalOrder = {
  id: string
  status: string
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ amount?: { value?: string; currency_code?: string } }>
    }
    payee?: { email_address?: string }
  }>
  payer?: { email_address?: string }
}

export async function createPayPalOrder(input: {
  amount: string
  description: string
  customId?: string
}): Promise<{ id: string }> {
  const token = await getPayPalAccessToken()
  const res = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: input.amount },
          description: input.description.slice(0, 127),
          ...(input.customId ? { custom_id: input.customId.slice(0, 127) } : {}),
        },
      ],
    }),
    cache: 'no-store',
  })
  const body = (await res.json()) as { id?: string }
  if (!res.ok || !body.id) {
    throw new PayPalError('Failed to create PayPal order', res.status, body)
  }
  return { id: body.id }
}

export async function capturePayPalOrder(orderId: string): Promise<{
  status: string
  amount: string
  currency: string
  payerEmail?: string
  raw: PayPalOrder
}> {
  const token = await getPayPalAccessToken()
  const res = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  )
  const body = (await res.json()) as PayPalOrder
  if (!res.ok) {
    throw new PayPalError('Failed to capture PayPal order', res.status, body)
  }
  const capture = body.purchase_units?.[0]?.payments?.captures?.[0]
  const amount = capture?.amount?.value
  const currency = capture?.amount?.currency_code
  if (!amount || !currency) {
    throw new PayPalError('PayPal capture response missing amount', res.status, body)
  }
  return {
    status: body.status,
    amount,
    currency,
    payerEmail: body.payer?.email_address,
    raw: body,
  }
}

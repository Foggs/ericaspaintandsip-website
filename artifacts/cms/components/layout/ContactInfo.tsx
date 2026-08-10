// TODO: Replace these placeholder values with real business contact info when Erica confirms.
const BUSINESS_NAME = "Erica's Paint & Sip"
const ADDRESS_LINE_1 = '123 Main Street'
const ADDRESS_LINE_2 = 'Sterling Heights, MI 48310'
const PHONE_DISPLAY = '(586) 555-0100'
const PHONE_TEL = '+15865550100'
const EMAIL = 'hello@ericaspaintandsip.com'

export function ContactInfo() {
  return (
    <address className="not-italic rounded-lg border border-primary/15 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink">Visit us</h2>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[auto_1fr]">
        <dt className="font-semibold text-ink sm:m-0">Studio</dt>
        <dd className="m-0 text-ink">{BUSINESS_NAME}</dd>

        <dt className="mt-2 font-semibold text-ink sm:m-0">Address</dt>
        <dd className="m-0 text-ink">
          {ADDRESS_LINE_1}
          <br />
          {ADDRESS_LINE_2}
        </dd>

        <dt className="mt-2 font-semibold text-ink sm:m-0">Phone</dt>
        <dd className="m-0">
          <a
            href={`tel:${PHONE_TEL}`}
            className="text-primary underline-offset-2 hover:underline"
          >
            {PHONE_DISPLAY}
          </a>
        </dd>

        <dt className="mt-2 font-semibold text-ink sm:m-0">Email</dt>
        <dd className="m-0">
          <a
            href={`mailto:${EMAIL}`}
            className="text-primary underline-offset-2 hover:underline"
          >
            {EMAIL}
          </a>
        </dd>
      </dl>
    </address>
  )
}

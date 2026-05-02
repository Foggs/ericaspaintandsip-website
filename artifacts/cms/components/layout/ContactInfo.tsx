// TODO: Replace these placeholder values with real business contact info when Erica confirms.
const BUSINESS_NAME = "Erica's Paint & Sip"
const ADDRESS_LINE_1 = '123 Main Street'
const ADDRESS_LINE_2 = 'Sterling Heights, MI 48310'
const PHONE_DISPLAY = '(586) 555-0100'
const PHONE_TEL = '+15865550100'
const EMAIL = 'hello@ericaspaintandsip.com'

const responsiveCss = `
.contact-info-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: 0.75rem;
  column-gap: 1rem;
  margin: 0;
}
.contact-info-dl dt { font-weight: 600; color: #333; margin: 0; }
.contact-info-dl dd { margin: 0; color: #222; }
@media (max-width: 480px) {
  .contact-info-dl {
    grid-template-columns: 1fr;
    row-gap: 0.25rem;
  }
  .contact-info-dl dd { margin-bottom: 0.5rem; }
  .contact-info-dl dd:last-of-type { margin-bottom: 0; }
}
`

export function ContactInfo() {
  return (
    <address
      style={{
        fontStyle: 'normal',
        background: '#fafafa',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '1.5rem',
      }}
    >
      <style>{responsiveCss}</style>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem' }}>Visit us</h2>
      <dl className="contact-info-dl">
        <dt>Studio</dt>
        <dd>{BUSINESS_NAME}</dd>

        <dt>Address</dt>
        <dd>
          {ADDRESS_LINE_1}
          <br />
          {ADDRESS_LINE_2}
        </dd>

        <dt>Phone</dt>
        <dd>
          <a href={`tel:${PHONE_TEL}`} style={{ color: '#222', textDecoration: 'underline' }}>
            {PHONE_DISPLAY}
          </a>
        </dd>

        <dt>Email</dt>
        <dd>
          <a href={`mailto:${EMAIL}`} style={{ color: '#222', textDecoration: 'underline' }}>
            {EMAIL}
          </a>
        </dd>
      </dl>
    </address>
  )
}

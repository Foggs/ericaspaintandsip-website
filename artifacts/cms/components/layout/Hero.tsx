import Link from 'next/link'

const primaryBtn = {
  display: 'inline-block',
  padding: '0.85rem 1.5rem',
  background: '#222',
  color: '#fff',
  borderRadius: '4px',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: '1rem',
}

const secondaryBtn = {
  display: 'inline-block',
  padding: '0.85rem 1.5rem',
  background: 'transparent',
  color: '#222',
  border: '1px solid #222',
  borderRadius: '4px',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: '1rem',
}

export function Hero() {
  return (
    <section
      style={{
        background: '#fafafa',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            lineHeight: 1.15,
            margin: '0 0 1rem 0',
          }}
        >
          Paint, sip, and unwind in Sterling Heights
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#555',
            lineHeight: 1.6,
            margin: '0 0 2rem 0',
          }}
        >
          Erica&apos;s Paint &amp; Sip hosts laid-back paint nights, private
          parties, and team events. Bring your friends — we&apos;ll bring the
          supplies.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
          }}
        >
          <Link href="/events" style={primaryBtn}>
            See upcoming events
          </Link>
          <Link href="/private-events" style={secondaryBtn}>
            Host a private event
          </Link>
        </div>
      </div>
    </section>
  )
}

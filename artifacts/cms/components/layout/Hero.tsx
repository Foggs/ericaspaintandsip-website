import Link from 'next/link'
import { FadeIn } from '@/components/motion/FadeIn'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-cream to-accent-light">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20 md:py-28">
        <FadeIn delay={0}>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl md:text-6xl">
            Paint, sip, and unwind in{' '}
            <span className="text-primary">Sterling Heights</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Erica&apos;s Paint &amp; Sip hosts laid-back paint nights, private parties, and
            team events. Bring your friends — we&apos;ll bring the supplies.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md motion-reduce:transition-none"
            >
              See upcoming events
            </Link>
            <Link
              href="/private-events"
              className="inline-flex items-center justify-center rounded-md border border-primary bg-transparent px-6 py-3 font-semibold text-primary transition-colors duration-200 hover:bg-primary/5 motion-reduce:transition-none"
            >
              Host a private event
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

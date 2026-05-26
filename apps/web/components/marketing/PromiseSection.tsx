/**
 * Scene 3 · The promise
 *
 * Centered eyebrow + display headline + lede. The single declarative
 * statement that scopes the rest of the page.
 */

import { Container } from '@vought/ui';

export function PromiseSection() {
  return (
    <section
      aria-labelledby="promise-heading"
      className="px-6 py-32"
    >
      <Container width="narrow" padX={0}>
        <div className="text-center">
          <div className="reveal label-small mb-5 text-accent-amber">
            One platform · three surfaces
          </div>
          <h2
            id="promise-heading"
            className="reveal display-2xl mb-7 text-white"
            style={{ transitionDelay: '80ms' }}
          >
            Every conversation,<br />guided by Vought.
          </h2>
          <p
            className="reveal text-xl leading-relaxed text-white/60"
            style={{ transitionDelay: '240ms' }}
          >
            From the first inbound call to the closed deal, Vought sits beside
            every operator — listening, coaching, learning. All powered by the
            same Echo Engine.
          </p>
        </div>
      </Container>
    </section>
  );
}

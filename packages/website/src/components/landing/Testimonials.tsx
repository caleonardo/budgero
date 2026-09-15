import { useTranslations } from 'next-intl';
import { pricing } from '@/lib/pricing';

const testimonials = (copy: CopyTranslator) => [
  {
    quote: copy('u_850a28825069'),
    highlight: copy('u_04fa0c6b64c5'),
    name: copy('u_1b96f7ab151b'),
    detail: copy('u_d69473594a8a'),
    initial: 'D',
    badge: copy('u_fdd1b2770302'),
  },
  {
    quote: copy('u_0bee6454e8f1'),
    highlight: copy('u_8a4a44dca35b'),
    name: copy('u_9820252f1739'),
    detail: copy('u_3bf7824191ea'),
    initial: 'S',
    badge: copy('u_fdd1b2770302'),
  },
  {
    quote: copy('u_02ebbfaa26ae'),
    highlight: copy('u_18afca059f45'),
    name: copy('u_9e10e99aa921'),
    detail: copy('u_153a0213cba7'),
    initial: 'B',
  },
  {
    quote: copy('u_c30fa43c6230'),
    highlight: copy('u_0566bc95dfef'),
    name: copy('u_dcc67b0988c3'),
    detail: copy('u_beafec79ffdd'),
    initial: 'M',
  },
];

const trustStats = (copy: CopyTranslator) => [
  { value: '168', label: copy('u_e2d064d8f587') },
  { value: '100%', label: copy('u_e86c7848315e') },
  { value: pricing.monthly, label: copy('u_0af4cb6af2a8') },
  { value: '0', label: copy('u_d1da9755b6e7') },
];

export function FeaturedTestimonial() {
  const copy = useTranslations('updates');
  return (
    <figure className="mx-auto max-w-3xl px-6 py-14 text-center sm:py-20">
      <blockquote className="text-xl font-medium leading-relaxed sm:text-2xl">
        {' '}
        {copy('u_ccf91cb14049')}{' '}
      </blockquote>
      <figcaption className="mt-5 text-sm text-muted-foreground">
        {' '}
        {copy('u_ee597b534ca6')}{' '}
        <a
          href="https://www.reddit.com/r/budgero/comments/1vx27fi/comment/p65w8u3/?context=3"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          {' '}
          {copy('u_8ea266fd2a78')}{' '}
        </a>
      </figcaption>
    </figure>
  );
}

function HighlightedQuote({ text, highlight }: { text: string; highlight: string }) {
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return <p className="text-sm leading-7 text-foreground/85 flex-1">{text}</p>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <p className="text-sm leading-7 text-foreground/85 flex-1">
      {before}
      <em className="not-italic font-medium text-foreground">{match}</em>
      {after}
    </p>
  );
}

function Card({
  item,
  className,
}: {
  item: ReturnType<typeof testimonials>[number];
  className?: string;
}) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border/70 p-6 sm:p-7 flex flex-col gap-4 transition-colors hover:border-border ${className ?? ''}`}
    >
      <HighlightedQuote text={item.quote} highlight={item.highlight} />
      <div className="flex items-center gap-3 pt-3 border-t border-border/60">
        <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold text-foreground/70 flex-shrink-0">
          {item.initial}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground">{item.name}</span>
          <span className="text-xs text-foreground/55">{item.detail}</span>
        </div>
        {item.badge && (
          <span className="ml-auto whitespace-nowrap rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {item.badge}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Shared testimonials section. Drop into any page.
 */
export function TestimonialsSection() {
  const copy = useTranslations('updates');
  return (
    <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {' '}
          {copy('u_9a0a2bf3b079')}{' '}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {' '}
          {copy('u_8753daf607e8')}{' '}
        </h2>
        <p className="text-foreground/60 max-w-lg mx-auto"> {copy('u_62cddaa70ffd')} </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-lg md:max-w-none mx-auto">
        {testimonials(copy).map((t) => (
          <Card key={t.initial} item={t} />
        ))}
      </div>

      <div className="flex justify-center gap-10 sm:gap-14 flex-wrap mt-10 pt-6 border-t border-border/60">
        {trustStats(copy).map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-foreground/55 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;

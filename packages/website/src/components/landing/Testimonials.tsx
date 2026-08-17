import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { pricing } from '@/lib/pricing';

type Testimonial = {
  quote: string;
  highlight: string;
  name: string;
  detail: string;
  initial: string;
  badge?: string;
};

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
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

function Card({ item, className }: { item: Testimonial; className?: string }) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border/70 p-6 sm:p-7 flex flex-col gap-4 transition-colors hover:border-border ${className ?? ''}`}
    >
      <Stars />
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
  const t = useTranslations('home');

  const testimonials: Testimonial[] = [
    {
      quote: t('t1_quote'),
      highlight: t('t1_highlight'),
      name: t('t1_name'),
      detail: t('t1_detail'),
      initial: 'D',
      badge: t('badge_ex_ynab'),
    },
    {
      quote: t('t2_quote'),
      highlight: t('t2_highlight'),
      name: t('t2_name'),
      detail: t('t2_detail'),
      initial: 'S',
      badge: t('badge_ex_ynab'),
    },
    {
      quote: t('t3_quote'),
      highlight: t('t3_highlight'),
      name: t('t3_name'),
      detail: t('t3_detail'),
      initial: 'B',
    },
    {
      quote: t('t4_quote'),
      highlight: t('t4_highlight'),
      name: t('t4_name'),
      detail: t('t4_detail'),
      initial: 'M',
    },
  ];

  const trustStats = [
    { value: '168', label: t('stat_currencies') },
    { value: '100%', label: t('stat_zk') },
    { value: pricing.monthly, label: t('stat_mo') },
    { value: '0', label: t('stat_third') },
  ];

  return (
    <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {t('testimonials_eyebrow')}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {t('testimonials_h2')}
        </h2>
        <p className="text-foreground/60 max-w-lg mx-auto">{t('testimonials_p')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-lg md:max-w-none mx-auto">
        {testimonials.map((t) => (
          <Card key={t.initial} item={t} />
        ))}

      </div>

      <div className="flex justify-center gap-10 sm:gap-14 flex-wrap mt-10 pt-6 border-t border-border/60">
        {trustStats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-foreground/55 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

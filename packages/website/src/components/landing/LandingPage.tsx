'use client';

import {
  ArrowRight,
  Shield,
  Lock,
  FileText,
  EyeOff,
  CircleCheckBig,
  Coins,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CalendarRange,
  Command,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ResettingGif } from '@/components/ui/resetting-media';
import { track } from '@/lib/analytics';
import { pricing } from '@/lib/pricing';
import { TestimonialsSection } from '@/components/landing/Testimonials';
// Newsletter signup coming soon

type CloudCtaPlacement = 'hero' | 'pricing' | 'final' | 'mobile-sticky';

const cloudSignupUrl = (placement: CloudCtaPlacement) =>
  `https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=home&utm_content=${placement}`;

export default function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowMobileStickyCta(window.scrollY > 520);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const heroDesktopImageSrc = '/desktop_new.png';
  const heroMobileImageSrc = '/mobile_new.png';

  const trackCloudCta = (placement: CloudCtaPlacement) => {
    track('CTA Clicked - Cloud', {
      placement,
      page: 'home',
      ...(placement === 'pricing' ? { billingCycle } : {}),
    });
  };

  const featureShowcases = [
    {
      icon: <FileText className="h-6 w-6 text-foreground/70" strokeWidth={1.8} />,
      title: 'Seamless imports in seconds',
      description:
        'Drop in your YNAB or CSV files and Budgero maps everything automatically. Review, confirm, and keep moving—no manual cleanup required.',
      media: '/features_desktop/ynab_import_desktop.webm',
      mediaMobile: '/features_mobile/ynab_import_mobile.webm',
      mediaAlt: 'Demo showing Budgero importing a YNAB budget.',
    },
    {
      icon: <Coins className="h-6 w-6 text-foreground/70" strokeWidth={1.8} />,
      title: 'Effortless multi-currency transfers',
      description:
        'Move money across accounts in 100+ currencies and watch Budgero convert instantly with live rates. No mental math, no spreadsheets—just accurate balances everywhere.',
      media: '/features_desktop/multi_currency_desktop.png',
      mediaMobile: '/features_mobile/multi_currency_mobile.png',
      mediaAlt: 'Screenshot preview of Budgero multi-currency budgeting.',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-foreground/70" strokeWidth={1.8} />,
      title: 'Semantic search that understands intent',
      description:
        'Find exactly the transactions you need using natural-language queries that match meaning, not just exact text.',
      media: '/features_desktop/semantic_search_desktop.webm',
      mediaMobile: '/features_mobile/semantic_search_mobile.webm',
      mediaAlt: 'Demo of semantic search in Budgero.',
    },
    {
      icon: <CalendarRange className="h-6 w-6 text-foreground/70" strokeWidth={1.8} />,
      title: 'Plan months ahead instantly',
      description:
        'Zoom out to anywhere from three to six months at a time and adjust plans in seconds. Every change ripples across future buckets so you always know what is coming next.',
      subtext: '(Desktop only)',
      media: '/features_desktop/multi_month_view_desktop.png',
      mediaMobile: '/features_desktop/multi_month_view_desktop.png',
      mediaAlt: 'Screenshot of Budgero multi-month planning view.',
    },
    {
      icon: <Command className="h-6 w-6 text-foreground/70" strokeWidth={1.8} />,
      title: 'Autofill rules for repetitive work',
      description:
        'Set once and let Budgero auto-apply category and assignment patterns so routine budget updates happen consistently with minimal manual input.',
      media: '/features_desktop/autofill_rules_demo_video.webm',
      mediaMobile: '/features_mobile/autofil_rules_mobile.webm',
      mediaAlt: 'Demo of Budgero autofill rules workflow.',
    },
  ];

  const totalFeatures = featureShowcases.length;
  const currentFeature = featureShowcases[activeFeature];

  const goToFeature = (index: number) => {
    if (totalFeatures === 0) {
      return;
    }
    const normalizedIndex = ((index % totalFeatures) + totalFeatures) % totalFeatures;
    setActiveFeature(normalizedIndex);
  };

  const goToNextFeature = () => {
    goToFeature(activeFeature + 1);
  };

  const goToPrevFeature = () => {
    goToFeature(activeFeature - 1);
  };

  useEffect(() => {
    if (typeof document === 'undefined' || totalFeatures <= 1) {
      return undefined;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevFeature();
      } else if (event.key === 'ArrowRight') {
        goToNextFeature();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [activeFeature, totalFeatures]);

  const paidFeatures = [
    'Hosting, maintenance, and automatic updates handled for you',
    'Encrypted sync across unlimited devices',
    '5 seats for your household',
    'Seamless multi-currency with live rates',
    'YNAB & CSV import',
    'Spending reports and custom dashboards',
  ];

  const paidPlanPricing = {
    monthly: {
      price: pricing.monthly,
      period: 'month',
      priceNote: null,
    },
    yearly: {
      price: pricing.yearly,
      period: 'year',
      priceNote: `Equivalent to ${pricing.yearlyEquivMonthly} per month`,
    },
  } as const;

  const faqs = [
    {
      question: 'How is my data kept private?',
      answer:
        'Your data is encrypted with your password using AES-256 encryption before it ever leaves your device. We use zero-knowledge architecture, meaning we literally cannot decrypt or view your financial information - only you can.',
    },
    {
      question: "What's the difference between Budgero Cloud and Self-Host?",
      answer:
        'Budgero Cloud is fully managed by us and includes encrypted sync, collaboration, and automatic updates. Self-Host gives you the same core feature set on your own infrastructure, so you manage hosting, backups, and operations yourself.',
    },
    {
      question: 'Does Budgero automatically connect to my bank?',
      answer:
        "No, and that's by design. To protect your privacy, we will never ask for your bank credentials. This approach, combined with our end-to-end encryption, ensures your data remains yours alone. For convenience, you can easily import transactions via a CSV file from your bank.",
    },
    {
      question: 'Can I import from YNAB or other apps?',
      answer:
        'Absolutely! We support direct YNAB imports and CSV files from most banking apps and budgeting tools. The import process takes just a few minutes and preserves your categories, transactions, and account structure.',
    },
    {
      question: 'Does it work offline?',
      answer:
        "Yes, completely! You can add transactions, update budgets, and review your finances without any internet connection. All changes sync automatically when you're back online.",
    },
    {
      question: 'Is Budgero open source?',
      answer:
        'Yes. Budgero is open source under the AGPL-3.0, an OSI-approved license. The full source code is public on GitHub — you can read it, audit the encryption yourself, build from source, and self-host it for free.',
    },
    {
      question: 'What happens if Budgero shuts down?',
      answer:
        "Nothing you rely on disappears. The code is open source and self-hostable, so the app keeps working and anyone can keep building it. Plus, you can export all your data anytime in standard formats, so you're never locked in.",
    },
    {
      question: 'Can I export my data?',
      answer:
        'Yes. You can download a full SQLite backup or CSV bundle from Data Management. You retain complete ownership of your budgets.',
    },
    {
      question: 'Do paid plans include a free trial?',
      answer:
        'Yes. Every paid plan comes with a 35-day free trial — no credit card required. Try the full app with encrypted sync and collaboration. When your trial ends, subscribe to keep using the app.',
    },
    {
      question: 'Do prices include tax?',
      answer: `Yes. Prices are tax-inclusive — ${pricing.monthly}/month or ${pricing.yearly}/year is exactly what you pay, anywhere in the world. VAT and sales tax are included in the price, never added at checkout.`,
    },
    {
      question: 'What devices does it work on?',
      answer:
        'Budgero works on all devices — iPhone, Android, Windows, Mac, and Linux. The web app is fully responsive and optimized for a great experience across platforms.',
    },
  ];
  const DIVIDER_CLASS =
    'my-14 -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12 2xl:-mx-16 border-t-2 border-border';

  return (
    <>
      <div className="min-h-screen bg-background text-foreground relative">
        <div className="relative z-10">
          <div className="relative mx-auto max-w-screen-2xl">
            <div className="pointer-events-none absolute inset-0 border-2 border-border/80" />
            {/* Horizontal line below header */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-border/80" />
            <div className="relative z-10 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-4 lg:py-6">
              {/* Header is provided globally by SiteHeader in RootLayout */}
              {/* Horizontal line below header (aligned to outer frame) */}
              <div className="relative mt-20 -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12 2xl:-mx-16">
                <div className="pointer-events-none absolute inset-x-0 inset-y-0 h-px bg-border/80" />
              </div>

              <section id="hero" className="py-32 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.08]">
                    Budget nobody can read but you.
                  </h1>
                  <div className="text-lg md:text-2xl text-foreground/70 mb-8 max-w-3xl mx-auto leading-relaxed space-y-3">
                    <p>
                      Budgero Cloud brings your budget, accounts, and household together with
                      encrypted sync. We handle the hosting and updates. Your financial data is
                      encrypted on your device before it reaches our servers.
                    </p>
                    <p className="text-base md:text-lg">
                      Built on{' '}
                      <a
                        href="https://github.com/tombadilo-bombadilo/budgero"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 decoration-dotted hover:text-foreground"
                      >
                        open-source code
                      </a>{' '}
                      you can inspect. Managed Cloud is {pricing.monthly}/month or {pricing.yearly}
                      /year, tax included.
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button
                      asChild
                      className="h-11 w-full sm:w-auto px-6 text-sm bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b] transition-colors font-semibold"
                    >
                      <a href={cloudSignupUrl('hero')} onClick={() => trackCloudCta('hero')}>
                        Try Cloud free for 35 days
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="mt-4 text-xs sm:text-sm text-foreground/60">
                    No credit card required. No server setup. Import files or enter transactions
                    manually, without connecting your bank.
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-foreground/60">
                    Looking for a{' '}
                    <Link
                      href="/best-ynab-alternatives"
                      className="underline underline-offset-4 decoration-dotted hover:text-foreground"
                    >
                      YNAB alternative
                    </Link>
                    ?{' '}
                    <Link
                      href="/vs-ynab"
                      className="underline underline-offset-4 decoration-dotted hover:text-foreground"
                    >
                      Compare Budgero vs YNAB
                    </Link>
                    .
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-foreground/60">
                    Budgeting across borders? Explore our{' '}
                    <Link
                      href="/monarch-money-europe-alternative"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      Monarch Money alternative for Europe
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/multi-currency-budgeting"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      multi-currency budgeting
                    </Link>
                    .
                  </p>
                </div>

                <div className="relative z-10 mt-8 md:mt-10">
                  <div className="relative left-1/2 w-screen -translate-x-1/2 md:left-0 md:w-full md:translate-x-0">
                    <div className="hidden md:block mx-auto max-w-[1400px] px-6 lg:px-10">
                      <Image
                        src={heroDesktopImageSrc}
                        alt="Budgero analytics dashboard"
                        width={2880}
                        height={2160}
                        priority
                        className="w-full h-auto"
                        sizes="(min-width: 1024px) 1200px, 100vw"
                      />
                    </div>
                    <div className="block md:hidden mx-auto w-full max-w-[560px] px-2 sm:px-4">
                      <Image
                        src={heroMobileImageSrc}
                        alt="Budgero on mobile"
                        width={2880}
                        height={2160}
                        priority
                        className="w-full h-auto object-contain"
                        sizes="(max-width: 767px) 96vw, 560px"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className={DIVIDER_CLASS} aria-hidden />

              <section id="pricing" className="relative py-24 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
                      Start with Cloud,{' '}
                      <span className="text-foreground/85">keep full control</span>
                    </h2>
                    <div className="max-w-3xl mx-auto space-y-3">
                      <p className="text-xl md:text-2xl text-foreground/80 font-medium leading-relaxed">
                        Your budget is ready when you are. Get encrypted sync, shared workspaces,
                        and multi-currency budgeting with hosting and updates taken care of.
                      </p>
                      <p className="text-sm md:text-base text-foreground/80">
                        Try every Cloud feature free for 35 days. No credit card required.
                      </p>
                    </div>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <div className="relative group h-full">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="px-4 py-1.5 bg-[#111c34] text-[#f8fafc] border border-[#111c34] shadow-sm">
                          Budgero Cloud
                        </Badge>
                      </div>
                      <div className="absolute -inset-1 rounded-3xl border border-border/40 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                      <Card className="relative bg-background/90 border border-border/60 rounded-3xl shadow-xl transition-all duration-500 hover:border-border h-full flex flex-col">
                        <div className="absolute inset-0 pointer-events-none" aria-hidden />
                        <CardHeader className="relative pb-8">
                          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                            <Badge
                              variant="secondary"
                              className="bg-[#d7dbe2] text-[#141414] border-[#b9bec8] px-3 py-1"
                            >
                              {billingCycle === 'monthly' ? 'Pay monthly' : 'Billed yearly'}
                            </Badge>
                            <div className="flex items-center justify-center gap-1 bg-[#d7dbe2] rounded-full p-1 border border-[#b9bec8]">
                              {(['monthly', 'yearly'] as const).map((cycle) => (
                                <Button
                                  key={cycle}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setBillingCycle(cycle)}
                                  aria-pressed={billingCycle === cycle}
                                  className={`px-3 py-1 text-xs font-medium transition-all duration-150 h-7 rounded-full ${
                                    billingCycle === cycle
                                      ? 'bg-[#fffdf8] text-[#141414] shadow-sm hover:bg-[#f7f3e7]'
                                      : 'text-[#4b5563] hover:text-[#141414] hover:bg-transparent'
                                  }`}
                                >
                                  {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="mb-2">
                            <CardTitle className="text-5xl font-bold text-foreground tracking-tight inline-block">
                              {paidPlanPricing[billingCycle].price}
                            </CardTitle>
                            <span className="text-lg font-medium text-foreground/60 ml-2">
                              /{paidPlanPricing[billingCycle].period}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 h-6">
                            {paidPlanPricing[billingCycle].priceNote && (
                              <span className="text-sm text-foreground/80 font-medium">
                                {paidPlanPricing[billingCycle].priceNote}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/60">
                            Tax included — the price you see is the price you pay, worldwide.
                          </p>
                          <CardDescription className="mt-4 text-foreground/80 font-medium">
                            All budgeting features, with the infrastructure managed for you.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative flex-grow flex flex-col space-y-8">
                          <ul className="space-y-4 flex-grow">
                            {[...paidFeatures, '35-day free trial - no credit card required'].map(
                              (feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 group/item">
                                  <div className="mt-1 p-0.5 rounded-full bg-[#d7dbe2] text-[#374151] group-hover/item:bg-[#c9ced8] transition-colors">
                                    <CircleCheckBig className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  </div>
                                  <span className="text-foreground/80 font-medium">{feature}</span>
                                </li>
                              )
                            )}
                          </ul>
                          <Button
                            asChild
                            className="w-full bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-auto"
                          >
                            <a
                              href={cloudSignupUrl('pricing')}
                              onClick={() => trackCloudCta('pricing')}
                            >
                              Try Cloud free for 35 days
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </section>

              <div className={DIVIDER_CLASS} aria-hidden />

              <section id="security" className="relative py-24 -mt-16 pt-40">
                <div className="container mx-auto px-4 relative z-10">
                  <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-muted/50 border border-border/50 shadow-xl">
                      <Lock className="w-10 h-10 text-foreground" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                      Your Data is <span className="text-foreground/85">Truly Private</span>
                    </h2>
                    <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                      Budgero encrypts your budget on your device before it reaches our servers.
                      Your transactions, categories, and balances stay private during sync.{' '}
                      <span className="font-semibold text-foreground/85">
                        We literally cannot read, mine, or sell your transactions.
                      </span>
                    </p>
                    <p className="text-base text-foreground/70">
                      <Link
                        href="/encrypted-budgeting"
                        className="underline underline-offset-4 hover:text-foreground"
                      >
                        How encrypted budgeting protects your data
                      </Link>
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {["We Can't See Your Data", 'Open Source', 'Bank-Level Security'].map(
                      (title, i) => (
                        <div className="relative group h-full" key={i}>
                          <div className="absolute -inset-1 rounded-2xl border border-border/40 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                          <div className="relative bg-background/90 rounded-2xl p-8 shadow-xl border border-border/60 text-center hover:transform hover:scale-105 transition-all duration-300 h-full flex flex-col">
                            <div className="w-16 h-16 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-sm bg-muted/50 border border-border/50">
                              {
                                [
                                  <EyeOff className="w-8 h-8 text-foreground" key="a" />,
                                  <CircleCheckBig className="w-8 h-8 text-foreground" key="b" />,
                                  <Shield className="w-8 h-8 text-foreground" key="c" />,
                                ][i]
                              }
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
                            <p className="text-foreground/70 leading-relaxed flex-grow">
                              {
                                [
                                  'Your password encrypts everything before it reaches our servers. We never see your balances, categories, or transactions — period.',
                                  'Budgero’s source code is public under AGPL-3.0. You can inspect how your budget is protected, contribute improvements, and export your data anytime.',
                                  'AES-256-GCM with PBKDF2-HMAC-SHA256 key derivation (600,000 iterations) protects your data using battle-tested cryptography in your browser.',
                                ][i]
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>

              <div className={DIVIDER_CLASS} aria-hidden />

              <section id="features" className="relative py-32 -mt-16 pt-48 overflow-hidden">
                <div className="absolute inset-0 bg-muted/15"></div>
                <div className="container mx-auto px-4 relative z-10">
                  <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
                      Features You&apos;ll <span className="text-foreground/85">Love</span>
                    </h2>
                    <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                      Peek behind the curtain at how Budgero feels in motion. These quick clips
                      showcase the polished workflows that make budgeting actually enjoyable.
                    </p>
                  </div>
                  <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-2 sm:px-4 lg:px-0">
                    <article
                      key={currentFeature?.title}
                      className="group relative w-full overflow-hidden rounded-3xl border border-border/60 bg-background shadow-xl transition-all duration-500 hover:border-border"
                    >
                      <div className="absolute -inset-x-12 -top-10 h-40 rounded-full bg-foreground/5 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                      <div className="relative flex h-full flex-col lg:grid lg:grid-cols-12 lg:gap-3">
                        <div className="relative overflow-hidden lg:col-span-9 lg:ml-4 lg:my-3">
                          <div className="relative flex aspect-[4/3] items-center justify-center">
                            {currentFeature &&
                              (() => {
                                const activeMediaSrc =
                                  isMobile && currentFeature.mediaMobile
                                    ? currentFeature.mediaMobile
                                    : currentFeature.media;
                                return (
                                  <ResettingGif
                                    resetKey={activeFeature}
                                    src={activeMediaSrc}
                                    alt={currentFeature.mediaAlt}
                                    fill
                                    sizes="(min-width: 1280px) 62vw, (min-width: 1024px) 58vw, (min-width: 768px) 80vw, 100vw"
                                    className="h-full w-full"
                                    style={{
                                      objectFit: 'contain',
                                      objectPosition: 'center center',
                                    }}
                                    unoptimized
                                    priority={activeFeature === 0}
                                  />
                                );
                              })()}
                          </div>
                        </div>
                        <div className="relative z-10 mt-4 px-6 pb-8 lg:col-span-3 lg:mt-0 lg:px-0 lg:pr-8 lg:py-6 lg:flex lg:flex-col lg:justify-center">
                          <div className="inline-flex items-center gap-3 rounded-full bg-muted/30 px-5 py-2 text-sm font-semibold text-foreground shadow-sm border border-border/60">
                            {currentFeature?.icon}
                            <span className="tracking-wide uppercase text-xs font-semibold text-foreground">
                              In action
                            </span>
                          </div>
                          <h3 className="mt-5 text-2xl font-bold text-foreground lg:text-3xl">
                            {currentFeature?.title}
                          </h3>
                          {currentFeature?.subtext && (
                            <p className="mt-1 text-sm text-foreground/60">
                              {currentFeature.subtext}
                            </p>
                          )}
                          <p className="mt-3 text-base leading-relaxed text-foreground/70 lg:text-lg">
                            {currentFeature?.description}
                          </p>
                        </div>
                      </div>
                    </article>

                    {totalFeatures > 1 && (
                      <>
                        <div className="mt-10 flex w-full items-center justify-between gap-6 px-2 lg:px-6">
                          <button
                            type="button"
                            onClick={goToPrevFeature}
                            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/30"
                            aria-label="View previous feature"
                          >
                            <ChevronLeft className="h-5 w-5" />
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={goToNextFeature}
                            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={totalFeatures <= 1}
                            aria-label="View next feature"
                          >
                            Next
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-3">
                          {featureShowcases.map((feature, index) => {
                            const isActive = index === activeFeature;
                            return (
                              <button
                                key={feature.title}
                                type="button"
                                onClick={() => goToFeature(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                                  isActive ? 'w-8 bg-foreground' : 'w-2.5 bg-muted/60'
                                }`}
                                aria-label={`Showcase ${feature.title}`}
                                aria-pressed={isActive}
                              ></button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              <div className={DIVIDER_CLASS} aria-hidden />

              <TestimonialsSection />

              <div className={DIVIDER_CLASS} aria-hidden />

              <section id="faq" className="relative py-32 overflow-hidden -mt-16 pt-48">
                <div className="container mx-auto px-4 relative z-10">
                  <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-4xl font-black text-foreground">FAQ</h2>
                    <div className="space-y-4">
                      {faqs.map((faq, index) => {
                        const isOpen = expandedFaq === index;
                        return (
                          <div
                            key={faq.question}
                            className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => toggleFaq(index)}
                              className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40"
                            >
                              <span
                                className={`flex h-10 w-10 items-center justify-center rounded-md border text-lg font-semibold transition-all ${
                                  isOpen
                                    ? 'bg-[#111c34] text-[#f8fafc] ring-1 ring-border'
                                    : 'bg-transparent text-foreground/50'
                                }`}
                              >
                                {isOpen ? '−' : '+'}
                              </span>
                              <span className="text-lg font-semibold text-foreground">
                                {faq.question}
                              </span>
                            </button>
                            {isOpen ? (
                              <div className="px-4 pb-6 pr-4 md:pl-[4.75rem] md:pr-10">
                                <p className="text-base leading-relaxed text-foreground/75">
                                  {faq.answer}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <div className={DIVIDER_CLASS} aria-hidden />

              <section id="final-cta" className="relative py-24">
                <div className="container mx-auto px-4">
                  <div className="mx-auto max-w-4xl rounded-3xl border border-border/70 bg-muted/20 px-6 py-12 text-center shadow-xl sm:px-10">
                    <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                      Ready to try Budgero Cloud?
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-foreground/70 leading-relaxed">
                      Start your 35-day trial with hosting, updates, and encrypted sync included.
                      Then {pricing.monthly}/month or {pricing.yearly}/year, tax included.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        asChild
                        className="h-11 w-full sm:w-auto px-6 bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                      >
                        <a href={cloudSignupUrl('final')} onClick={() => trackCloudCta('final')}>
                          Try Cloud free for 35 days
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <p className="mt-4 text-sm text-foreground/70">
                      No credit card required. Start in your browser.
                    </p>
                  </div>
                </div>
              </section>

              <section id="self-host" aria-labelledby="self-host-heading" className="pb-24">
                <div className="mx-auto max-w-3xl border-t border-border/70 pt-10 text-center">
                  <h2 id="self-host-heading" className="text-2xl font-bold text-foreground">
                    Open source. Free to self-host.
                  </h2>
                  <p className="mt-4 text-base text-foreground/70 leading-relaxed">
                    Prefer running Budgero on your own server? The same open-source product is
                    available to self-host without a software subscription. You manage the hosting,
                    updates, and backups.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
                    <Link
                      href="/self-hostable"
                      onClick={() =>
                        track('CTA Clicked - Self Host', { placement: 'bottom', page: 'home' })
                      }
                      className="font-semibold underline underline-offset-4 hover:text-foreground/70"
                    >
                      Explore self-hosting
                    </Link>
                    <Link
                      href="/docs/self-hosting-guide"
                      onClick={() =>
                        track('Self-Host - Setup Guide (Homepage)', {
                          placement: 'bottom',
                          page: 'home',
                        })
                      }
                      className="font-semibold underline underline-offset-4 hover:text-foreground/70"
                    >
                      Read the self-hosting guide
                    </Link>
                  </div>
                </div>
              </section>

              {/* Newsletter signup coming soon */}

              {/* Footer is provided globally by SiteFooter in RootLayout */}
            </div>
          </div>
        </div>
        <div
          className={`md:hidden fixed inset-x-4 bottom-4 z-50 transition-all duration-300 ${
            showMobileStickyCta
              ? 'translate-y-0 opacity-100'
              : 'translate-y-6 opacity-0 pointer-events-none'
          }`}
        >
          <div className="rounded-2xl border border-border/80 bg-background/95 backdrop-blur px-3 py-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <Button
                asChild
                className="w-full h-11 text-sm font-semibold bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
              >
                <a
                  href={cloudSignupUrl('mobile-sticky')}
                  onClick={() => trackCloudCta('mobile-sticky')}
                  tabIndex={showMobileStickyCta ? undefined : -1}
                >
                  Try Cloud free for 35 days
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

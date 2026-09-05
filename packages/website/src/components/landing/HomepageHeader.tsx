import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrialLink } from './TrialLink';

export function HomepageHeader() {
  return (
    <header
      id="site-header"
      className="sticky top-0 z-30 mx-auto max-w-6xl bg-background/95 px-4 py-5 backdrop-blur sm:px-6"
    >
      <nav aria-label="Main navigation" className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight sm:text-xl"
          aria-label="Budgero home"
        >
          <Image
            src="/logo_144.png"
            alt=""
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="hidden min-[360px]:inline">Budgero</span>
        </Link>
        <div className="flex items-center gap-3 text-xs sm:gap-7 sm:text-sm">
          <a
            href="#how-it-works"
            className="hidden text-muted-foreground hover:text-foreground md:block"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="hidden text-muted-foreground hover:text-foreground sm:block"
          >
            Pricing
          </a>
          <a
            href="https://my.budgero.app/auth"
            className="whitespace-nowrap text-muted-foreground hover:text-foreground"
          >
            Sign in
          </a>
          <Button asChild className="rounded-full px-3 text-xs sm:px-5 sm:text-sm">
            <TrialLink placement="header">Start free trial</TrialLink>
          </Button>
        </div>
      </nav>
    </header>
  );
}

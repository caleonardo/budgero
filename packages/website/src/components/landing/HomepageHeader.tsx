'use client';

import { useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { TrialLink } from './TrialLink';

export function HomepageHeader() {
  const copy = useTranslations('updates');
  const common = useTranslations('common');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      id="site-header"
      className="sticky top-0 z-30 mx-auto max-w-6xl bg-background/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          closeMenu();
          menuButton.current?.focus();
        }
      }}
    >
      <nav aria-label={copy('u_eb355944b92d')} className="flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2 font-bold tracking-tight sm:text-xl"
          aria-label={copy('u_7034bf806242')}
        >
          <Image
            src="/logo_144.png"
            alt=""
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="hidden min-[420px]:inline">Budgero</span>
        </Link>
        <div className="flex items-center gap-3 text-sm lg:gap-6">
          <div className="hidden items-center gap-6 lg:flex">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground">
              {copy('u_9c870aa6e5e9')}
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">
              {copy('u_dfe95783edfe')}
            </a>
            <LanguageSwitcher />
            <a
              href="https://my.budgero.app/auth"
              className="whitespace-nowrap text-muted-foreground hover:text-foreground"
            >
              {copy('u_bfd402b2f6f3')}
            </a>
          </div>
          <Button asChild className="h-10 rounded-full px-4 text-xs sm:text-sm">
            <TrialLink placement="header">
              <span className="sm:hidden">{common('try_free')}</span>
              <span className="hidden sm:inline">{copy('u_b1effd1ffed3')}</span>
            </TrialLink>
          </Button>
          <Button
            ref={menuButton}
            variant="ghost"
            size="icon"
            className="size-10 lg:hidden"
            aria-label={menuOpen ? common('close_menu') : copy('u_b40b3713b43d')}
            aria-expanded={menuOpen}
            aria-controls="homepage-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>
      <div
        id="homepage-mobile-menu"
        hidden={!menuOpen}
        className="absolute inset-x-0 top-full border-b border-border bg-background px-6 pb-6 pt-3 shadow-lg lg:hidden"
      >
        <div className="mx-auto grid max-w-6xl gap-1 text-sm">
          <a href="#how-it-works" onClick={closeMenu} className="py-3">
            {copy('u_9c870aa6e5e9')}
          </a>
          <a href="#pricing" onClick={closeMenu} className="py-3">
            {copy('u_dfe95783edfe')}
          </a>
          <a href="https://my.budgero.app/auth" className="py-3">
            {copy('u_bfd402b2f6f3')}
          </a>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <span className="text-muted-foreground">{common('aria_language')}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

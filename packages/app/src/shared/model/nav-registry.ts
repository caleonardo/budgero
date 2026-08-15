import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';
import {
  User,
  CreditCard,
  Shield,
  Users,
  Inbox,
  Tag,
  History,
  Database,
  SlidersHorizontal,
  Coins,
  Layers,
  Clock,
  Plug,
  Bot,
  Palette,
  Info,
  FileText,
  TrendingUp,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

export interface NavRouteItem {
  to: string;
  icon: LucideIcon;
  label: MessageDescriptor;
  exact?: boolean;
  selfHostHidden?: boolean;
  devOnly?: boolean;
}

/** Reports submenu links (all indented `ml-4 mr-2`). */
export const NAV_REPORTS: NavRouteItem[] = [
  { to: '/reports/prebuilt', icon: FileText, label: msg`Prebuilt` },
  { to: '/reports/explorer', icon: TrendingUp, label: msg`Explorer` },
  { to: '/reports/dashboards', icon: LayoutGrid, label: msg`Custom Dashboards`, exact: false },
];

/** Settings → Account & Access links (only shown when not a self-hostable build). */
export const NAV_SETTINGS_ACCOUNT: NavRouteItem[] = [
  { to: '/settings/account', icon: User, label: msg`Account` },
  { to: '/settings/subscription', icon: CreditCard, label: msg`Subscription` },
  { to: '/settings/security', icon: Shield, label: msg`Security & Privacy` },
];

/** Settings → Budgets & Data links. */
export const NAV_SETTINGS_DATA: NavRouteItem[] = [
  { to: '/settings/workspaces', icon: Users, label: msg`Workspaces` },
  { to: '/settings/imports', icon: Inbox, label: msg`Imports` },
  { to: '/settings/payees', icon: User, label: msg`Payees` },
  { to: '/settings/labels', icon: Tag, label: msg`Labels` },
  { to: '/settings/audit-log', icon: History, label: msg`Audit Log` },
  { to: '/settings/data', icon: Database, label: msg`Data Management` },
  { to: '/settings/budget', icon: SlidersHorizontal, label: msg`Budget Settings` },
  { to: '/settings/currencies', icon: Coins, label: msg`Currencies` },
];

/** Settings → Automation & Integrations links. */
export const NAV_SETTINGS_AUTOMATION: NavRouteItem[] = [
  { to: '/settings/rules', icon: Layers, label: msg`Rules` },
  { to: '/settings/recurring', icon: Clock, label: msg`Recurring` },
  { to: '/settings/api', icon: Plug, label: msg`Push API` },
  { to: '/settings/ai', icon: Bot, label: msg`AI Assistant` },
];

/** Settings → Preferences links. */
export const NAV_SETTINGS_PREFERENCES: NavRouteItem[] = [
  { to: '/settings/appearance', icon: Palette, label: msg`Appearance` },
  { to: '/settings/about', icon: Info, label: msg`About` },
];

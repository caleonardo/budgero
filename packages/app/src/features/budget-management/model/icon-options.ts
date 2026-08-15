import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';
import React from 'react';
import {
  // Home & Living
  Home,
  Building,
  Car,
  Utensils,
  ShoppingCart,
  Lightbulb,
  Tv,
  Wifi,
  Smartphone,
  WashingMachine,
  // Personal & Family
  Users,
  Baby,
  HeartPulse,
  Glasses,
  BookOpen,
  GraduationCap,
  Stethoscope,
  // Finance & Money
  PiggyBank,
  DollarSign,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  // Transportation
  Plane,
  Train,
  Bus,
  Bike,
  Ship,
  // Entertainment & Leisure
  Music,
  Gamepad2,
  Camera,
  Book,
  Coffee,
  Gift,
  Ticket,
  // Utilities & Bills
  Zap,
  Droplet,
  Wind,
  Shield,
  FileText,
  // Shopping & Services
  Shirt,
  Scissors,
  Dumbbell,
  Dog,
  Cat,
  TreePine,
  // Miscellaneous
  Star,
  Heart,
  Bell,
  Calendar,
  MapPin,
  Briefcase,
  Crown,
} from 'lucide-react';

export interface IconOption {
  value: string;
  label: MessageDescriptor;
  component: React.ElementType;
}

export const iconOptions: IconOption[] = [
  // Home & Living
  { value: 'Home', label: msg`Home & Rent`, component: Home },
  { value: 'Building', label: msg`Property`, component: Building },
  { value: 'Car', label: msg`Auto & Transport`, component: Car },
  { value: 'Utensils', label: msg`Groceries & Food`, component: Utensils },
  { value: 'ShoppingCart', label: msg`Shopping`, component: ShoppingCart },
  { value: 'Lightbulb', label: msg`Utilities`, component: Lightbulb },
  { value: 'Tv', label: msg`Entertainment`, component: Tv },
  { value: 'Wifi', label: msg`Internet & Phone`, component: Wifi },
  { value: 'Smartphone', label: msg`Mobile`, component: Smartphone },
  { value: 'WashingMachine', label: msg`Household`, component: WashingMachine },

  // Personal & Family
  { value: 'Heart', label: msg`Personal Care`, component: Heart },
  { value: 'Users', label: msg`Family`, component: Users },
  { value: 'Baby', label: msg`Childcare`, component: Baby },
  { value: 'HeartPulse', label: msg`Health & Medical`, component: HeartPulse },
  { value: 'Glasses', label: msg`Vision`, component: Glasses },
  { value: 'BookOpen', label: msg`Education`, component: BookOpen },
  { value: 'GraduationCap', label: msg`School & Learning`, component: GraduationCap },
  { value: 'Stethoscope', label: msg`Healthcare`, component: Stethoscope },

  // Finance & Money
  { value: 'PiggyBank', label: msg`Savings`, component: PiggyBank },
  { value: 'DollarSign', label: msg`Income`, component: DollarSign },
  { value: 'CreditCard', label: msg`Credit Cards`, component: CreditCard },
  { value: 'Banknote', label: msg`Cash`, component: Banknote },
  { value: 'TrendingUp', label: msg`Investments`, component: TrendingUp },
  { value: 'TrendingDown', label: msg`Debt`, component: TrendingDown },
  { value: 'PieChart', label: msg`Budgeting`, component: PieChart },
  { value: 'Target', label: msg`Goals`, component: Target },

  // Transportation
  { value: 'Plane', label: msg`Travel & Vacation`, component: Plane },
  { value: 'Train', label: msg`Public Transit`, component: Train },
  { value: 'Bus', label: msg`Bus & Transit`, component: Bus },
  { value: 'Bike', label: msg`Cycling`, component: Bike },
  { value: 'Ship', label: msg`Travel`, component: Ship },

  // Entertainment & Leisure
  { value: 'Music', label: msg`Music & Streaming`, component: Music },
  { value: 'Gamepad2', label: msg`Gaming`, component: Gamepad2 },
  { value: 'Camera', label: msg`Photography`, component: Camera },
  { value: 'Book', label: msg`Reading`, component: Book },
  { value: 'Coffee', label: msg`Dining Out`, component: Coffee },
  { value: 'Gift', label: msg`Gifts & Donations`, component: Gift },
  { value: 'Ticket', label: msg`Events & Tickets`, component: Ticket },

  // Utilities & Bills
  { value: 'Zap', label: msg`Electricity`, component: Zap },
  { value: 'Droplet', label: msg`Water`, component: Droplet },
  { value: 'Wind', label: msg`Gas`, component: Wind },
  { value: 'Shield', label: msg`Insurance`, component: Shield },
  { value: 'FileText', label: msg`Bills & Documents`, component: FileText },

  // Shopping & Services
  { value: 'Shirt', label: msg`Clothing`, component: Shirt },
  { value: 'Scissors', label: msg`Hair & Beauty`, component: Scissors },
  { value: 'Dumbbell', label: msg`Fitness & Gym`, component: Dumbbell },
  { value: 'Dog', label: msg`Pets`, component: Dog },
  { value: 'Cat', label: msg`Pet Care`, component: Cat },
  { value: 'TreePine', label: msg`Garden & Outdoor`, component: TreePine },

  // Miscellaneous
  { value: 'Star', label: msg`Favorites`, component: Star },
  { value: 'Bell', label: msg`Reminders`, component: Bell },
  { value: 'Calendar', label: msg`Planning`, component: Calendar },
  { value: 'MapPin', label: msg`Location`, component: MapPin },
  { value: 'Briefcase', label: msg`Business`, component: Briefcase },
  { value: 'Crown', label: msg`Luxury`, component: Crown },
];

/**
 * Resolves a budget badge icon value to its lucide component class.
 * Returns null when the value does not match a known icon option.
 * Call sites render the component with their own size, e.g.
 * `const Icon = getBudgetIconComponent(value); return Icon ? <Icon className="h-4 w-4" /> : fallback;`
 */
export function getBudgetIconComponent(badgeIcon: string): React.ElementType | null {
  return iconOptions.find((icon) => icon.value === badgeIcon)?.component ?? null;
}

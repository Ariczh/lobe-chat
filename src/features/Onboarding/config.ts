import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseIcon,
  Code2Icon,
  GraduationCapIcon,
  MegaphoneIcon,
  PackageIcon,
  PaletteIcon,
  PenLineIcon,
  PhoneIcon,
} from 'lucide-react';

export type InterestAreaKey =
  | 'business'
  | 'coding'
  | 'design'
  | 'education'
  | 'marketing'
  | 'product'
  | 'sales'
  | 'writing';

export const INTEREST_AREAS: { icon: LucideIcon; key: InterestAreaKey }[] = [
  { icon: BriefcaseIcon, key: 'business' },
  { icon: Code2Icon, key: 'coding' },
  { icon: PaletteIcon, key: 'design' },
  { icon: GraduationCapIcon, key: 'education' },
  { icon: MegaphoneIcon, key: 'marketing' },
  { icon: PackageIcon, key: 'product' },
  { icon: PhoneIcon, key: 'sales' },
  { icon: PenLineIcon, key: 'writing' },
];

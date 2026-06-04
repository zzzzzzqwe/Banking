import {
  Briefcase, Gift, Undo2, ShoppingCart, Car, Film, Lightbulb,
  HeartPulse, BookOpen, ShoppingBag, Utensils, ArrowLeftRight,
  Repeat, CreditCard, Package, Wallet, Banknote, Receipt, Home,
  Plane, Coffee, Music, Gamepad2, Dumbbell, Shirt, Scissors,
  Phone, Wifi, Baby, Dog, Flower2, Send, FolderOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  'briefcase': Briefcase,
  'gift': Gift,
  'undo-2': Undo2,
  'shopping-cart': ShoppingCart,
  'car': Car,
  'film': Film,
  'lightbulb': Lightbulb,
  'heart-pulse': HeartPulse,
  'book-open': BookOpen,
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'arrow-left-right': ArrowLeftRight,
  'repeat': Repeat,
  'credit-card': CreditCard,
  'package': Package,
  'wallet': Wallet,
  'banknote': Banknote,
  'receipt': Receipt,
  'home': Home,
  'plane': Plane,
  'coffee': Coffee,
  'music': Music,
  'gamepad-2': Gamepad2,
  'dumbbell': Dumbbell,
  'shirt': Shirt,
  'scissors': Scissors,
  'phone': Phone,
  'wifi': Wifi,
  'baby': Baby,
  'dog': Dog,
  'flower-2': Flower2,
  'send': Send,
}

const FALLBACK_ICON = FolderOpen

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  if (!icon) return FALLBACK_ICON
  return ICON_MAP[icon] || FALLBACK_ICON
}

export function CategoryIcon({
  icon,
  size = 16,
  className,
  color,
}: {
  icon: string | null | undefined
  size?: number
  className?: string
  color?: string
}) {
  const Icon = getCategoryIcon(icon)
  return <Icon size={size} className={className} color={color} />
}

import {
  Backpack,
  BookOpen,
  CupSoda,
  Headphones,
  KeyRound,
  Package,
  Shirt,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId, ItemType, LocationId } from '../types'

export interface CategoryDef {
  id: CategoryId
  label: string
  shortLabel: string
  icon: LucideIcon
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'electronics', label: 'Electronics', shortLabel: 'Electronics', icon: Headphones },
  { id: 'bags', label: 'Bags & backpacks', shortLabel: 'Bags', icon: Backpack },
  { id: 'books-stationery', label: 'Books & stationery', shortLabel: 'Books', icon: BookOpen },
  { id: 'wallets-ids', label: 'Wallets & IDs', shortLabel: 'Wallets', icon: Wallet },
  { id: 'keys', label: 'Keys', shortLabel: 'Keys', icon: KeyRound },
  { id: 'bottles-flasks', label: 'Bottles & flasks', shortLabel: 'Bottles', icon: CupSoda },
  { id: 'clothing', label: 'Clothing & accessories', shortLabel: 'Clothing', icon: Shirt },
  { id: 'other', label: 'Other', shortLabel: 'Other', icon: Package },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<CategoryId, CategoryDef>

export interface LocationDef {
  id: LocationId
  label: string
  hint: string
}

export const LOCATIONS: LocationDef[] = [
  { id: 'academic-blocks', label: 'Academic Blocks', hint: 'Corridors, stairwells, block entrances' },
  { id: 'classrooms', label: 'Classrooms', hint: 'Lecture rooms and tutorial rooms' },
  { id: 'computer-labs', label: 'Computer Labs', hint: 'Lab desks, systems and lab counters' },
  { id: 'library', label: 'Library', hint: 'Reading room, stacks and front desk' },
  { id: 'canteen', label: 'Canteen', hint: 'Seating area, counters and queues' },
  { id: 'auditorium', label: 'Auditorium', hint: 'Seats, backstage and entry lobby' },
  { id: 'sports-area', label: 'Sports Area', hint: 'Ground, courts and equipment room' },
  { id: 'parking-area', label: 'Parking Area', hint: 'Two-wheeler and car parking bays' },
  { id: 'other', label: 'Other', hint: 'Anywhere else on the MAIT campus' },
]

export const LOCATION_MAP = Object.fromEntries(
  LOCATIONS.map((location) => [location.id, location]),
) as Record<LocationId, LocationDef>

export const TYPE_LABELS: Record<ItemType, string> = {
  lost: 'Lost',
  found: 'Found',
}

export const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
] as const

export type BuiltinCategoryId =
  | 'burgers'
  | 'wings'
  | 'meals'
  | 'crepes'
  | 'mixes'
  | 'pasta'
  | 'fries'
  | 'extras';

export type CategoryId = BuiltinCategoryId | (string & {});

export type SizeKey = 'S' | 'D' | 'single';

export interface SizePriceMap {
  S?: number | null;
  D?: number | null;
  single?: number | null;
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  subtitle: string;
  image?: string;
  sharedBannerImage?: string;
  sectionNote?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  subGroup?: string;
  description?: string;
  image: string | null;
  prices: SizePriceMap;
  supportsPaidExtras?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  categoryId: CategoryId;
  image: string | null;
  selectedSize: SizeKey;
  unitPrice: number;
  quantity: number;
  selectedExtras: ExtraOption[];
  notes?: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  whatsappPhoneDisplay: string;
  whatsappNumberIntl: string;
}

export interface CustomerCheckoutInfo {
  name: string;
  phone: string;
  orderType: 'delivery' | 'pickup';
  address: string;
  notes: string;
}

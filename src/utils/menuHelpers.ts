import { SIZE_LABELS } from '../data/menuData';
import {
  CartItem,
  CustomerCheckoutInfo,
  MenuItem,
  RestaurantSettings,
  SizeKey,
} from '../types/menu';

export const ORDERED_SIZES: SizeKey[] = ['S', 'D', 'single'];

export function getItemSizes(item: MenuItem): SizeKey[] {
  return ORDERED_SIZES.filter((size) => item.prices[size] !== undefined);
}

export function getFirstSelectableSize(item: MenuItem): SizeKey | null {
  const sizes = getItemSizes(item);
  for (const s of sizes) {
    const val = item.prices[s];
    if (val != null && val > 0) return s;
  }
  return sizes[0] ?? null;
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('en-US')} ج.م`;
}

export function getCartItemUnitTotal(item: CartItem): number {
  const extrasTotal = item.selectedExtras.reduce((sum, ex) => sum + ex.price, 0);
  return item.unitPrice + extrasTotal;
}

export function getCartItemTotal(item: CartItem): number {
  return getCartItemUnitTotal(item) * item.quantity;
}

export function formatWhatsappOrderMessage(params: {
  items: CartItem[];
  customer: CustomerCheckoutInfo;
  settings: RestaurantSettings;
  subtotal: number;
}): string {
  const { items, customer, settings, subtotal } = params;

  const lines: string[] = [
    `*طلب جديد — ${settings.restaurantName}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*بيانات العميل:*`,
    `• الاسم: ${customer.name || 'غير محدد'}`,
    `• الموبايل: ${customer.phone || 'غير محدد'}`,
    `• نوع الطلب: ${customer.orderType === 'pickup' ? 'استلام من المطعم' : 'توصيل دليفري'}`,
    customer.orderType === 'delivery'
      ? `• العنوان: ${customer.address || 'غير محدد'}`
      : '',
    customer.notes ? `• ملاحظات الطلب: ${customer.notes}` : '',
    ``,
    `*تفاصيل الطلب:*`,
  ].filter(Boolean);

  items.forEach((item, index) => {
    const sizeLabel = SIZE_LABELS[item.selectedSize];
    const lineTotal = getCartItemTotal(item);
    const sizeText = item.selectedSize === 'single' ? '' : ` (${sizeLabel})`;
    lines.push(
      `${index + 1}. ${item.name}${sizeText} × ${item.quantity} = ${lineTotal} ج.م`
    );
    if (item.selectedExtras.length > 0) {
      lines.push(
        `   الإضافات: ${item.selectedExtras.map((e) => `${e.name} (+${e.price} ج.م)`).join('، ')}`
      );
    }
    if (item.notes?.trim()) {
      lines.push(`   ملاحظة الصنف: ${item.notes.trim()}`);
    }
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`• *الإجمالي التقديري: ${subtotal} ج.م*`);

  return lines.join('\n');
}

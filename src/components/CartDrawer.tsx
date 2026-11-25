import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Pencil,
} from 'lucide-react';
import { SIZE_LABELS } from '../data/menuData';
import {
  CartItem,
  MenuItem,
} from '../types/menu';
import {
  formatPrice,
  getCartItemTotal,
} from '../utils/menuHelpers';
import { FoodImage } from './FoodImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  menuItems: MenuItem[];
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onEditItem: (cartItem: CartItem) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  menuItems,
  onClose,
  onUpdateQuantity,
  onEditItem,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + getCartItemTotal(item), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="سلة الطلبات"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[#111111] border-r border-white/[0.1] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#F5B418]" />
            <h2 className="font-display text-lg font-bold text-[#F8F5EF]">
              سلة الطلبات
            </h2>
            {items.length > 0 && (
              <span className="text-xs text-[#A8A29E] tabular-nums">
                ({items.reduce((s, i) => s + i.quantity, 0)} صنف)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-[#A8A29E] hover:text-[#DC1013] px-2 py-1 transition-colors cursor-pointer"
              >
                إفراغ السلة
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق سلة الطلبات"
              className="p-2 rounded-lg text-[#A8A29E] hover:text-[#F8F5EF] hover:bg-white/[0.06] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#171717] border border-white/[0.08] flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-[#F5B418]/80" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#F8F5EF] mb-1.5">
                سلتك فارغة حالياً
              </h3>
              <p className="text-sm text-[#A8A29E] max-w-xs mb-6">
                اختر من البرجر أو الوينجز أو الوجبات والكريبات والميكسات لإضافتها إلى طلبك.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-lg bg-[#DC1013] hover:bg-[#B91C1C] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                تصفح المنيو
              </button>
            </div>
          ) : (
            items.map((cartItem) => {
              const sourceItem = menuItems.find((m) => m.id === cartItem.menuItemId);
              const lineTotal = getCartItemTotal(cartItem);

              return (
                <div
                  key={cartItem.cartItemId}
                  className="bg-[#171717] border border-white/[0.08] rounded-xl p-3.5 space-y-3"
                >
                  <div className="flex gap-3">
                    {cartItem.image && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#101010] p-1 shrink-0">
                        <FoodImage
                          src={cartItem.image}
                          alt={cartItem.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-bold text-[#F8F5EF] leading-snug">
                          {cartItem.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(cartItem.cartItemId)}
                          aria-label={`حذف ${cartItem.name}`}
                          className="p-1 text-[#A8A29E] hover:text-[#DC1013] transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#A8A29E] mt-0.5">
                        <span>{SIZE_LABELS[cartItem.selectedSize]}</span>
                        <span>·</span>
                        <span className="tabular-nums">{formatPrice(cartItem.unitPrice)}</span>
                      </div>

                      {cartItem.selectedExtras.length > 0 && (
                        <p className="text-xs text-[#F5B418]/90 mt-1 leading-relaxed">
                          إضافات: {cartItem.selectedExtras.map((e) => `${e.name} (+${e.price})`).join('، ')}
                        </p>
                      )}

                      {cartItem.notes && (
                        <p className="text-xs text-[#A8A29E] mt-1">
                          ملاحظة: {cartItem.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Controls Row: Quantity + Edit Button + Line Total */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                    <div className="inline-flex items-center bg-[#090909] border border-white/[0.08] rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(cartItem.cartItemId, -1)}
                        aria-label="إنقاص الكمية"
                        className="p-1.5 text-[#F8F5EF] hover:bg-white/[0.06] rounded cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums text-[#F8F5EF]">
                        {cartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(cartItem.cartItemId, 1)}
                        aria-label="زيادة الكمية"
                        className="p-1.5 text-[#F8F5EF] hover:bg-white/[0.06] rounded cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {sourceItem && (
                      <button
                        type="button"
                        onClick={() => onEditItem(cartItem)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] hover:bg-[#1E1E1E] border border-[#F5B418]/60 text-xs font-bold text-[#F5B418] transition-colors cursor-pointer min-h-[34px]"
                      >
                        <Pencil className="w-3 h-3 shrink-0" />
                        <span>تعديل</span>
                      </button>
                    )}

                    <span className="font-display text-sm font-bold text-[#F5B418] tabular-nums">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Totals & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 bg-[#090909] border-t border-white/[0.08] space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-[#F8F5EF]">
                  الإجمالي التقديري
                </span>
                <span className="font-display text-lg font-bold text-[#F5B418] tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-5 rounded-lg bg-[#DC1013] hover:bg-[#B91C1C] text-white font-semibold text-base transition-colors cursor-pointer min-h-[48px]"
            >
              إتمام الطلب عبر واتساب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

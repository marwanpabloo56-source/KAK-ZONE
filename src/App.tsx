import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, CheckCircle2, Home, UtensilsCrossed, PhoneCall, MessageCircle } from 'lucide-react';
import {
  BRAND_MARK,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_SETTINGS,
  SIZE_LABELS,
} from './data/menuData';
import {
  CartItem,
  CategoryId,
  ExtraOption,
  MenuItem,
  SizeKey,
} from './types/menu';
import {
  formatPrice,
  getCartItemTotal,
} from './utils/menuHelpers';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedShowcase } from './components/FeaturedShowcase';
import { MenuSection } from './components/MenuSection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LogoIntro } from './components/LogoIntro';

const CART_STORAGE_KEY = 'kakzone_cart_v1';
const INTRO_SEEN_KEY = 'kakzone_intro_seen_v1';

function readCartStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const categories = INITIAL_CATEGORIES;
  const menuItems = INITIAL_MENU_ITEMS;
  const settings = INITIAL_SETTINGS;

  const [cart, setCart] = useState<CartItem[]>(readCartStorage);
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [detailState, setDetailState] = useState<{
    item: MenuItem;
    initialSize: SizeKey;
    editingCartItem?: CartItem | null;
    reopenCartOnSave?: boolean;
  } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // Ignore storage failures
    }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + getCartItemTotal(item), 0),
    [cart]
  );

  const buildCartSignature = (
    itemId: string,
    selectedSize: SizeKey,
    selectedExtras: ExtraOption[],
    notes: string
  ) => {
    const sortedExtraIds = [...selectedExtras]
      .map((e) => e.id)
      .sort()
      .join(',');
    return `${itemId}__${selectedSize}__${sortedExtraIds}__${notes.trim()}`;
  };

  const addItemToCart = (payload: {
    item: MenuItem;
    selectedSize: SizeKey;
    selectedExtras: ExtraOption[];
    quantity: number;
    notes: string;
  }) => {
    const { item, selectedSize, selectedExtras, quantity, notes } = payload;
    const unitPrice = item.prices[selectedSize];
    if (unitPrice == null) return;

    const signature = buildCartSignature(item.id, selectedSize, selectedExtras, notes);

    setCart((prev) => {
      const existing = prev.find((c) => c.cartItemId === signature);
      if (existing) {
        return prev.map((c) =>
          c.cartItemId === signature ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [
        ...prev,
        {
          cartItemId: signature,
          menuItemId: item.id,
          name: item.name,
          categoryId: item.categoryId,
          image: item.image,
          selectedSize,
          unitPrice,
          quantity,
          selectedExtras,
          notes: notes.trim() || undefined,
        },
      ];
    });

    const sizeTxt = selectedSize !== 'single' ? ` (${SIZE_LABELS[selectedSize]})` : '';
    showToast(`تمت إضافة ${item.name}${sizeTxt} إلى السلة`);
  };

  const handleSaveEditedCartItem = (
    originalCartItemId: string,
    payload: {
      item: MenuItem;
      selectedSize: SizeKey;
      selectedExtras: ExtraOption[];
      quantity: number;
      notes: string;
    }
  ) => {
    const { item, selectedSize, selectedExtras, quantity, notes } = payload;
    const unitPrice = item.prices[selectedSize];
    if (unitPrice == null) return;

    const newSignature = buildCartSignature(item.id, selectedSize, selectedExtras, notes);

    setCart((prev) => {
      const updatedItem: CartItem = {
        cartItemId: newSignature,
        menuItemId: item.id,
        name: item.name,
        categoryId: item.categoryId,
        image: item.image,
        selectedSize,
        unitPrice,
        quantity,
        selectedExtras,
        notes: notes.trim() || undefined,
      };

      const hasOtherSameSignature = prev.some(
        (c) => c.cartItemId === newSignature && c.cartItemId !== originalCartItemId
      );

      if (hasOtherSameSignature) {
        return prev
          .filter((c) => c.cartItemId !== originalCartItemId)
          .map((c) =>
            c.cartItemId === newSignature
              ? { ...c, quantity: c.quantity + quantity }
              : c
          );
      }

      return prev.map((c) => (c.cartItemId === originalCartItemId ? updatedItem : c));
    });

    showToast(`تم حفظ تعديلات ${item.name}`);
  };

  const handleEditCartItem = (cartItem: CartItem) => {
    const sourceItem = menuItems.find((m) => m.id === cartItem.menuItemId);
    if (!sourceItem) return;
    setIsCartOpen(false);
    setDetailState({
      item: sourceItem,
      initialSize: cartItem.selectedSize,
      editingCartItem: cartItem,
      reopenCartOnSave: true,
    });
  };

  const handleQuickAdd = (payload: {
    item: MenuItem;
    selectedSize: SizeKey;
    selectedExtras: ExtraOption[];
    quantity: number;
  }) => {
    addItemToCart({
      ...payload,
      notes: '',
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJumpToCategory = (catId: CategoryId | 'all') => {
    setActiveCategory(catId);
    scrollToMenu();
  };

  const activeDetailCategoryName = detailState
    ? categories.find((c) => c.id === detailState.item.categoryId)?.name ?? ''
    : '';

  return (
    <div className="min-h-screen bg-[#090909] text-[#F8F5EF] flex flex-col pb-14 md:pb-0">
      {showIntro && (
        <LogoIntro
          restaurantName={settings.restaurantName}
          tagline={settings.tagline}
          onComplete={handleIntroComplete}
        />
      )}

      <Header
        restaurantName={settings.restaurantName}
        tagline={settings.tagline}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          restaurantName={settings.restaurantName}
          tagline={settings.tagline}
          onOrderNow={scrollToMenu}
          onExploreMenu={scrollToMenu}
          onSelectCategory={handleJumpToCategory}
        />

        <FeaturedShowcase
          categories={categories}
          items={menuItems}
          onSelectCategory={handleJumpToCategory}
          onOpenDetail={(item, initialSize) =>
            setDetailState({ item, initialSize })
          }
          onQuickAdd={handleQuickAdd}
        />

        <MenuSection
          categories={categories}
          items={menuItems}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onOpenDetail={(item, initialSize) =>
            setDetailState({ item, initialSize })
          }
          onQuickAdd={handleQuickAdd}
        />

        {/* Direct WhatsApp Ordering Section */}
        <section
          id="contact"
          className="py-12 md:py-16 bg-[#0E0E0E] border-b border-[#F5B418]/15"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#171717] border border-[#F5B418]/25 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#F5B418] mb-1.5">
                  الطلب السريع المباشر
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F8F5EF]">
                  اطلب من <span dir="ltr">KAK ZONE</span> على واتساب
                </h2>
                <p className="text-sm text-[#A8A29E] mt-1.5 max-w-xl">
                  جهّز سلتك من المنيو أو تواصل مباشرة مع مطعم <span dir="ltr">KAK ZONE</span> على رقم الطلب المعتمد.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <a
                  href={`https://wa.me/${settings.whatsappNumberIntl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F5B418] hover:bg-[#E0AA10] text-[#090909] font-bold text-sm sm:text-base transition-colors min-h-[48px]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>واتساب: <span dir="ltr" className="tabular-nums">{settings.whatsappPhoneDisplay}</span></span>
                </a>
                <a
                  href={`tel:${settings.whatsappPhoneDisplay}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#DC1013] hover:bg-[#B91C1C] text-white font-semibold text-sm sm:text-base transition-colors min-h-[48px]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span dir="ltr" className="tabular-nums">{settings.whatsappPhoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Luxury Dark Footer with Original Extracted Logo */}
      <footer className="bg-[#060606] border-t border-[#F5B418]/20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={BRAND_MARK}
              alt={`شعار ${settings.restaurantName}`}
              className="w-14 h-14 rounded-full object-contain ring-1 ring-[#F5B418]/60 bg-[#171717] shrink-0"
            />
            <div>
              <p dir="ltr" className="font-display text-lg font-black text-[#F8F5EF] text-right">
                {settings.restaurantName}
              </p>
              <p className="text-xs text-[#A8A29E] mt-1">
                {settings.tagline} · جميع الحقوق محفوظة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#A8A29E]">
            <a href="#hero" className="hover:text-[#F8F5EF] transition-colors">
              الرئيسية
            </a>
            <a href="#featured" className="hover:text-[#F8F5EF] transition-colors">
              المختارات
            </a>
            <a href="#menu" className="hover:text-[#F8F5EF] transition-colors">
              المنيو
            </a>
            <a href="#contact" className="hover:text-[#F8F5EF] transition-colors">
              الطلب المباشر
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 h-[52px] bg-[#111111]/95 backdrop-blur-md border-t border-[#F5B418]/20 px-3 flex items-center justify-between gap-2">
        {cartCount > 0 ? (
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full h-9 px-4 rounded-xl bg-[#DC1013] text-white flex items-center justify-between text-xs font-semibold cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>عرض السلة</span>
              <span className="tabular-nums bg-black/25 px-1.5 py-0.5 rounded">
                {cartCount}
              </span>
            </span>
            <span className="tabular-nums font-bold">
              {formatPrice(cartSubtotal)}
            </span>
          </button>
        ) : (
          <nav aria-label="تنقل الجوال السريع" className="w-full flex items-center justify-around text-[11px] text-[#A8A29E]">
            <a href="#hero" className="flex items-center gap-1.5 py-1.5 px-2 text-[#F8F5EF]">
              <Home className="w-3.5 h-3.5 text-[#F5B418]" />
              <span>الرئيسية</span>
            </a>
            <a href="#menu" className="flex items-center gap-1.5 py-1.5 px-2 text-[#F8F5EF]">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#F5B418]" />
              <span>المنيو</span>
            </a>
            <a href="#contact" className="flex items-center gap-1.5 py-1.5 px-2 text-[#F8F5EF]">
              <PhoneCall className="w-3.5 h-3.5 text-[#F5B418]" />
              <span>الطلب المباشر</span>
            </a>
          </nav>
        )}
      </div>

      {/* Modals & Drawers */}
      <ProductModal
        item={detailState?.item ?? null}
        categoryName={activeDetailCategoryName}
        initialSize={detailState?.initialSize ?? 'single'}
        editingCartItem={detailState?.editingCartItem ?? null}
        onClose={() => {
          const shouldReopenCart = detailState?.reopenCartOnSave;
          setDetailState(null);
          if (shouldReopenCart) {
            setIsCartOpen(true);
          }
        }}
        onAddToCart={addItemToCart}
        onSaveEdit={(originalCartItemId, payload) => {
          handleSaveEditedCartItem(originalCartItemId, payload);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        menuItems={menuItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onEditItem={handleEditCartItem}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        settings={settings}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={() => {
          setCart([]);
          showToast('تم تجهيز طلبك وإفراغ السلة بنجاح');
        }}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#171717] border border-[#F5B418]/60 text-[#F8F5EF] text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xl transition-opacity duration-200 whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4 text-[#F5B418] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

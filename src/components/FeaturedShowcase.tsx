import { ArrowLeft, Plus, SlidersHorizontal } from 'lucide-react';
import { CategoryId, CategoryInfo, ExtraOption, MenuItem, SizeKey } from '../types/menu';
import { getFirstSelectableSize, getItemSizes } from '../utils/menuHelpers';
import { FoodImage } from './FoodImage';

interface FeaturedShowcaseProps {
  categories: CategoryInfo[];
  items: MenuItem[];
  onSelectCategory: (catId: CategoryId | 'all') => void;
  onOpenDetail: (item: MenuItem, initialSize: SizeKey) => void;
  onQuickAdd: (payload: {
    item: MenuItem;
    selectedSize: SizeKey;
    selectedExtras: ExtraOption[];
    quantity: number;
  }) => void;
}

export function FeaturedShowcase({
  categories,
  items,
  onSelectCategory,
  onOpenDetail,
  onQuickAdd,
}: FeaturedShowcaseProps) {
  const featuredItems = items.filter((item) => item.isFeatured && item.image).slice(0, 8);
  const photographedCategories = categories.filter((cat) => Boolean(cat.image));
  const textOnlyCategories = categories.filter((cat) => !cat.image);

  return (
    <section
      id="featured"
      className="py-12 md:py-16 bg-[#0E0E0E] text-[#F8F5EF] border-b border-[#F5B418]/15"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Featured Signature Dishes */}
        {featuredItems.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#F5B418] mb-1">
                  مختارات مطبخ <span dir="ltr">KAK ZONE</span>
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F8F5EF] text-balance">
                  أشهر أطباق البرجر والوينجز والفرايز
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#F5B418] hover:text-[#FDE68A] transition-colors cursor-pointer shrink-0"
              >
                <span>تصفح المنيو الكامل ({items.length} صنف)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredItems.map((item) => {
                const sizes = getItemSizes(item);
                const defaultSize = getFirstSelectableSize(item) ?? sizes[0] ?? 'single';
                const hasMultipleSizes = sizes.length > 1;
                const price = item.prices[defaultSize];
                const catName =
                  categories.find((c) => c.id === item.categoryId)?.name ?? '';
                const hasLongIngredients = Boolean(
                  item.description && item.description.trim().length > 62
                );

                return (
                  <article
                    key={item.id}
                    className="group bg-[#171717] border border-white/[0.08] hover:border-[#F5B418]/60 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 shadow-xl shadow-black/40"
                  >
                    {/* 1. Image */}
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item, defaultSize)}
                      className="relative aspect-[4/3] w-full overflow-hidden bg-[#101010] border-b border-white/[0.06] p-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B418]"
                    >
                      <FoodImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </button>

                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-xs text-[#F5B418] font-medium mb-1">
                        {catName}
                      </span>

                      {/* 2. Name */}
                      <button
                        type="button"
                        onClick={() => onOpenDetail(item, defaultSize)}
                        className="text-right cursor-pointer mb-1.5"
                      >
                        <h3 className="font-display text-base font-bold text-[#F8F5EF] group-hover:text-[#F5B418] transition-colors leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                      </button>

                      {/* 3. Ingredients + All Ingredients Modal Trigger */}
                      {item.description && (
                        <div className="mb-3">
                          <p className="text-xs text-[#A8A29E] leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                          {hasLongIngredients && (
                            <button
                              type="button"
                              onClick={() => onOpenDetail(item, defaultSize)}
                              className="mt-1 text-[11px] font-bold text-[#F5B418] hover:text-[#FDE68A] hover:underline transition-colors cursor-pointer"
                            >
                              كل المكونات
                            </button>
                          )}
                        </div>
                      )}

                      {/* 4. Fixed-Baseline Price Badge + 5. Two Action Buttons */}
                      <div className="mt-auto pt-3 border-t border-white/[0.07] space-y-2.5">
                        <div className="flex flex-col items-start justify-end min-h-[44px]">
                          <span className="text-[11px] font-medium text-[#A8A29E] leading-none mb-1 min-h-[12px]">
                            {hasMultipleSizes ? 'يبدأ من' : '\u00A0'}
                          </span>
                          {price != null && (
                            <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-[#F5B418] text-[#090909] shadow-sm">
                              <span className="font-display text-base font-black tabular-nums leading-none">
                                {price.toLocaleString('en-US')}
                              </span>
                              <span className="text-xs font-extrabold leading-none">
                                ج.م
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (hasMultipleSizes) {
                                onOpenDetail(item, defaultSize);
                              } else {
                                onQuickAdd({
                                  item,
                                  selectedSize: defaultSize,
                                  selectedExtras: [],
                                  quantity: 1,
                                });
                              }
                            }}
                            className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-[#DC1013] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>أضف</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenDetail(item, defaultSize)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#121212] hover:bg-[#1E1E1E] text-[#F5B418] border border-[#F5B418]/75 hover:border-[#F5B418] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer min-h-[40px]"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                            <span>خصّص طلبك</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories Row */}
        <div>
          <div className="mb-6">
            <p className="text-xs sm:text-sm font-semibold text-[#F5B418] mb-1">
              أقسام المنيو
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F8F5EF]">
              تصفح أقسام مطبخ <span dir="ltr">KAK ZONE</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-3.5">
            {photographedCategories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#141414] border border-white/[0.08] hover:border-[#F5B418]/70 text-right transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-lg p-2"
                >
                  <FoodImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#090909]/95 via-[#090909]/35 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-2.5 right-3 left-3">
                    <span className="font-display block text-sm font-bold text-[#F8F5EF] group-hover:text-[#F5B418] transition-colors leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-[#F5B418]/90 tabular-nums">
                      {count} صنف
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {textOnlyCategories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {textOnlyCategories.map((cat) => {
                const count = items.filter((i) => i.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="group bg-[#171717] hover:bg-[#1E1E1E] border border-white/[0.08] hover:border-[#F5B418]/60 rounded-xl px-4 py-3.5 text-right flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="font-display block text-sm sm:text-base font-bold text-[#F8F5EF] group-hover:text-[#F5B418] transition-colors">
                        {cat.name}
                      </span>
                      <span className="block text-xs text-[#A8A29E] truncate mt-0.5">
                        {cat.subtitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5B418] shrink-0">
                      <span className="tabular-nums">{count} صنف</span>
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

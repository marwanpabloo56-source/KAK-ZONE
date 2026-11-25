import { Plus, SlidersHorizontal } from 'lucide-react';
import { ExtraOption, MenuItem, SizeKey } from '../types/menu';
import {
  getFirstSelectableSize,
  getItemSizes,
} from '../utils/menuHelpers';
import { FoodImage } from './FoodImage';

interface ProductCardProps {
  item: MenuItem;
  categoryName: string;
  onOpenDetail: (item: MenuItem, initialSize: SizeKey) => void;
  onQuickAdd: (payload: {
    item: MenuItem;
    selectedSize: SizeKey;
    selectedExtras: ExtraOption[];
    quantity: number;
  }) => void;
}

export function ProductCard({
  item,
  categoryName,
  onOpenDetail,
  onQuickAdd,
}: ProductCardProps) {
  const sizes = getItemSizes(item);
  const defaultSize = getFirstSelectableSize(item) ?? sizes[0] ?? 'single';
  const hasMultipleSizes = sizes.length > 1;
  const startingPrice = item.prices[defaultSize];
  const hasLongIngredients = Boolean(item.description && item.description.trim().length > 56);

  const handlePrimaryAdd = () => {
    if (hasMultipleSizes) {
      onOpenDetail(item, defaultSize);
      return;
    }
    onQuickAdd({
      item,
      selectedSize: defaultSize,
      selectedExtras: [],
      quantity: 1,
    });
  };

  return (
    <article className="group flex flex-col bg-[#171717] border border-white/[0.08] hover:border-[#F5B418]/60 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 shadow-xl shadow-black/40">
      {/* 1. Product Image Stage */}
      {item.image && (
        <button
          type="button"
          onClick={() => onOpenDetail(item, defaultSize)}
          className="relative aspect-[4/3] w-full overflow-hidden bg-[#101010] border-b border-white/[0.06] p-2.5 sm:p-3 cursor-pointer text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B418]"
        >
          <FoodImage
            src={item.image}
            alt={item.illustrative ? 'صورة من منيو القسم' : item.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
            {item.illustrative && <span className="absolute top-2 right-2 rounded bg-black/80 px-2 py-1 text-[10px] text-white">صورة القسم</span>}
        </button>
      )}

      {/* Card Body: Name -> Ingredients -> Fixed-Baseline Price -> 2 Action Buttons */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4 lg:p-5">
        {/* Quiet Sub-Category Label */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#A8A29E] mb-1 min-h-[16px]">
          <span className="truncate font-medium">{item.subGroup || categoryName}</span>
          {item.isNew && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#F5B418] font-bold whitespace-nowrap">جديد</span>
            </>
          )}
        </div>

        {/* 2. Product Name */}
        <button
          type="button"
          onClick={() => onOpenDetail(item, defaultSize)}
          className="text-right cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B418] rounded"
        >
          <h3 className="font-display text-sm sm:text-base lg:text-[17px] font-bold text-[#F8F5EF] group-hover:text-[#F5B418] transition-colors leading-snug mb-1 line-clamp-2">
            {item.name}
          </h3>
        </button>

        {/* 3. Ingredients directly under name */}
        {item.description && (
          <div className="mb-3">
            <p className="text-[11px] sm:text-xs text-[#A8A29E] leading-relaxed line-clamp-2">
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

        {/* 4. Mustard-Yellow Price Badge (aligned baseline across side-by-side cards) + 5. Action Buttons */}
        <div className="mt-auto pt-2.5 border-t border-white/[0.07] space-y-2.5">
          {/* Price Row on its own line */}
          <div className="flex flex-col items-start justify-end min-h-[44px]">
            <span className="text-[10px] sm:text-[11px] font-medium text-[#A8A29E] leading-none mb-1 min-h-[12px]">
              {hasMultipleSizes ? 'يبدأ من' : '\u00A0'}
            </span>
            {startingPrice != null && (
              <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-[#F5B418] text-[#090909] shadow-sm">
                <span className="font-display text-sm sm:text-base font-black tabular-nums leading-none">
                  {startingPrice.toLocaleString('en-US')}
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold leading-none">
                  ج.م
                </span>
              </div>
            )}
          </div>

          {/* Two Side-by-Side Buttons (+ أضف | خصّص طلبك) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrimaryAdd}
              className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-[#DC1013] hover:bg-[#B91C1C] text-white transition-colors whitespace-nowrap shrink-0 min-h-[40px] sm:min-h-[42px] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>أضف</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDetail(item, defaultSize)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-[#121212] hover:bg-[#1E1E1E] text-[#F5B418] border border-[#F5B418]/75 hover:border-[#F5B418] transition-colors whitespace-nowrap min-h-[40px] sm:min-h-[42px] cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden sm:inline" />
              <span>خصّص طلبك</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

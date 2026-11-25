import { FormEvent, useMemo, useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageSquareText,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  CartItem,
  CustomerCheckoutInfo,
  RestaurantSettings,
} from '../types/menu';
import {
  formatPrice,
  formatWhatsappOrderMessage,
  getCartItemTotal,
} from '../utils/menuHelpers';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  settings: RestaurantSettings;
  onClose: () => void;
  onOrderCompleted: () => void;
}

export function CheckoutModal({
  isOpen,
  items,
  settings,
  onClose,
  onOrderCompleted,
}: CheckoutModalProps) {
  const [customer, setCustomer] = useState<CustomerCheckoutInfo>({
    name: '',
    phone: '',
    orderType: 'delivery',
    address: '',
    notes: '',
  });

  const [copied, setCopied] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getCartItemTotal(item), 0),
    [items]
  );

  const previewMessage = useMemo(
    () =>
      formatWhatsappOrderMessage({
        items,
        customer,
        settings,
        subtotal,
      }),
    [items, customer, settings, subtotal]
  );

  const whatsappUrl = `https://wa.me/${settings.whatsappNumberIntl}?text=${encodeURIComponent(
    previewMessage
  )}`;

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      setValidationError('برجاء إدخال الاسم ورقم الموبايل لإتمام الطلب.');
      return;
    }
    if (customer.orderType === 'delivery' && !customer.address.trim()) {
      setValidationError('برجاء إدخال عنوان التوصيل أو اختيار استلام من المطعم.');
      return;
    }
    setValidationError('');
    const orderRef = `KZ-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedRef(orderRef);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-4xl max-h-[93vh] bg-[#171717] border border-white/[0.1] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-5 py-4 bg-[#111111] border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 id="checkout-title" className="font-display text-lg sm:text-xl font-bold text-[#F8F5EF]">
              إتمام الطلب ومعاينة رسالة الواتساب
            </h2>
            <p className="text-xs text-[#A8A29E] mt-0.5">
              الإرسال المباشر إلى رقم <span dir="ltr" className="tabular-nums text-[#F5B418]">{settings.whatsappPhoneDisplay}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة إتمام الطلب"
            className="p-2 rounded-lg text-[#A8A29E] hover:text-[#F8F5EF] hover:bg-white/[0.06] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {submittedRef ? (
            <div className="py-8 max-w-xl mx-auto text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#F5B418]/15 border border-[#F5B418]/35 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#F5B418]" />
              </div>

              <div>
                <p className="text-xs text-[#F5B418] font-semibold mb-1">
                  اضغط على فتح واتساب لإرسال الطلب للمطعم
                </p>
                <h3 className="font-display text-2xl font-bold text-[#F8F5EF]">
                  تم تجهيز رسالة الطلب بنجاح
                </h3>
                <p className="text-sm text-[#A8A29E] mt-2 tabular-nums">
                  رقم المرجع: {submittedRef} · الإجمالي: {formatPrice(subtotal)}
                </p>
              </div>

              <div className="bg-[#090909] border border-white/[0.08] rounded-xl p-4 text-right">
                <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#F8F5EF]/90 leading-relaxed">
                  {previewMessage}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] border border-white/[0.1] text-sm font-medium text-[#F8F5EF] cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#F5B418]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم نسخ الرسالة' : 'نسخ نص الرسالة'}</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5B418] hover:bg-[#E0AA10] text-[#090909] text-sm font-bold cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح واتساب ({settings.whatsappPhoneDisplay})</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRef(null);
                    onOrderCompleted();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#DC1013] hover:bg-[#B91C1C] text-white text-sm font-semibold cursor-pointer"
                >
                  تأكيد وإفراغ السلة
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Form */}
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display text-base font-bold text-[#F8F5EF]">
                  بيانات الطلب
                </h3>

                {validationError && (
                  <p role="alert" className="text-xs text-[#F8F5EF] bg-[#DC1013]/20 border border-[#DC1013]/50 rounded-lg px-3.5 py-2.5">
                    {validationError}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#090909] border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setCustomer((c) => ({ ...c, orderType: 'delivery' }))}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      customer.orderType === 'delivery'
                        ? 'bg-[#DC1013] text-white'
                        : 'text-[#A8A29E] hover:text-[#F8F5EF]'
                    }`}
                  >
                    توصيل دليفري
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomer((c) => ({ ...c, orderType: 'pickup' }))}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      customer.orderType === 'pickup'
                        ? 'bg-[#DC1013] text-white'
                        : 'text-[#A8A29E] hover:text-[#F8F5EF]'
                    }`}
                  >
                    استلام من المطعم
                  </button>
                </div>

                <div>
                  <label htmlFor="cust-name" className="block text-xs font-medium text-[#A8A29E] mb-1.5">
                    الاسم *
                  </label>
                  <input
                    id="cust-name"
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                    placeholder="اكتب اسمك بالكامل"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090909] border border-white/[0.1] text-sm text-[#F8F5EF] placeholder:text-[#A8A29E]/50 focus:outline-none focus:border-[#F5B418]"
                  />
                </div>

                <div>
                  <label htmlFor="cust-phone" className="block text-xs font-medium text-[#A8A29E] mb-1.5">
                    رقم الموبايل *
                  </label>
                  <input
                    id="cust-phone"
                    type="tel"
                    required
                    dir="ltr"
                    value={customer.phone}
                    onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-right px-3.5 py-2.5 rounded-lg bg-[#090909] border border-white/[0.1] text-sm text-[#F8F5EF] placeholder:text-[#A8A29E]/50 focus:outline-none focus:border-[#F5B418] tabular-nums"
                  />
                </div>

                {customer.orderType === 'delivery' && (
                  <div>
                    <label htmlFor="cust-address" className="block text-xs font-medium text-[#A8A29E] mb-1.5">
                      العنوان *
                    </label>
                    <input
                      id="cust-address"
                      type="text"
                      required
                      value={customer.address}
                      onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                      placeholder="المنطقة، الشارع، رقم العمارة والدور"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#090909] border border-white/[0.1] text-sm text-[#F8F5EF] placeholder:text-[#A8A29E]/50 focus:outline-none focus:border-[#F5B418]"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="cust-notes" className="block text-xs font-medium text-[#A8A29E] mb-1.5">
                    ملاحظات الطلب (اختياري)
                  </label>
                  <textarea
                    id="cust-notes"
                    rows={3}
                    value={customer.notes}
                    onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))}
                    placeholder="أي تفاصيل إضافية عن التوصيل أو الطلب..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090909] border border-white/[0.1] text-sm text-[#F8F5EF] placeholder:text-[#A8A29E]/50 focus:outline-none focus:border-[#F5B418] resize-none"
                  />
                </div>
              </form>

              {/* Live WhatsApp Order Message Preview */}
              <div className="flex flex-col bg-[#090909] border border-white/[0.08] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-[#111111] border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-[#F5B418]" />
                    <span className="font-display text-sm font-bold text-[#F8F5EF]">
                      معاينة رسالة واتساب الطلب
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs text-[#F5B418] hover:underline cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto max-h-[360px]">
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#F8F5EF]/90 leading-relaxed">
                    {previewMessage}
                  </pre>
                </div>

                <div className="px-4 py-3 bg-[#111111] border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A8A29E]">
                  <span>واتساب الطلبات</span>
                  <span dir="ltr" className="text-[#F5B418] font-bold tabular-nums">
                    {settings.whatsappPhoneDisplay}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Submit */}
        {!submittedRef && (
          <div className="p-4 sm:p-5 bg-[#111111] border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-[#A8A29E]">الإجمالي التقديري: </span>
              <span className="font-display text-lg font-bold text-[#F5B418] tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="px-7 py-3 rounded-lg bg-[#DC1013] hover:bg-[#B91C1C] text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer min-h-[48px]"
            >
              تجهيز رسالة واتساب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

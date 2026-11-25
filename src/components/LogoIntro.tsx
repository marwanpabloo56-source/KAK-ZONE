import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BRAND_LOGO } from '../data/menuData';

interface LogoIntroProps {
  restaurantName: string;
  tagline: string;
  onComplete: () => void;
}

const INTRO_TOTAL_MS = 2300;
const INTRO_FADE_START_MS = 1850;
const REDUCED_TOTAL_MS = 800;
const REDUCED_FADE_START_MS = 600;

export function LogoIntro({ restaurantName, tagline, onComplete }: LogoIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const completedRef = useRef(false);

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const fadeDelay = prefersReducedMotion ? REDUCED_FADE_START_MS : INTRO_FADE_START_MS;
    const endDelay = prefersReducedMotion ? REDUCED_TOTAL_MS : INTRO_TOTAL_MS;

    const fadeTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, fadeDelay);

    const endTimer = window.setTimeout(() => {
      finishIntro();
    }, endDelay);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        setIsFadingOut(true);
        window.setTimeout(finishIntro, 200);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(fadeTimer);
      window.clearTimeout(endTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [prefersReducedMotion]);

  const handleSkip = () => {
    setIsFadingOut(true);
    window.setTimeout(finishIntro, prefersReducedMotion ? 50 : 220);
  };

  return (
    <motion.div
      role="presentation"
      aria-label={`شاشة الترحيب - ${restaurantName}`}
      initial={{ opacity: 1 }}
      animate={{
        opacity: isFadingOut ? 0 : 1,
        scale: isFadingOut && !prefersReducedMotion ? 1.02 : 1,
      }}
      transition={{
        duration: prefersReducedMotion ? 0.2 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={handleSkip}
      className="fixed inset-0 z-[100] bg-[#080808] flex flex-col items-center justify-center px-6 overflow-hidden select-none cursor-pointer"
    >
      {/* Gentle Red & Gold Cinematic Ambient Lighting Layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(245, 180, 24, 0.16) 0%, rgba(220, 16, 19, 0.12) 34%, rgba(8, 8, 8, 0) 68%)',
        }}
      />
      <motion.div
        aria-hidden="true"
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.7 }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.7 }
            : { opacity: [0.15, 0.55, 0.4], scale: [0.85, 1.12, 1.05] }
        }
        transition={{
          duration: 1.9,
          ease: 'easeOut',
        }}
        className="pointer-events-none absolute w-80 h-80 sm:w-[440px] sm:h-[440px] rounded-full bg-[#DC1013]/20 blur-[95px] -translate-y-6"
      />

      {/* Center Stage: Original KAK ZONE Brick-Wall Sign Logo + Gold Glow */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        <div className="relative flex items-center justify-center">
          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.75 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.55 }
                : { opacity: [0, 0.8, 0.55], scale: [0.78, 1.08, 1.02] }
            }
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 rounded-full bg-[#F5B418]/30 blur-2xl scale-110"
          />

          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.82 }}
            animate={{ opacity: 0.65, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -inset-3 rounded-full border border-[#F5B418]/35"
          />
          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.88 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -inset-6 rounded-full border border-[#DC1013]/30"
          />

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.72 }
            }
            animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.02 }}
            transition={{
              opacity: { duration: 0.7, ease: 'easeOut' },
              scale: { duration: 1.9, ease: [0.22, 1, 0.36, 1] },
            }}
            className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 rounded-full overflow-hidden ring-2 ring-[#F5B418]/80 shadow-[0_0_65px_rgba(245,180,24,0.34)] bg-[#140A08]"
          >
            {!logoFailed ? (
              <img
                src={BRAND_LOGO}
                alt={`شعار ${restaurantName}`}
                onError={() => setLogoFailed(true)}
                className="w-full h-full object-contain rounded-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#141414] text-[#F5B418] p-4">
                <span className="font-display text-3xl font-black text-[#F5B418]">
                  KAK ZONE
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Brand Identity Reveal Underneath */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: prefersReducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 flex flex-col items-center"
        >
          <h1
            dir="ltr"
            className="font-display text-3xl sm:text-4xl font-black text-[#F8F5EF] tracking-tight"
          >
            {restaurantName}
          </h1>

          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.75, delay: prefersReducedMotion ? 0 : 0.45, ease: 'easeOut' }}
            className="mt-3 mb-2.5 h-[1.5px] w-28 bg-gradient-to-r from-transparent via-[#F5B418] to-transparent"
          />

          <p className="text-xs sm:text-sm font-medium text-[#F5B418]/90">
            {tagline}
          </p>
        </motion.div>
      </div>

      {/* Subtle Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs text-[#A8A29E]/75 hover:text-[#F8F5EF] transition-colors cursor-pointer"
      >
        تخطي
      </button>
    </motion.div>
  );
}

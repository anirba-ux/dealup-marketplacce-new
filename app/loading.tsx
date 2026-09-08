import Image from "next/image";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main
      className="
        fixed
        inset-0
        z-[99999]
        flex
        min-h-[100dvh]
        items-center
        justify-center
        overflow-hidden
        bg-white
        dark:bg-[#07111f]
      "
    >
      {/* =====================================================
          SOFT BACKGROUND GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-72
          w-72
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-blue-500/5
          blur-3xl
          dark:bg-blue-500/10
        "
      />

      {/* =====================================================
          LOADER CONTENT
      ====================================================== */}

      <div className="relative z-10 flex flex-col items-center">
        {/* ===================================================
            DEALUP D LOGO
        ==================================================== */}

        <div
          className="
            relative
            h-28
            w-28
            sm:h-32
            sm:w-32
          "
        >
          {/* Animated glow */}

          <div
            className={`
              absolute
              inset-2
              rounded-full
              bg-gradient-to-b
              from-[#1565d8]/30
              via-[#1976f3]/10
              to-[#f5a623]/30
              blur-2xl
              ${styles.logoGlow}
            `}
          />

          {/* Logo */}

          <div
            className={`
              relative
              flex
              h-full
              w-full
              items-center
              justify-center
              ${styles.logoFloat}
            `}
          >
            <Image
              src="/icons/dealup-icon-192.png"
              alt="DealUp"
              width={128}
              height={128}
              priority
              className={`
                h-auto
                w-24
                object-contain
                sm:w-28
                ${styles.logoColor}
              `}
            />
          </div>
        </div>

        {/* ===================================================
            LOADING DOTS
        ==================================================== */}

        <div className="mt-7 flex items-center gap-2">
          <span
            className={`${styles.loadingDot} ${styles.dot1}`}
          />

          <span
            className={`${styles.loadingDot} ${styles.dot2}`}
          />

          <span
            className={`${styles.loadingDot} ${styles.dot3}`}
          />
        </div>

        {/* ===================================================
            LOADING TEXT
        ==================================================== */}

        <p
          className="
            mt-3
            text-sm
            font-medium
            tracking-wide
            text-slate-400
            dark:text-slate-500
          "
        >
          Loading...
        </p>
      </div>
    </main>
  );
}
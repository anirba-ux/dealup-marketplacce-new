import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="DealUp Home"
      className="
        relative
        flex
        shrink-0
        items-center
        top-[2px]
        left-[2px]
        md:top-0
        md:left-0
      "
    >
      {/* =====================================================
          LIGHT THEME LOGO
          Light theme → normal/light background logo
      ====================================================== */}

      <Image
        src="/images/dealup-logo.png"
        alt="DealUp Logo"
        width={190}
        height={60}
        priority
        className="
          h-auto
          w-[128px]
          object-contain
          dark:hidden
          sm:w-[145px]
          md:w-[190px]
        "
      />

      {/* =====================================================
          DARK THEME LOGO
          Dark theme → light logo
      ====================================================== */}

      <Image
        src="/images/dealup-dark-logo.png"
        alt="DealUp Logo"
        width={190}
        height={60}
        priority
        className="
          hidden
          h-auto
          w-[128px]
          object-contain
          dark:block
          sm:w-[145px]
          md:w-[190px]
        "
      />
    </Link>
  );
}
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="DealUp Home"
      className="
        flex
        items-center
        mb-4
        shrink-0
      "
    >
      {/* Light Theme Logo */}
      <Image
        src="/images/dealup-logo.png"
        alt="DealUp Logo"
        width={190}
        height={60}
        priority
        className="
          object-contain
          dark:hidden
        "
      />

      {/* Dark Theme Logo */}
      <Image
        src="/images/dealup-dark-logo.png"
        alt="DealUp Logo"
        width={190}
        height={60}
        priority
        className="
          hidden
          object-contain
          dark:block
        "
      />
    </Link>
  );
}
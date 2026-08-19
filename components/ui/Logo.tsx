import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center mb-4">
      <Image
        src="/images/dealup-logo.png"
        alt="DealUp Logo"
        width={190}
        height={60}
        priority
        className="object-contain"
      />
    </Link>
  );
}
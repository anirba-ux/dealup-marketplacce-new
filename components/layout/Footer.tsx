import Link from "next/link";
import Container from "@/components/ui/Container";

import {
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <Container>
        {/* Top Footer */}
        <div className="grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-5">

          {/* Company Info */}
          <div className="lg:col-span-2">

            <h2 className="text-3xl font-bold text-[#1565d8]">
              DealUp
            </h2>

            <p className="mt-5 max-w-md leading-8 text-slate-400">
              DealUp is your trusted local marketplace where buyers and
              sellers connect safely to trade products within their
              nearby cities.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">
                <MapPin
                  size={18}
                  className="text-[#1565d8]"
                />

                <span className="text-slate-300">
                  Bansberia, Hooghly, West Bengal
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="text-[#1565d8]"
                />

                <span className="text-slate-300">
                  support@dealup.in
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="text-[#1565d8]"
                />

                <span className="text-slate-300">
                  +91 XXXXX XXXXX
                </span>
              </div>

            </div>

          </div>

          {/* Company */}

          <div>

            <h3 className="mb-5 text-xl font-semibold">
              Company
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Careers
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Blog
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Contact
                </Link>
              </li>

            </ul>

          </div>

          {/* Support */}

          <div>

            <h3 className="mb-5 text-xl font-semibold">
              Support
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Help Center
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Safety Tips
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Report User
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  FAQs
                </Link>
              </li>

            </ul>

          </div>

          {/* Legal */}

          <div>

            <h3 className="mb-5 text-xl font-semibold">
              Legal
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Cookie Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-[#1565d8]"
                >
                  Refund Policy
                </Link>
              </li>

            </ul>

          </div>

        </div>

        {/* Bottom Footer */}

        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-800 py-8 md:flex-row">

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} DealUp. All rights reserved.
          </p>

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="rounded-full bg-slate-800 p-3 transition hover:bg-[#1565d8]"
            >
              <Globe size={18} />
            </Link>

            <Link
              href="/"
              className="rounded-full bg-slate-800 p-3 transition hover:bg-[#1565d8]"
            >
              <Mail size={18} />
            </Link>

            <Link
              href="/"
              className="rounded-full bg-slate-800 p-3 transition hover:bg-[#1565d8]"
            >
              <Phone size={18} />
            </Link>

          </div>

        </div>
      </Container>
    </footer>
  );
}
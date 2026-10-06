import Link from "next/link";
import Image from "next/image";

import Container from "@/components/ui/Container";
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe";

import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

/* ============================================================
   FOOTER LINKS
============================================================ */

const companyLinks = [
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const supportLinks = [
  {
    label: "Safety Tips",
    href: "/safety",
  },
  {
    label: "Verified Sellers",
    href: "/verified-sellers",
  },
  {
    label: "Sell Faster",
    href: "/sell-faster",
  },
  {
    label: "Help Center",
    href: "/help",
  },
];

const legalLinks = [
  {
    label: "Terms of Service",
    href: "/terms",
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Refund Policy",
    href: "/refund",
  },
  {
    label: "Shipping Policy",
    href: "/shipping",
  },
];

/* ============================================================
   SOCIAL LINKS
============================================================ */

const facebookUrl =
  "https://www.facebook.com/share/1DdpwdbnAR/";

const whatsappUrl =
  "https://wa.me/918240060110";

/*
  Instagram and YouTube URLs are intentionally not
  invented. Add your official profile URLs here
  when they are available.
*/

const instagramUrl = "https://www.instagram.com/dealupmarketplace/";
const youtubeUrl = "https://www.youtube.com/channel/UCTtWf7wJ393j_kQ4w3HiG8A";

/* ============================================================
   FOOTER
============================================================ */

export default function Footer() {
  return (
    <footer
      className="
        relative
        isolate
        bg-[#eef4fc]
        px-2
        pb-3
        pt-12
        text-slate-900
        transition-colors
        duration-300
        dark:bg-[#091426]
        dark:text-white
        sm:px-4
        sm:pb-5
        sm:pt-16
        lg:pt-20

        before:pointer-events-none
        before:absolute
        before:-top-20
        before:left-0
        before:right-0
        before:h-20
        before:bg-slate-50
        before:content-['']

        dark:before:bg-[#0D162A]
      "
    >
      <Container>
        {/* ==================================================
            OUTER FRAME
        =================================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-slate-50
            p-1.5
            shadow-[0_20px_60px_rgba(15,23,42,0.08)]
            transition-all
            duration-300
            dark:border-white/10
            dark:bg-[#0D162A]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            sm:rounded-[32px]
            sm:p-2
            lg:rounded-[36px]
            lg:p-2.5
          "
        >
          {/* ==================================================
              MAIN BLUE PANEL
          =================================================== */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[23px]
              bg-gradient-to-br
              from-[#63a9f5]
              via-[#3988df]
              to-[#1767cf]
              px-5
              py-7
              text-white
              transition-all
              duration-300

              dark:from-[#1d518f]
              dark:via-[#17457f]
              dark:to-[#123667]

              sm:rounded-[27px]
              sm:px-7
              sm:py-8

              lg:rounded-[30px]
              lg:px-8
              lg:py-9
            "
          >
            {/* ==================================================
                DECORATIVE CIRCLE - TOP RIGHT
            =================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-24
                h-52
                w-52
                rounded-full
                border
                border-white/15
                bg-white/5

                sm:h-64
                sm:w-64
              "
            />

            {/* ==================================================
                DECORATIVE CIRCLE - BOTTOM LEFT
            =================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -bottom-28
                -left-24
                h-56
                w-56
                rounded-full
                border
                border-white/10
                bg-white/5

                sm:h-64
                sm:w-64
              "
            />

            {/* ==================================================
                MAIN GRID
            =================================================== */}

            <div
              className="
                relative
                grid
                gap-9

                md:grid-cols-2
                md:gap-x-10
                md:gap-y-10

                lg:grid-cols-[1.5fr_0.75fr_0.85fr_1.4fr]
                lg:gap-8

                xl:grid-cols-[1.55fr_0.7fr_0.8fr_1.45fr]
              "
            >
              {/* ==================================================
                  BRAND / ABOUT
              =================================================== */}

              <div className="min-w-0">
                {/* DealUp Logo */}

                <Link
                  href="/"
                  aria-label="DealUp Home"
                  className="
                    inline-flex
                    items-center
                    rounded-xl
                    transition-transform
                    duration-200
                    hover:scale-[1.02]
                  "
                >
                  <div
                    className="
                      flex
                      min-h-10
                      min-w-10
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-xl
                      border
                      border-white/25
                      bg-white/10
                      px-2.5
                      py-2
                      backdrop-blur-sm

                      sm:min-h-11
                      sm:min-w-11
                      sm:rounded-2xl
                      sm:px-3
                    "
                  >
                    <Image
                      src="/images/dealup-logo.png"
                      alt="DealUp"
                      width={140}
                      height={48}
                      priority
                      className="
                        h-auto
                        w-[108px]
                        object-contain
                        sm:w-[120px]
                      "
                    />
                  </div>
                </Link>

                {/* Description */}

                <p
                  className="
                    mt-5
                    max-w-sm
                    text-sm
                    leading-6
                    text-white/85
                  "
                >
                  Buy and sell products easily within your
                  nearby cities. Connect with local buyers
                  and trusted sellers on DealUp.
                </p>

                {/* Start Selling */}

                <Link
                  href="/sell"
                  className="
                    group
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-white
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    text-[#1565d8]
                    shadow-lg
                    transition-all
                    duration-200

                    hover:-translate-y-0.5
                    hover:bg-slate-50
                    hover:shadow-xl

                    active:scale-95

                    sm:text-sm
                  "
                >
                  <span>Start Selling</span>

                  <ArrowUpRight
                    className="
                      h-3.5
                      w-3.5
                      transition-transform
                      duration-200

                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                    "
                  />
                </Link>

                {/* ==================================================
                    SOCIAL MEDIA
                =================================================== */}

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    Follow DealUp
                  </p>

                  <div className="flex items-center gap-2.5">
                    {/* Facebook */}

                    <SocialIconButton
                      href={facebookUrl}
                      label="Facebook"
                      icon={<FaFacebookF />}
                      hoverClass="hover:text-[#1877F2]"
                    />

                    {/* Instagram */}

                    <SocialIconButton
                      href={instagramUrl}
                      label="Instagram"
                      icon={<FaInstagram />}
                      hoverClass="hover:text-[#E1306C]"
                    />

                    {/* YouTube */}

                    <SocialIconButton
                      href={youtubeUrl}
                      label="YouTube"
                      icon={<FaYoutube />}
                      hoverClass="hover:text-[#FF0000]"
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================
                  COMPANY
              =================================================== */}

              <div className="pt-3 sm:pt-4">
                <FooterColumn
                  title="Company"
                  links={companyLinks}
                />
              </div>

              {/* ==================================================
                  SUPPORT
              =================================================== */}

              <div className="pt-3 sm:pt-4">
                <FooterColumn
                  title="Support"
                  links={supportLinks}
                />
              </div>

              {/* ==================================================
                  NEWSLETTER
              =================================================== */}

              <div className="min-w-0 pt-3 sm:pt-4">
                <h3 className="text-sm font-bold text-white">
                  Subscribe to our Newsletter
                </h3>

                <p
                  className="
                    mt-2
                    max-w-sm
                    text-sm
                    leading-6
                    text-white/75
                  "
                >
                  Get marketplace updates, useful tips
                  and the latest DealUp news directly in
                  your inbox.
                </p>

                <div
                  className="
                    mt-8
                    w-full
                    max-w-[360px]
                  "
                >
                  <NewsletterSubscribe />
                </div>
              </div>
            </div>

            {/* ==================================================
                DIVIDER
            =================================================== */}

            <div
              className="
                relative
                mt-8
                border-t
                border-white/20
                pt-6

                lg:mt-9
              "
            >
              {/* ==================================================
                  CONTACT INFO
              =================================================== */}

              <div
                className="
                  grid
                  gap-4

                  sm:grid-cols-2

                  lg:grid-cols-[1fr_auto_1.2fr]
                  lg:items-center
                "
              >
                {/* EMAIL */}

                <a
                  href="mailto:dealupmarketplace@gmail.com"
                  aria-label="Email DealUp"
                  className="
                    inline-flex
                    min-w-0
                    items-center
                    gap-2
                    text-xs
                    text-white/80
                    transition-colors
                    duration-200
                    hover:text-white
                    sm:text-sm
                  "
                >
                  <Mail className="h-4 w-4 shrink-0" />

                  <span className="truncate">
                    dealupmarketplace@gmail.com
                  </span>
                </a>

                {/* ==================================================
                    PHONE + WHATSAPP + FACEBOOK
                =================================================== */}

                <div className="flex items-center gap-2">
                  {/* Phone */}

                  <a
                    href="tel:+918240060110"
                    aria-label="Call DealUp"
                    title="Call DealUp"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/15
                      bg-white/10
                      text-white/85
                      backdrop-blur-sm
                      transition-all
                      duration-200

                      hover:-translate-y-0.5
                      hover:bg-white
                      hover:text-[#1565d8]
                      hover:shadow-lg

                      active:scale-95
                    "
                  >
                    <Phone className="h-4 w-4" />
                  </a>

                  {/* WhatsApp */}

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp DealUp"
                    title="WhatsApp DealUp"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/15
                      bg-white/10
                      text-white/85
                      backdrop-blur-sm
                      transition-all
                      duration-200

                      hover:-translate-y-0.5
                      hover:bg-white
                      hover:text-[#25D366]
                      hover:shadow-lg

                      active:scale-95
                    "
                  >
                    <FaWhatsapp className="h-4 w-4" />
                  </a>

                  {/* Facebook */}

                  <SocialIconButton
                    href={facebookUrl}
                    label="Facebook"
                    icon={<FaFacebookF />}
                    hoverClass="hover:text-[#1877F2]"
                    compact
                  />
                </div>

                {/* LOCATION */}

                <div
                  className="
                    inline-flex
                    items-start
                    gap-2
                    text-xs
                    leading-5
                    text-white/80
                    sm:text-sm
                  "
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    Bansberia, Hooghly, West Bengal
                  </span>
                </div>
              </div>

              {/* ==================================================
                  TRUST MESSAGE
              =================================================== */}

              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-white/15
                  bg-white/5
                  px-4
                  py-3
                  text-[10px]
                  leading-5
                  text-white/70

                  sm:text-xs
                "
              >
                DealUp is built to make local buying and
                selling simple, convenient and trustworthy.
              </div>
            </div>
          </div>

          {/* ====================================================
              COPYRIGHT BAR
          ===================================================== */}

          <div
            className="
              mt-2
              flex
              flex-col
              gap-2
              rounded-[17px]
              bg-[#071426]
              px-4
              py-3.5
              text-[10px]
              text-slate-400

              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
              sm:py-3.5

              lg:rounded-[19px]
              lg:px-6
            "
          >
            <p>
              © {new Date().getFullYear()} DealUp. All
              rights reserved.
            </p>

            <p>
              Built for local buying &amp; selling.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

/* ============================================================
   FOOTER COLUMN
============================================================ */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-bold text-white">
        {title}
      </h3>

      <div className="mt-4 space-y-2.5">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="
              group
              flex
              w-fit
              items-center
              gap-1
              text-xs
              text-white/75
              transition-all
              duration-200

              hover:translate-x-0.5
              hover:text-white

              sm:text-sm
            "
          >
            <span>{link.label}</span>

            <ArrowUpRight
              className="
                h-3
                w-3
                -translate-x-1
                opacity-0
                transition-all
                duration-200

                group-hover:translate-x-0
                group-hover:opacity-100
              "
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SOCIAL ICON BUTTON
============================================================ */

function SocialIconButton({
  href,
  label,
  icon,
  hoverClass,
  compact = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  hoverClass: string;
  compact?: boolean;
}) {
  const isAvailable = href.trim().length > 0;

  if (!isAvailable) {
    return (
      <span
        aria-label={`${label} coming soon`}
        title={`${label} coming soon`}
        className={`
          flex
          ${compact ? "h-9 w-9" : "h-10 w-10"}
          cursor-default
          items-center
          justify-center
          rounded-full
          border
          border-white/15
          bg-white/10
          text-white/70
          backdrop-blur-sm
        `}
      >
        <span
          className={
            compact
              ? "text-[15px]"
              : "text-[17px]"
          }
        >
          {icon}
        </span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`
        group
        flex
        ${compact ? "h-9 w-9" : "h-10 w-10"}
        items-center
        justify-center
        rounded-full
        border
        border-white/15
        bg-white/10
        text-white/85
        backdrop-blur-sm
        shadow-sm
        transition-all
        duration-200

        hover:-translate-y-1
        hover:bg-white
        hover:shadow-lg

        active:scale-95

        ${hoverClass}
      `}
    >
      <span
        className="
          transition-transform
          duration-200
          group-hover:scale-110
        "
      >
        {icon}
      </span>
    </a>
  );
}
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Company", href: "#company" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 py-4 sm:py-5">
      <div className="flex items-center justify-between">
        {/* Zone 1: Logo & Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="BharatVoice Logo"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg"
            priority
          />
          <span className="font-sans font-semibold text-base sm:text-lg tracking-tight text-[#191919]">
            BharatVoice
          </span>
        </Link>

        {/* Zone 2: Center Navigation Links (hidden below md) */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-[#191919]/70 hover:text-[#191919] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: CTA */}
        <div className="flex items-center">
          <Link
            href="#demo"
            className="px-5 py-2.5 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors duration-200"
          >
            Book A Demo
          </Link>
        </div>
      </div>
    </header>
  );
}

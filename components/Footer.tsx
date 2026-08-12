import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-slate-800/60 text-slate-400 py-12 md:py-16 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold tracking-wider text-white flex items-center">
                <span className="text-blue-500 mr-1">G</span>
                ADGET
                <span className="text-blue-500">B</span>
                ROO
              </h1>
            </Link>
            <p className="text-sm">
              Your one-stop gadget shop.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition-colors text-sm">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors text-sm">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>mahamudul.dev@gmail.com</li>
              <li>+8801881835612</li>
              <li className="leading-relaxed">
                Brothers Computer Zone, Sachibunia Bazar, Lobonchora,<br />
                Khulna
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 text-center text-sm flex flex-col items-center justify-center">
          <p>© 2026 GadgetBroo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

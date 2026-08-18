import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';

export default async function Footer() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "global" }
  });

  return (
    <footer className="bg-background border-t border-border text-muted-foreground py-12 md:py-16 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              {settings?.bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.bannerUrl} alt="GadgetBroo" className="h-8 w-auto object-contain" />
              ) : (
                <h1 className="text-3xl font-bold tracking-wider text-foreground flex items-center">
                  <span className="text-blue-500 mr-1">G</span>
                  ADGET
                  <span className="text-blue-500">B</span>
                  ROO
                </h1>
              )}
            </Link>
            <p className="text-sm">
              Your one-stop gadget shop.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-foreground transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-foreground transition-colors text-sm">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>{settings?.contactEmail || "mahamudul.dev@gmail.com"}</li>
              <li>{settings?.contactPhone || "+8801881835612"}</li>
              <li className="leading-relaxed whitespace-pre-wrap">
                {settings?.contactAddress || "Brothers Computer Zone, Sachibunia Bazar, Lobonchora,\nKhulna"}
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm flex flex-col items-center justify-center">
          <p>© {new Date().getFullYear()} GadgetBroo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

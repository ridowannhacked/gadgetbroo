import prisma from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // Ensure we get latest zones

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout");
  }

  const [zones, addresses] = await Promise.all([
    prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: [
        { stateName: "asc" },
        { cityName: "asc" }
      ],
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    })
  ]);

  // Group the zones by State/Division for the dropdowns
  const groupedZones = zones.reduce((acc, zone) => {
    if (!acc[zone.stateName]) {
      acc[zone.stateName] = [];
    }
    acc[zone.stateName].push({
      id: zone.id,
      city: zone.cityName,
      fee: Number(zone.deliveryFee),
    });
    return acc;
  }, {} as Record<string, { id: string; city: string; fee: number }[]>);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-8">
          Secure Checkout
        </h1>
        
        <CheckoutClient 
          groupedZones={groupedZones} 
          user={session.user} 
          savedAddresses={addresses} 
        />
      </div>
    </div>
  );
}

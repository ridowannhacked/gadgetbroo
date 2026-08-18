import { unauthorized } from "next/navigation";
import { getServerSession } from "@/helpers/get-servesession";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import AddressListClient from "./AddressListClient";

export const metadata: Metadata = {
  title: "My Addresses - GadgetBroo",
};

export default async function AddressesPage() {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) unauthorized();

  const [addresses, zones] = await Promise.all([
    prisma.address.findMany({
      where: { 
        userId: user.id,
        isDeleted: false
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: [
        { stateName: "asc" },
        { cityName: "asc" }
      ],
    })
  ]);

  const groupedZones = zones.reduce((acc, zone) => {
    if (!acc[zone.stateName]) acc[zone.stateName] = [];
    acc[zone.stateName].push({ id: zone.id, city: zone.cityName, fee: Number(zone.deliveryFee) });
    return acc;
  }, {} as Record<string, { id: string; city: string; fee: number }[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Address Book</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your delivery addresses.</p>
      </div>
      <AddressListClient addresses={addresses} groupedZones={groupedZones} user={user} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  CreateShippingZoneButton,
  EditShippingZoneButton,
  DeleteShippingZoneButton,
  ShippingZoneData,
} from "./HandleShippingAction";

export default function ShippingZonesPage() {
  const [zones, setZones] = useState<ShippingZoneData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/shipping-zones");
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) {
        setZones(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch {
      toast.error("Failed to load shipping zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  const filteredZones = zones.filter(
    (zone) =>
      zone.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.stateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-200 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Shipping Zones
          </h1>
          <CreateShippingZoneButton onSuccess={fetchZones} />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input
            placeholder="Search by city or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#12151a]/80 border-slate-800/80 text-slate-200 placeholder:text-slate-500 w-full sm:max-w-md"
          />
        </div>

        <div className="bg-[#12151a]/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-sm font-medium border-b border-slate-800/60">
                  <th className="py-4 px-6">State / Division</th>
                  <th className="py-4 px-6">City / Area</th>
                  <th className="py-4 px-6">Delivery Fee</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No shipping zones found.
                    </td>
                  </tr>
                ) : filteredZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{zone.stateName}</td>
                    <td className="py-4 px-6 text-slate-300">{zone.cityName}</td>
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      ৳{Number(zone.deliveryFee).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${zone.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}>
                        {zone.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <EditShippingZoneButton zone={zone} onSuccess={fetchZones} />
                        <DeleteShippingZoneButton zone={zone} onSuccess={fetchZones} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden divide-y divide-slate-800/60">
            {filteredZones.length === 0 ? (
              <p className="py-10 text-center text-slate-500 text-sm">No shipping zones found.</p>
            ) : filteredZones.map((zone) => (
              <div key={zone.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white">{zone.cityName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{zone.stateName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <EditShippingZoneButton zone={zone} onSuccess={fetchZones} />
                    <DeleteShippingZoneButton zone={zone} onSuccess={fetchZones} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800/40">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${zone.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-gray-500/10 text-gray-400"
                    }`}>
                    {zone.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="font-semibold text-slate-200">
                    ৳{Number(zone.deliveryFee).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface ShippingZoneData {
  id: string;
  stateName: string;
  cityName: string;
  deliveryFee: string | number;
  isActive: boolean;
}

export function CreateShippingZoneButton({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      stateName: formData.get("stateName"),
      cityName: formData.get("cityName"),
      deliveryFee: formData.get("deliveryFee"),
      isActive: formData.get("isActive") === "on",
    };

    try {
      const res = await fetch("/api/shipping-zones", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed");
      
      toast.success("Shipping zone created successfully");
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create shipping zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus size={16} />
          Add Shipping Zone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#12151a] border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Shipping Zone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="stateName">State/Division</Label>
            <Input id="stateName" name="stateName" required placeholder="e.g. Dhaka Division" className="bg-[#0a0a0a] border-slate-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cityName">City/Area</Label>
            <Input id="cityName" name="cityName" required placeholder="e.g. Dhaka City" className="bg-[#0a0a0a] border-slate-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryFee">Delivery Fee (৳)</Label>
            <Input id="deliveryFee" name="deliveryFee" type="number" step="0.01" required placeholder="60.00" className="bg-[#0a0a0a] border-slate-800" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isActive" name="isActive" defaultChecked className="w-4 h-4 rounded border-slate-800 bg-[#0a0a0a] text-blue-600" />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="bg-transparent border-slate-800 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : "Save Zone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditShippingZoneButton({ zone, onSuccess }: { zone: ShippingZoneData, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      stateName: formData.get("stateName"),
      cityName: formData.get("cityName"),
      deliveryFee: formData.get("deliveryFee"),
      isActive: formData.get("isActive") === "on",
    };

    try {
      const res = await fetch(`/api/shipping-zones/${zone.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed");
      
      toast.success("Shipping zone updated successfully");
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update shipping zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-blue-400 transition-colors p-1">
          <Edit2 size={16} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#12151a] border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Shipping Zone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="stateName">State/Division</Label>
            <Input id="stateName" name="stateName" defaultValue={zone.stateName} required className="bg-[#0a0a0a] border-slate-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cityName">City/Area</Label>
            <Input id="cityName" name="cityName" defaultValue={zone.cityName} required className="bg-[#0a0a0a] border-slate-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryFee">Delivery Fee (৳)</Label>
            <Input id="deliveryFee" name="deliveryFee" type="number" step="0.01" defaultValue={zone.deliveryFee as number} required className="bg-[#0a0a0a] border-slate-800" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isActive" name="isActive" defaultChecked={zone.isActive} className="w-4 h-4 rounded border-slate-800 bg-[#0a0a0a] text-blue-600" />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="bg-transparent border-slate-800 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteShippingZoneButton({ zone, onSuccess }: { zone: ShippingZoneData, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipping-zones/${zone.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed");
      
      toast.success("Shipping zone deleted successfully");
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete shipping zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-red-400 transition-colors p-1">
          <Trash2 size={16} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#12151a] border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Delete Shipping Zone</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-300">Are you sure you want to delete the shipping zone for <strong>{zone.cityName}, {zone.stateName}</strong>?</p>
          <p className="text-sm text-slate-500 mt-2">This action cannot be undone.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="bg-transparent border-slate-800 hover:bg-slate-800">
            Cancel
          </Button>
          <Button type="button" onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? "Deleting..." : "Delete Zone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

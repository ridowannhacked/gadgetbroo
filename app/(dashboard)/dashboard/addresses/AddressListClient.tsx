"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, MapPin, Trash2, Pencil, CheckCircle2, Loader2, X } from "lucide-react";
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type GroupedZones = Record<string, { id: string; city: string; fee: number }[]>;

export default function AddressListClient({ 
  addresses, 
  groupedZones, 
  user 
}: { 
  addresses: Address[];
  groupedZones: GroupedZones;
  user: any;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const otherAddresses = addresses.filter(a => a.id !== defaultAddress?.id);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingAction("add");
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("fullName", user.name || "Customer");
      await addAddress(formData);
      toast.success("Address added successfully");
      setIsAdding(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add address");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setLoadingAction("edit");
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("fullName", user.name || "Customer");
      await updateAddress(id, formData);
      toast.success("Address updated successfully");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update address");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoadingAction(`delete-${deletingId}`);
    try {
      await deleteAddress(deletingId);
      toast.success("Address deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address");
    } finally {
      setLoadingAction(null);
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setLoadingAction(`default-${id}`);
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to set default address");
    } finally {
      setLoadingAction(null);
    }
  };

  const AddressForm = ({ address, onSubmit, onCancel, isSaving }: any) => {
    const [selectedState, setSelectedState] = useState(address?.state || "");
    const [selectedCity, setSelectedCity] = useState(address?.city || "");

    const availableCities = selectedState ? groupedZones[selectedState] || [] : [];

    return (
      <form onSubmit={onSubmit} className="bg-card border border-border/60 rounded-2xl p-6 space-y-4 relative">
        <h3 className="text-lg font-bold text-foreground mb-4">{address ? "Edit Address" : "Add New Address"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
            <input disabled value={user.name || "Customer"} className="w-full bg-background border border-border text-muted-foreground text-sm rounded-lg px-4 py-2.5 outline-none opacity-70 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
            <input required name="phone" defaultValue={address?.phone} className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">State / Division</label>
            <select
              required
              name="state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity(""); // Reset city when state changes
              }}
              className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:border-primary outline-none appearance-none"
            >
              <option value="" disabled>Select State</option>
              {Object.keys(groupedZones).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">City / Area</label>
            <select
              required
              name="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:border-primary outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Select City</option>
              {availableCities.map(c => (
                <option key={c.city} value={c.city}>{c.city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Postal Code (Optional)</label>
            <input name="postalCode" defaultValue={address?.postalCode} className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:border-primary outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
            <input required name="line1" defaultValue={address?.line1} className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:border-primary outline-none" />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="isDefault" value="true" defaultChecked={address?.isDefault} id={`default-${address?.id || 'new'}`} className="w-4 h-4 rounded border-border bg-background" />
            <label htmlFor={`default-${address?.id || 'new'}`} className="text-sm text-foreground">Set as default shipping address</label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            Save Address
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-8">
      {/* Default Address Banner */}
      {defaultAddress && editingId !== defaultAddress.id && (
        <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Default Address
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{user.name || defaultAddress.fullName}</h3>
                <p className="text-muted-foreground text-sm mt-1">{defaultAddress.phone}</p>
                <p className="text-foreground mt-2 leading-relaxed">
                  {defaultAddress.line1}
                  <br />{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode && defaultAddress.postalCode}
                  <br />{defaultAddress.country}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={() => setEditingId(defaultAddress.id)} className="flex-1 sm:flex-none bg-card border border-border text-foreground hover:bg-accent px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Pencil size={16} /> Edit
              </button>
              <button 
                onClick={() => setDeletingId(defaultAddress.id)} 
                disabled={loadingAction === `delete-${defaultAddress.id}`}
                className="flex-1 sm:flex-none bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loadingAction === `delete-${defaultAddress.id}` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editingId === defaultAddress?.id && (
        <AddressForm 
          address={defaultAddress} 
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEditSubmit(e, defaultAddress.id)}
          onCancel={() => setEditingId(null)}
          isSaving={loadingAction === "edit"}
        />
      )}

      {/* Add New Button */}
      {!isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-card hover:bg-accent border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
            <Plus size={20} />
          </div>
          <span className="font-medium">Add New Address</span>
        </button>
      )}

      {isAdding && (
        <AddressForm 
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAdding(false)}
          isSaving={loadingAction === "add"}
        />
      )}

      {/* Other Addresses List */}
      {otherAddresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mt-10 mb-4 flex items-center gap-2">
            Other Saved Addresses <span className="bg-muted text-muted-foreground border border-border text-xs px-2 py-0.5 rounded-full">{otherAddresses.length}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherAddresses.map(address => editingId === address.id ? (
              <div key={address.id} className="md:col-span-2">
                <AddressForm 
                  address={address} 
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEditSubmit(e, address.id)}
                  onCancel={() => setEditingId(null)}
                  isSaving={loadingAction === "edit"}
                />
              </div>
            ) : (
              <div key={address.id} className="bg-card border border-border/60 hover:border-border rounded-xl p-5 transition-colors group relative">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                  <button onClick={() => setEditingId(address.id)} className="w-8 h-8 bg-muted text-muted-foreground hover:text-foreground rounded-md flex items-center justify-center transition-colors shadow-sm">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeletingId(address.id)} className="w-8 h-8 bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md flex items-center justify-center transition-colors shadow-sm">
                    {loadingAction === `delete-${address.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>

                <h4 className="font-bold text-foreground mb-1">{user.name || address.fullName}</h4>
                <p className="text-muted-foreground text-xs mb-3">{address.phone}</p>
                <p className="text-foreground text-sm leading-relaxed max-w-[85%] pr-8">
                  {address.line1}
                  <br />{address.city}, {address.state} {address.postalCode && address.postalCode}
                  <br />{address.country}
                </p>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <button 
                    onClick={() => handleSetDefault(address.id)}
                    disabled={loadingAction === `default-${address.id}`}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                  >
                    {loadingAction === `default-${address.id}` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Set as Default
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-[#0b0f19] border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Address</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {loadingAction?.startsWith("delete-") ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

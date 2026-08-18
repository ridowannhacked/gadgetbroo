"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Lock, User as UserIcon } from "lucide-react";

import { PasswordInput } from "@/components/password-input";

export default function ProfileSettingsClient({ user }: { user: any }) {
  const [name, setName] = useState(user.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");
    setIsUpdatingName(true);
    try {
      const { error } = await authClient.updateUser({ name });
      if (error) throw new Error(error.message);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Profile Info */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserIcon size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Profile Information</h2>
        </div>
        
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={user.email} 
              disabled 
              className="w-full bg-background border border-border text-muted-foreground text-sm rounded-lg px-4 py-3 opacity-70 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Email address cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={isUpdatingName || name === user.name}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
          >
            {isUpdatingName && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Change Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4" autoComplete="off">
          {/* Fake inputs to trap aggressive browser autofill */}
          <input type="text" name="fakeusernameremembered" style={{display: 'none'}} />
          <input type="password" name="fakepasswordremembered" style={{display: 'none'}} />
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Current Password</label>
            <PasswordInput 
              name="current_password_input"
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-background border-border text-foreground text-sm rounded-lg focus-visible:ring-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">New Password</label>
            <PasswordInput 
              name="new_password_input"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-background border-border text-foreground text-sm rounded-lg focus-visible:ring-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm New Password</label>
            <PasswordInput 
              name="confirm_password_input"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-background border-border text-foreground text-sm rounded-lg focus-visible:ring-primary transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
          >
            {isUpdatingPassword && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

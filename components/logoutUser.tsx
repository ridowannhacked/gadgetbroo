"use client";
import { Button } from "./ui/button";
import { handleSignOut } from "../helpers/signout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";


export default function LogoutButton() {
  const router = useRouter()

  const signoutUser = async () => {
    try {
      await handleSignOut();

      toast.success("Logged out successfully");
      router.push("/");
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  };
  return (
    <Button variant="ghost" className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground px-2 sm:px-4" onClick={signoutUser}>
      <LogOut size={18} className="sm:hidden" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}



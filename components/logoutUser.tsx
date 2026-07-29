"use client";

import { Button } from "./ui/button";
import { authClient } from "../lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message || "Logout failed");
      return;
    }

    toast.success("Logged out successfully");

    router.push('/');
  };

  return (
    <Button className="hover:text-white hover:bg-red-700 " onClick={handleSignOut}>
      Logout
    </Button>
  );
}

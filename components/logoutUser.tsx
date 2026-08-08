"use client";
import { Button } from "./ui/button";
import { handleSignOut } from "../helpers/signout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


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
    <Button className="hover:text-white hover:bg-red-700 " onClick={signoutUser}>
      Logout
    </Button>
  );
}



import { authClient } from "../lib/auth-client";

export const handleSignOut = async () => {
  const { error } = await authClient.signOut();

  if (error) {
    throw new Error(error.message || "User logout failed")
  }
};

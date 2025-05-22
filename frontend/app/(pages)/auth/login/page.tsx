"use client";

import { LoginDialog } from "@/components/login-dialog";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session } = useSession();

  useEffect(() => {
    // Redirect to homepage if already authenticated
    if (session) {
      redirect("/");
    }
  }, [session]);

  return <LoginDialog />;
}

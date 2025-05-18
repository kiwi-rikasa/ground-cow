"use client";

import { LoginForm } from "@/components/login-form";
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

  return <LoginForm />;
}

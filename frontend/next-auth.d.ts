import "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";
import { UserPublic } from "@/app/client";
declare module "next-auth" {
  interface Session {
    idToken?: string;
    error?: string;
    user: {
      id: string;
    } & DefaultSession["user"] &
      UserPublic["user_role"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    idToken?: string;
    error?: string;
    user: {
      id: string;
    } & DefaultSession["user"] &
      UserPublic["user_role"];
  }
}

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.provider === "google") {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.idToken) {
        session.idToken = token.idToken as string;
      }
      return session;
    },
  },
});

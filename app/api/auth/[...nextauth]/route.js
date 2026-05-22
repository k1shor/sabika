import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },

    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect url:", url);
      console.log("NextAuth redirect baseUrl:", baseUrl);

      try {
        // url could be a full URL or just a path
        const parsed = url.startsWith("http") ? new URL(url) : new URL(url, baseUrl);
        const role   = parsed.searchParams.get("role") || "visitor";
        console.log("Extracted role:", role);
        return `${baseUrl}/api/auth/google-session?role=${role}`;
      } catch (e) {
        console.error("redirect parse error:", e.message);
        return `${baseUrl}/api/auth/google-session?role=visitor`;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      await dbConnect();

      // Find or create the user in your DB
      let dbUser = await User.findOne({ email: user.email });

      if (!dbUser) {
        dbUser = await User.create({
          name:         profile.name,
          email:        user.email,
          passwordHash: "",
          role:         "visitor",
          isVerified:   true,
          provider:     "google",
        });
      }

      // Generate your own JWT exactly like login/route.js does
      const role = ["visitor", "blog_writer", "admin"].includes(dbUser.role)
        ? dbUser.role
        : "visitor";

      const token = signToken({
        id:    dbUser._id,
        name:  dbUser.name,
        email: dbUser.email,
        role,
      });

      // Set the same cookie your login route sets
      // so getAuthUser() can read it on dashboard/profile etc.
      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure:   process.env.NODE_ENV === "production",
        path:     "/",
        maxAge:   60 * 60 * 24, // 1 day
      });

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
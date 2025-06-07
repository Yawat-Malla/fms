import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            profilePicture: true,
            username: true,
          },
        });

        if (!user) {
          throw new Error('No user found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          username: user.username ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.id = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.profilePicture = user.profilePicture;
        token.username = user.username;
      }

      // Handle session updates
      if (trigger === "update" && session?.user) {
        // Update user fields from session
        Object.assign(token, {
          name: session.user.name ?? token.name,
          email: session.user.email ?? token.email,
          profilePicture: session.user.profilePicture ?? token.profilePicture,
          username: session.user.username ?? token.username,
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, {
          id: typeof token.id === 'string' ? parseInt(token.id, 10) : token.id,
          role: token.role,
          name: token.name,
          email: token.email,
          profilePicture: token.profilePicture,
          username: token.username,
        });
      }
      return session;
    },
  },
  events: {
    async updateUser(message) {
      // Handle user updates here if needed
      console.log('User updated:', message);
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Error code passed in query string as ?error=
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 
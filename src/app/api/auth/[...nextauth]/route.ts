import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: number;
    email: string;
    name: string | null;
    role: UserRole;
    profilePicture?: string | null;
  }

  interface Session {
    user: {
      id: number;
      email: string;
      name: string | null;
      role: UserRole;
      profilePicture?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    name: string | null;
    role: UserRole;
    profilePicture?: string | null;
  }
}

const handler = NextAuth(authOptions);

// Export the handler using proper Next.js API route format
export const GET = handler;
export const POST = handler;
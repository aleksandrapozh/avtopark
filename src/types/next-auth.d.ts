import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: number;
      role: string;
      lastName?: string | null;
      firstName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    userId: number;
    role: string;
    lastName: string;
    firstName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: number;
    role: string;
  }
}
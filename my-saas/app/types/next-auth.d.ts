// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPremium?: boolean;
    } & DefaultSession["user"];
  }

 export interface User extends DefaultUser {
    id: string;
    isPremium?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isPremium?: boolean;
  }
}

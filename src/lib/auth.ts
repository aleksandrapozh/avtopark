import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

// Только типы — они не тянут runtime-код в Edge-бандл
import type { User as UserEntity } from "@/lib/data-source";

const credentialsSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        // Динамический импорт — TypeORM загрузится только здесь,
        // в Node-рантайме, а не в Edge-версии этого файла.
        const { getDataSource, User } = await import("@/lib/data-source");

        const { login, password } = parsed.data;
        const ds = await getDataSource();
        const repo = ds.getRepository<UserEntity>(User);

        const user = await repo.findOne({ where: { login } });
        if (!user || user.isActive !== 1) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user.userId),
          userId: user.userId,
          login: user.login,
          email: user.email,
          role: user.role,
          lastName: user.lastName,
          firstName: user.firstName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).userId;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as number;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

// Auth configuration
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find admin user
        const admin = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!admin || !admin.isActive) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
          return null;
        }

        // Update last login
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  trustHost: true,
});

// Helper to require admin authentication in API routes
export async function requireAdmin(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    adminId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as { role?: string }).role,
  };
}

// Log admin action to audit log
export async function logAdminAction({
  adminId,
  action,
  targetType,
  targetId,
  details,
  request,
}: {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  request?: NextRequest;
}) {
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
      ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip"),
      userAgent: request?.headers.get("user-agent"),
    },
  });
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password utility
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

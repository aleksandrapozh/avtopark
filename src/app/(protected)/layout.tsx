import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    const h = await headers();
    const pathname = h.get("x-invoke-path") ?? "/dashboard";
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  const fullName =
    [session.user.lastName, session.user.firstName]
      .filter(Boolean)
      .join(" ") || session.user.email || "Пользователь";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role={session.user.role} userName={fullName} />
      <main style={{ flex: 1, padding: 24, background: "#f9fafb" }}>{children}</main>
    </div>
  );
}
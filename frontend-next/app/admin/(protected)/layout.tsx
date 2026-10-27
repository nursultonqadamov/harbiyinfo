import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  return <AdminShell username={session.username}>{children}</AdminShell>;
}

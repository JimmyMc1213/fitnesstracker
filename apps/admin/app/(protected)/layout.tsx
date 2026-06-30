import { redirect } from "next/navigation";

import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import { ToastProvider } from "../../components/Toast";
import { getAdminSession } from "../../lib/auth";
import { isAuthConfigured, isDevAuthBypass } from "../../lib/env";
import { getNavBadges } from "../../lib/data";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (isAuthConfigured() && !session && !isDevAuthBypass()) {
    redirect("/login");
  }

  const badges = await getNavBadges();
  const account = session ?? { name: "Owner", role: "owner" };

  return (
    <ToastProvider>
      <div className="app">
        <Sidebar badges={badges} account={{ name: account.name, role: account.role }} />
        <div className="main">
          <Topbar />
          <div className="content">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}

import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { CalendarCheck, CarFront, LayoutGrid, Settings } from "lucide-react";
import { useEffect } from "react";
import adminCss from "../admin.css?url";
import { LoginScreen, NotAdminScreen, RecoveryScreen } from "@/components/admin/auth-screens";
import { Spinner, ToastProvider } from "@/components/admin/ui";
import { useAdminAuth, useBookings } from "@/lib/admin-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ARDADAGCI Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "ARDADAGCI Admin" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "theme-color", content: "#f2f2f7", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#000000", media: "(prefers-color-scheme: dark)" },
    ],
    links: [
      { rel: "stylesheet", href: adminCss },
      { rel: "manifest", href: "/admin.webmanifest" },
      { rel: "apple-touch-icon", href: "/admin-icon-180.png" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { auth, refresh } = useAdminAuth();
  useEffect(() => {
    // Installable app (iOS "Zum Home-Bildschirm", Android "App installieren").
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => undefined);
  }, []);
  return (
    <div className="adm">
      <ToastProvider>
        {auth.status === "loading" && <Spinner />}
        {auth.status === "signed-out" && <LoginScreen setupOpen={auth.setupOpen} onDone={refresh} />}
        {auth.status === "recovery" && <RecoveryScreen onDone={refresh} />}
        {auth.status === "not-admin" && <NotAdminScreen auth={auth} onDone={refresh} />}
        {auth.status === "admin" && <AdminShell />}
      </ToastProvider>
    </div>
  );
}

function AdminShell() {
  const bookings = useBookings();
  const fresh = bookings.data?.filter((b) => b.status === "neu").length ?? 0;
  return (
    <>
      <main className="adm-main"><Outlet /></main>
      <div className="adm-tabbar">
        <nav aria-label="Admin-Navigation">
          <Link to="/admin" activeOptions={{ exact: true }} className="adm-tab"><LayoutGrid />Übersicht</Link>
          <Link to="/admin/fahrzeuge" className="adm-tab"><CarFront />Fahrzeuge</Link>
          <Link to="/admin/reservierungen" className="adm-tab"><CalendarCheck />Anfragen{fresh > 0 && <span className="adm-badge">{fresh}</span>}</Link>
          <Link to="/admin/einstellungen" className="adm-tab"><Settings />Einstellungen</Link>
        </nav>
      </div>
    </>
  );
}

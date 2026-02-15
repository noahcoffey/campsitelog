"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trees,
  LayoutDashboard,
  Compass,
  MapPin,
  Star,
  User,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Compass },
  { href: "/campgrounds", label: "Campgrounds", icon: MapPin },
  { href: "/reviews", label: "My Reviews", icon: Star },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-border">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-white">
          <Trees size={20} />
        </div>
        <span className="font-heading text-lg font-bold text-forest">
          CampLog
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-forest/10 text-forest"
                      : "text-text-secondary hover:bg-cream hover:text-forest"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition hover:bg-cream hover:text-danger"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

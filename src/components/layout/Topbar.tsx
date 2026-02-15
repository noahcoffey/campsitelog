"use client";

import { Trees, Menu } from "lucide-react";
import { useSession } from "next-auth/react";

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-text-secondary hover:bg-cream lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-white">
            <Trees size={16} />
          </div>
          <span className="font-heading text-lg font-bold text-forest">
            CampLog
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10 text-xs font-medium text-forest">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="hidden text-sm font-medium text-bark sm:inline">
              {session.user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

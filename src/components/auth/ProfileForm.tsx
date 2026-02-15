"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { User, LogOut, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ProfileFormProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSaving(false);
    if (res.ok) {
      setMessage("Profile updated!");
    } else {
      setMessage("Failed to update profile.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-xl font-bold text-forest">
          {user.name?.[0]?.toUpperCase() || <User size={24} />}
        </div>
        <div>
          <p className="text-lg font-semibold text-bark">{user.name}</p>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          id="name"
          label="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          id="email"
          label="Email"
          value={user.email || ""}
          disabled
          className="bg-cream"
        />

        {message && (
          <p className="text-sm text-forest">{message}</p>
        )}

        <div className="flex items-center justify-between">
          <Button type="submit" loading={saving}>
            <Save size={16} />
            Save Changes
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </form>
    </div>
  );
}

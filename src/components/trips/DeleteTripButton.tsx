"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function DeleteTripButton({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/trips");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-light"
      >
        <Trash2 size={14} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Delete Trip">
        <p className="mb-6 text-sm text-text-secondary">
          Are you sure you want to delete this trip? This action cannot be
          undone, and all photos associated with this trip will be permanently
          removed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Plus, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Card from "@/components/ui/Card";
import LocationPicker from "./LocationPicker";

interface TripFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    locationName: string;
    latitude: number | null;
    longitude: number | null;
    startDate: string;
    endDate: string;
    tags: string[];
    rating: number | null;
    notes: string;
    isPublic: boolean;
  };
}

const defaultData = {
  title: "",
  description: "",
  locationName: "",
  latitude: null as number | null,
  longitude: null as number | null,
  startDate: "",
  endDate: "",
  tags: [] as string[],
  rating: null as number | null,
  notes: "",
  isPublic: false,
};

export default function TripForm({ initialData }: TripFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;
  const [formData, setFormData] = useState(initialData || defaultData);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isEditing ? `/api/trips/${initialData!.id}` : "/api/trips";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const trip = await res.json();
    router.push(`/trips/${trip.id}`);
    router.refresh();
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Card>
        <h3 className="mb-4 font-heading text-lg font-semibold text-bark">
          Trip Details
        </h3>
        <div className="space-y-4">
          <Input
            id="title"
            label="Trip title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g. Weekend at Yosemite"
            required
          />

          <Textarea
            id="description"
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="What was this trip about?"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="startDate"
              label="Start date"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
            <Input
              id="endDate"
              label="End date"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-heading text-lg font-semibold text-bark">
          Location
        </h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="locationName"
                label="Location name"
                value={formData.locationName}
                onChange={(e) =>
                  setFormData({ ...formData, locationName: e.target.value })
                }
                placeholder="e.g. Yosemite Valley"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
              >
                <MapPin size={16} />
              </Button>
            </div>
          </div>

          {showLocationPicker && (
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onSelect={(lat, lng, name) => {
                setFormData({
                  ...formData,
                  latitude: lat,
                  longitude: lng,
                  locationName: name || formData.locationName,
                });
                setShowLocationPicker(false);
              }}
            />
          )}

          {formData.latitude && formData.longitude && (
            <p className="text-xs text-text-muted">
              Coordinates: {formData.latitude.toFixed(5)},{" "}
              {formData.longitude.toFixed(5)}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-heading text-lg font-semibold text-bark">
          Tags & Rating
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-bark">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus size={16} />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-1 text-xs font-medium text-forest"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-danger"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-bark">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      rating: formData.rating === star ? null : star,
                    })
                  }
                  className={`text-2xl transition ${
                    formData.rating && star <= formData.rating
                      ? "text-gold"
                      : "text-border hover:text-gold"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <Textarea
            id="notes"
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any additional notes..."
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-forest focus:ring-forest"
            />
            <span className="text-bark">Make this trip public</span>
          </label>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          <Save size={16} />
          {isEditing ? "Update Trip" : "Create Trip"}
        </Button>
      </div>
    </form>
  );
}

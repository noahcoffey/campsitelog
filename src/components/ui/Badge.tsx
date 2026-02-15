type BadgeVariant = "default" | "forest" | "gold" | "bark" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-cream text-bark",
  forest: "bg-forest/10 text-forest",
  gold: "bg-gold/20 text-bark",
  bark: "bg-bark/10 text-bark",
  danger: "bg-danger-light text-danger",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

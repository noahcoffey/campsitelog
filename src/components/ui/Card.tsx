interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({
  children,
  className = "",
  padding = true,
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-white shadow-sm ${
        padding ? "p-4 sm:p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

import { Trees } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-forest text-white">
            <Trees size={28} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-forest">
            CampLog
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}

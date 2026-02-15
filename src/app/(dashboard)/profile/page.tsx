import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import ProfileForm from "@/components/auth/ProfileForm";

export const metadata = { title: "Profile — CampLog" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-bark">Profile</h1>
      <Card>
        <ProfileForm user={session.user} />
      </Card>
    </div>
  );
}

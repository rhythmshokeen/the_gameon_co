import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AthleteDashboard } from "@/components/dashboard/athlete-dashboard";
import { CoachDashboard } from "@/components/dashboard/coach-dashboard";
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const { role } = session.user;

  switch (role) {
    case "ATHLETE":
      return <AthleteDashboard userId={session.user.id} />;
    case "COACH":
      return <CoachDashboard userId={session.user.id} />;
    case "ORGANIZER":
      return <OrganizerDashboard userId={session.user.id} />;
    default:
      redirect("/auth/login");
  }
}

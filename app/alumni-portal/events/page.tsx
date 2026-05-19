import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function AlumniEventsPage() {
  return (
    <>
      <TopNav title="Events" subtitle="Upcoming reunions, meets, and networking events" />
      <div className="space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Register for alumni gatherings and school events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <p>No upcoming alumni events at the moment. Keep an eye out for updates!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

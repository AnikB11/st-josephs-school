import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AlumniNetworkPage() {
  return (
    <>
      <TopNav title="Network" subtitle="Connect with your batchmates and other alumni" />
      <div className="space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Alumni Directory</CardTitle>
            <CardDescription>Search and connect with former students.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </span>
              <p>The network directory is currently being populated. Check back later to connect with alumni!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

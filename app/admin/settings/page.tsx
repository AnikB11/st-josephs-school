import Link from "next/link";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SCHOOL } from "@/lib/constants";
import { currentAcademicYearLabel } from "@/lib/academic-year";

export default function SettingsPage() {
  return (
    <>
      <TopNav title="Settings" subtitle="School profile and operational settings" />
      <div className="space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>School profile</CardTitle>
            <CardDescription>Public information shown on the website.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input defaultValue={SCHOOL.name} className="mt-1.5" />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input defaultValue={SCHOOL.tagline} className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue={SCHOOL.email} className="mt-1.5" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue={SCHOOL.phone} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input defaultValue={SCHOOL.address} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button>Save changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic year</CardTitle>
            <CardDescription>
              Current session: <span className="font-medium text-slate-900">{currentAcademicYearLabel()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              At the end of the academic year, run the promotion engine to suggest
              promotions class-by-class. The engine never auto-promotes —
              an administrator must confirm each batch.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/admin/promotions">
                <Button>Run promotion engine</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

import Image from "next/image";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, GraduationCap, MapPin, Building, Linkedin, Mail } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AlumniNetworkPage() {
  const supabase = await createSupabaseServerClient();
  const { data: alumni } = await supabase
    .from("alumni")
    .select("id,full_name,graduation_year,current_position,current_company,bio,photo_url,linkedin_url,email")
    .eq("is_public", true)
    .order("graduation_year", { ascending: false })
    .order("full_name", { ascending: true })
    .limit(50);

  return (
    <>
      <TopNav title="Network" subtitle="Connect with your batchmates and other alumni" />
      <div className="space-y-6 px-6 py-8">
        {!alumni || alumni.length === 0 ? (
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
                <p>The network directory is currently empty. Check back later to connect with alumni!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {alumni.map((alum) => (
              <Card key={alum.id} className="overflow-hidden flex flex-col">
                <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200"></div>
                <CardContent className="flex-1 px-6 pb-6 pt-0 relative">
                  <div className="absolute -top-12 left-6">
                    <div className="h-20 w-20 relative rounded-xl border-4 border-white bg-slate-100 overflow-hidden shadow-sm flex items-center justify-center text-slate-400">
                      {alum.photo_url ? (
                        <Image src={alum.photo_url} alt={alum.full_name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <Users className="h-8 w-8" />
                      )}
                    </div>
                  </div>
                  <div className="mt-10">
                    <h3 className="font-semibold text-lg">{alum.full_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>Class of {alum.graduation_year}</span>
                    </div>
                    
                    {(alum.current_position || alum.current_company) && (
                      <div className="mt-4 flex flex-col gap-2">
                        {alum.current_position && (
                          <div className="flex items-start gap-2 text-sm">
                            <Building className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <span>{alum.current_position} {alum.current_company ? `at ${alum.current_company}` : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {alum.bio && (
                      <p className="mt-4 text-sm text-slate-600 line-clamp-3">
                        {alum.bio}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t flex items-center gap-4">
                    {alum.linkedin_url && (
                      <a href={alum.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0a66c2] transition-colors">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {alum.email && (
                      <a href={`mailto:${alum.email}`} className="text-slate-400 hover:text-slate-700 transition-colors">
                        <Mail className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

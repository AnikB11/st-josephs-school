import Image from "next/image";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Calendar, MapPin, Clock } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlumniEventsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: events } = await supabase
    .from("events")
    .select("id,title,description,cover_url,starts_at,ends_at,location,audience,is_published")
    .eq("is_published", true)
    .in("audience", ["all", "alumni"])
    .order("starts_at", { ascending: true })
    .limit(30);

  const upcomingEvents = events?.filter(e => new Date(e.starts_at) >= new Date()) || [];
  const pastEvents = events?.filter(e => new Date(e.starts_at) < new Date()) || [];

  return (
    <>
      <TopNav title="Events" subtitle="Upcoming reunions, meets, and networking events" />
      <div className="space-y-8 px-6 py-8">
        
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Upcoming Events</h2>
          {!upcomingEvents || upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <p>No upcoming alumni events at the moment. Keep an eye out for updates!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 mt-12">Past Events</h2>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function EventCard({ event, isPast = false }: { event: any, isPast?: boolean }) {
  const startDate = new Date(event.starts_at);
  
  return (
    <Card className={`overflow-hidden flex flex-col ${isPast ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      {event.cover_url ? (
        <div className="h-40 w-full overflow-hidden relative">
          <Image src={event.cover_url} alt={event.title} fill sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <Calendar className="h-12 w-12 text-indigo-300" />
        </div>
      )}
      
      <CardContent className="flex-1 p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg p-3 min-w-[4rem] h-fit">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {startDate.toLocaleString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' })}
            </span>
            <span className="text-xl font-bold text-slate-900">
              {startDate.getDate()}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2 text-slate-900 line-clamp-2">
              {event.title}
            </h3>
            
            <div className="space-y-2 mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  {startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                  {event.ends_at && ` - ${new Date(event.ends_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`}
                </span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {event.description && (
          <p className="mt-4 text-sm text-slate-600 line-clamp-3">
            {event.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

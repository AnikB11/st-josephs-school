import { Hero } from "@/components/site/hero";
import { Stats } from "@/components/site/stats";
import { PrincipalMessage } from "@/components/site/principal-message";
import { NoticesPreview } from "@/components/site/notices-preview";
import { EventsPreview } from "@/components/site/events-preview";
import { GalleryPreview } from "@/components/site/gallery-preview";
import { AdmissionsCta } from "@/components/site/admissions-cta";
import { getCmsSections } from "@/lib/cms";

export default async function HomePage() {
  const cms = await getCmsSections(["hero_headline", "principal_message"]);

  return (
    <>
      <Hero
        headline={cms.hero_headline.title}
        subhead={cms.hero_headline.body}
      />
      <Stats />
      <PrincipalMessage
        title={cms.principal_message.title}
        body={cms.principal_message.body}
      />
      <NoticesPreview />
      <EventsPreview />
      <GalleryPreview />
      <AdmissionsCta />
    </>
  );
}

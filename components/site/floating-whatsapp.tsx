import { getCmsSections } from "@/lib/cms";

function normalizeNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export async function FloatingWhatsApp() {
  const cms = await getCmsSections(["whatsapp_number", "whatsapp_message"]);
  const number = normalizeNumber(cms.whatsapp_number?.body);
  if (!number) return null;

  const message = cms.whatsapp_message?.body?.trim() ?? "";
  const href = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 transform-gpu place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform duration-200 ease-out hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        className="h-7 w-7 fill-current"
      >
        <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.255.59 4.45 1.71 6.39L3.2 28.8l6.61-1.732a12.79 12.79 0 006.193 1.577h.005c7.058 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.633-3.748-9.052A12.717 12.717 0 0016.003 3.2zm0 23.36h-.005a10.59 10.59 0 01-5.398-1.479l-.387-.23-3.923 1.027 1.046-3.823-.252-.4a10.578 10.578 0 01-1.62-5.655c0-5.86 4.77-10.626 10.633-10.626 2.84 0 5.508 1.107 7.514 3.116a10.55 10.55 0 013.115 7.516c-.001 5.862-4.77 10.626-10.623 10.626zm5.83-7.96c-.32-.16-1.89-.93-2.183-1.037-.292-.107-.504-.16-.717.16-.213.32-.823 1.037-1.009 1.25-.187.213-.373.24-.693.08-.32-.16-1.348-.497-2.567-1.585-.949-.847-1.589-1.892-1.775-2.212-.187-.32-.02-.493.14-.652.143-.143.32-.373.479-.56.16-.187.213-.32.32-.533.106-.213.053-.4-.027-.56-.08-.16-.717-1.732-.983-2.372-.259-.624-.522-.54-.717-.55l-.61-.011a1.17 1.17 0 00-.852.4c-.293.32-1.117 1.092-1.117 2.664s1.144 3.09 1.303 3.303c.16.213 2.252 3.44 5.46 4.823.764.33 1.36.527 1.823.673.766.244 1.463.21 2.013.127.614-.092 1.89-.773 2.156-1.519.266-.747.266-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
      </svg>
    </a>
  );
}

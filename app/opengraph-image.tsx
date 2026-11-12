import { ImageResponse } from "next/og";
import { SCHOOL } from "@/lib/constants";

// Route-level file convention: Next auto-maps this to /opengraph-image.<ext>
// and populates openGraph.images (+ twitter.images as fallback) on every
// page that doesn't supply its own.
export const runtime = "edge";
export const alt = `${SCHOOL.name} — ${SCHOOL.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0a1f44 0%, #0d2a5c 60%, #122f68 100%)",
          color: "#f7f2e6",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row — eyebrow + crest line */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "#c8972b",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: 18,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "#c8972b",
              }}
            >
              Since {SCHOOL.founded}
            </span>
            <span
              style={{
                fontSize: 20,
                marginTop: 10,
                color: "rgba(247, 242, 230, 0.75)",
              }}
            >
              Kingston, Rhenock · Sikkim
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 600,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              maxWidth: 950,
            }}
          >
            {SCHOOL.name}
          </div>
          <div
            style={{
              fontSize: 36,
              fontStyle: "italic",
              color: "#c8972b",
              letterSpacing: -0.5,
            }}
          >
            {SCHOOL.tagline}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(247, 242, 230, 0.78)",
              maxWidth: 950,
              lineHeight: 1.3,
              marginTop: 8,
            }}
          >
            A co-educational ICSE school in the hills of Sikkim —
            Nursery to Class XII (Science), English medium.
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(247, 242, 230, 0.2)",
            paddingTop: 22,
            fontSize: 20,
            color: "rgba(247, 242, 230, 0.6)",
          }}
        >
          <span>Under the Roman Catholic Diocese of Darjeeling–Sikkim</span>
          <span style={{ color: "#c8972b", letterSpacing: 2 }}>
            STJOSEPHSKINGSTON
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

import { seedContent } from "./seed";
import type { SiteContent } from "./types";

/**
 * Fills in whatever the stored content predates: missing fields take their
 * seed value, and section types added since the last save are slotted in after
 * the section that precedes them in the seed order.
 */
export function withDefaults(stored: Partial<SiteContent> | null): SiteContent {
  const content = { ...seedContent, ...stored };

  // Journeys saved when there was a single `videoUrl` field.
  const journey = content.journey as SiteContent["journey"] & { videoUrl?: string };
  if (!Array.isArray(journey.videos)) {
    const { videoUrl, ...rest } = journey;
    content.journey = { ...rest, videos: videoUrl ? [videoUrl] : [] };
  }

  const sections = [...content.sections];
  seedContent.sections.forEach((section, i) => {
    if (sections.some((s) => s.type === section.type)) return;
    const before = seedContent.sections[i - 1]?.type;
    const at = sections.findIndex((s) => s.type === before);
    sections.splice(at === -1 ? sections.length : at + 1, 0, section);
  });
  return { ...content, sections };
}

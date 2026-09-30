import { dotted } from "@/lib/date";
import type { InviteView, Milestone, Photo } from "@/lib/types";
import { parseVideoUrl, videoThumbnail, type VideoRef } from "@/lib/video";
import { MediaThumb, Zoomable } from "../Lightbox";
import { Reveal } from "../Reveal";
import { HeartIcon } from "../icons";

const FRAME = "relative block w-full overflow-hidden bg-[#2e2822]";

// The couple's story: optional videos, then milestones down a line that ends
// on the wedding day. A milestone shows its video instead of its photo.
// Everything opens in the shared viewer, where swiping walks the whole story.
export function Journey({ view: { content, info } }: { view: InviteView }) {
  const { milestones } = content.journey;
  // Links that aren't YouTube/Drive are skipped rather than shown broken.
  const videos = content.journey.videos.flatMap((url) => parseVideoUrl(url) ?? []);

  // The story's media in reading order: what the viewer swipes through.
  const media: Photo[] = [];
  const add = (item: Omit<Photo, "id">) => media.push({ id: `journey-${media.length}`, ...item }) - 1;
  const asVideo = (video: VideoRef, alt: string) => ({ url: videoThumbnail(video), alt, video });

  const videoAt = videos.map((v) => add(asVideo(v, "Video hành trình của chúng tôi")));
  const mediaAt = milestones.map((m) => {
    const clip = parseVideoUrl(m.video ?? "");
    if (clip) return add(asVideo(clip, m.title));
    return m.photo ? add({ url: m.photo, alt: m.title }) : -1;
  });

  return (
    <div className="space-y-12">
      {videos.length > 0 && (
        <div className="space-y-5">
          {videos.map((video, i) => (
            <Reveal key={videoAt[i]} variant="zoom">
              <Zoomable
                items={media}
                index={videoAt[i]}
                className={`${FRAME} rounded-3xl shadow-[0_14px_34px_rgba(120,90,60,.2)] ${video.vertical ? "mx-auto aspect-[9/16] max-w-[280px]" : "aspect-video"}`}
              >
                <MediaThumb photo={media[videoAt[i]]} sizes="(max-width: 480px) 100vw, 440px" />
              </Zoomable>
            </Reveal>
          ))}
        </div>
      )}

      {milestones.length > 0 && (
        <ol className="relative">
          {/* The line the milestones hang on */}
          <span className="absolute top-2 bottom-3 left-[11px] w-px bg-gradient-to-b from-line via-accent/40 to-accent/60" aria-hidden />

          {milestones.map((m, i) => (
            <MilestoneItem key={m.id} milestone={m} index={i} media={media} at={mediaAt[i]} />
          ))}

          <li className="relative pl-10">
            <Reveal variant="fade">
              <span className="pop absolute top-0 left-0 flex size-6 items-center justify-center rounded-full bg-accent text-white" aria-hidden>
                <HeartIcon width={12} height={12} />
              </span>
              <p className="eyebrow">{dotted(info.mainDateTime.slice(0, 10))}</p>
              <p className="mt-1.5 font-serif text-2xl italic">Về chung một nhà</p>
            </Reveal>
          </li>
        </ol>
      )}
    </div>
  );
}

/** `at` is this milestone's place in `media`, or -1 when it has no photo or video. */
function MilestoneItem({ milestone: m, index: i, media, at }: { milestone: Milestone; index: number; media: Photo[]; at: number }) {
  const item = media[at];
  return (
    <li className="relative pb-12 pl-10">
      {/* "fade": a transform here would re-anchor the dot away from the line. */}
      <Reveal variant="fade">
        <span className="pop absolute top-1 left-[5px] size-[13px] rounded-full border-2 border-accent bg-cream" aria-hidden />
      </Reveal>
      <Reveal variant={i % 2 ? "right" : "left"}>
        {m.when && <p className="eyebrow">{m.when}</p>}
        {m.title && <h3 className="mt-1.5 font-serif text-2xl">{m.title}</h3>}
        {item?.video ? (
          <Zoomable items={media} index={at} className={`${FRAME} mt-4 aspect-video rounded-2xl shadow-[0_10px_28px_rgba(120,90,60,.18)]`}>
            <MediaThumb photo={item} sizes="(max-width: 480px) 85vw, 400px" />
          </Zoomable>
        ) : (
          item && (
            // Polaroid: white frame, tilted the other way each time.
            <div className={`mt-4 bg-white p-2 pb-3 shadow-[0_10px_28px_rgba(120,90,60,.18)] ${i % 2 ? "rotate-[1.4deg]" : "rotate-[-1.4deg]"}`}>
              <Zoomable items={media} index={at} className={`${FRAME} aspect-[4/3]`}>
                <MediaThumb photo={item} sizes="(max-width: 480px) 85vw, 400px" />
              </Zoomable>
            </div>
          )
        )}
        {m.text && <p className="mt-4 text-[0.95rem] leading-relaxed whitespace-pre-line text-ink/80">{m.text}</p>}
      </Reveal>
    </li>
  );
}

// Album videos are links to YouTube or Google Drive: no upload size limits,
// and YouTube streams at a quality that suits the guest's connection.

export type VideoRef = {
  provider: "youtube" | "drive";
  id: string;
  /** YouTube Shorts are portrait. */
  vertical?: boolean;
};

const YOUTUBE = [
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|v\/)([\w-]{11})/,
];
const SHORTS = /youtube\.com\/shorts\/([\w-]{11})/;
const DRIVE = [/drive\.google\.com\/file\/d\/([\w-]{20,})/, /drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]{20,})/];

export function parseVideoUrl(input: string): VideoRef | null {
  const url = input.trim();
  const short = url.match(SHORTS);
  if (short) return { provider: "youtube", id: short[1], vertical: true };
  for (const re of YOUTUBE) {
    const m = url.match(re);
    if (m) return { provider: "youtube", id: m[1] };
  }
  for (const re of DRIVE) {
    const m = url.match(re);
    if (m) return { provider: "drive", id: m[1] };
  }
  return null;
}

export function videoThumbnail(v: VideoRef) {
  return v.provider === "youtube"
    ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`
    : `https://drive.google.com/thumbnail?id=${v.id}&sz=w1000`;
}

export function videoEmbedUrl(v: VideoRef) {
  return v.provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&playsinline=1&rel=0`
    : `https://drive.google.com/file/d/${v.id}/preview`;
}

/** Lets the background music step aside while a video plays. */
export const VIDEO_EVENT = "wedding:video";
export function announceVideo(playing: boolean) {
  window.dispatchEvent(new CustomEvent(VIDEO_EVENT, { detail: playing }));
}

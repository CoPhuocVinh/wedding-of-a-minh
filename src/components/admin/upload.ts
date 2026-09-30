"use client";

const MAX_SIDE = 2400;
const KEEP_ORIGINAL_BYTES = 1.2 * 1024 * 1024;

/** Downscale large photos in the browser so uploads stay small and fast. */
async function prepare(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" không phải file ảnh`);
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`Không đọc được ảnh "${file.name}" (thử lưu sang JPG rồi tải lại)`);
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= KEEP_ORIGINAL_BYTES) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Nén ảnh lỗi"))), "image/jpeg", 0.88),
  );
}

async function send(blob: Blob, name: string): Promise<string> {
  const form = new FormData();
  form.append("file", blob, name);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Upload lỗi (HTTP ${res.status})`);
  return body.url as string;
}

/** Uploads one image and returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const blob = await prepare(file);
  return send(blob, blob === file ? file.name : file.name.replace(/\.\w+$/, "") + ".jpg");
}

export const MAX_AUDIO_MB = 4;

/** Uploads background music as is (browsers can't re-encode audio cheaply). */
export async function uploadAudio(file: File): Promise<string> {
  if (!file.type.startsWith("audio/")) throw new Error(`"${file.name}" không phải file nhạc`);
  if (file.size > MAX_AUDIO_MB * 1024 * 1024)
    throw new Error(`File nặng ${(file.size / 1048576).toFixed(1)}MB, tối đa ${MAX_AUDIO_MB}MB. Hãy xuất lại mp3 128kbps rồi tải lên.`);
  return send(file, file.name);
}

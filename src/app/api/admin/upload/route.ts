import { isAdmin } from "@/lib/auth";
import { storage } from "@/lib/storage";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5MB

/** Admin upload of one image or background-music file. */
export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "Thiếu file" }, { status: 400 });
  const audio = file.type.startsWith("audio/");
  if (!audio && !file.type.startsWith("image/"))
    return Response.json({ error: "Chỉ nhận file ảnh hoặc nhạc (mp3, m4a)" }, { status: 400 });
  if (file.size > MAX_BYTES)
    return Response.json(
      { error: audio ? "File nhạc lớn hơn 4MB. Hãy xuất lại mp3 128kbps rồi tải lên." : "Ảnh quá lớn (tối đa 4MB sau khi nén)" },
      { status: 413 },
    );

  try {
    const stored = await storage.uploadFile({
      filename: file.name.replace(/[^\w.-]+/g, "_") || (audio ? "nhac.mp3" : "anh.jpg"),
      contentType: file.type,
      data: Buffer.from(await file.arrayBuffer()),
    });
    return Response.json(stored);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload lỗi" }, { status: 500 });
  }
}

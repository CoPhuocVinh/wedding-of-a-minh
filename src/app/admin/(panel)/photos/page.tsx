import { PhotosManager } from "@/components/admin/PhotosManager";
import { loadContent } from "@/lib/data";

export default async function PhotosPage() {
  return <PhotosManager initial={await loadContent()} />;
}

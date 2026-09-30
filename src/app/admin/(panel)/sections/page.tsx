import { SectionsEditor } from "@/components/admin/SectionsEditor";
import { loadContent } from "@/lib/data";

export default async function SectionsPage() {
  return <SectionsEditor initial={(await loadContent()).sections} />;
}

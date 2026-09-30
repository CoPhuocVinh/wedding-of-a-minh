import { ContentEditor } from "@/components/admin/ContentEditor";
import { loadContent } from "@/lib/data";

export default async function ContentPage() {
  return <ContentEditor initial={await loadContent()} />;
}

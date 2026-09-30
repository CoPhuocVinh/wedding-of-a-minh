import { GuestsManager } from "@/components/admin/GuestsManager";
import { loadContent } from "@/lib/data";
import { storage } from "@/lib/storage";

export default async function GuestsPage() {
  const [guests, content] = await Promise.all([storage.listGuests(), loadContent()]);
  return <GuestsManager initial={guests} inviteLine={content.invite.line} />;
}

import { WishesManager } from "@/components/admin/WishesManager";
import { storage } from "@/lib/storage";

export default async function WishesPage() {
  return <WishesManager initial={await storage.listWishes()} />;
}

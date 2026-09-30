import { GuestInvitation, guestMetadata } from "@/lib/invite-page";

type Props = PageProps<"/g/[slug]">;

// A nhà gái guest.
export async function generateMetadata({ params }: Props) {
  return guestMetadata("gai", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <GuestInvitation side="gai" slug={(await params).slug} />;
}

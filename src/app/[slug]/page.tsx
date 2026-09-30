import { GuestInvitation, guestMetadata } from "@/lib/invite-page";

type Props = PageProps<"/[slug]">;

// A nhà trai guest.
export async function generateMetadata({ params }: Props) {
  return guestMetadata("trai", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <GuestInvitation side="trai" slug={(await params).slug} />;
}

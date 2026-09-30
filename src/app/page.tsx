import { Invitation } from "@/components/invitation/Invitation";
import { sideMetadata } from "@/lib/invite-page";

// Nhà trai, for everyone.
export const generateMetadata = () => sideMetadata("trai");

export default function Home() {
  return <Invitation guest={null} side="trai" />;
}

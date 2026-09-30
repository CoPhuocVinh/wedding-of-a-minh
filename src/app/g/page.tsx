import { Invitation } from "@/components/invitation/Invitation";
import { sideMetadata } from "@/lib/invite-page";

// Nhà gái, for everyone.
export const generateMetadata = () => sideMetadata("gai");

export default function BrideHome() {
  return <Invitation guest={null} side="gai" />;
}

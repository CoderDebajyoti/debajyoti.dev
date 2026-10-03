import DottedBackground from "@/components/background/DottedBackground";
import DesktopContainer from "@/components/desktop/DesktopContainer";

export default function Home() {
  return (
    <main className="relative w-screen h-screen h-[100dvh] overflow-hidden">
      {/* Step 1: Responsive Dotted Background */}
      <DottedBackground />

      {/* Step 2: Projects Desktop Folder Object */}
      <DesktopContainer />
    </main>
  );
}

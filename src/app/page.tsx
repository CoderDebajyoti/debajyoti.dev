import DottedBackground from "@/components/background/DottedBackground";
import DesktopContainer from "@/components/desktop/DesktopContainer";
import { WindowManagerProvider } from "@/context/WindowManagerContext";

export default function Home() {
  return (
    <WindowManagerProvider>
      <main className="relative w-screen h-screen h-[100dvh] overflow-hidden">
        {/* Step 1: Responsive Dotted Background */}
        <DottedBackground />

        {/* Step 2 & 3: Interactive Desktop & Mac-Inspired Dock */}
        <DesktopContainer />
      </main>
    </WindowManagerProvider>
  );
}

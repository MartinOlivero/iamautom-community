import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";
import XPToast from "@/components/gamification/XPToast";

/**
 * Protected app layout — shown for all /app/* and /admin/* routes.
 * Desktop: sidebar left (260px) + main content area.
 * Mobile: topbar + content + bottom nav.
 */
export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#04080f]">
            {/* Global background: hero image + overlays */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/bg-hero.png')] bg-cover bg-center bg-fixed opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#04080f]/90 via-[#04080f]/75 to-[#04080f]/90" />
                {/* Tech grid */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(56,189,248,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.025) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main content area — offset by sidebar on desktop */}
            <div className="lg:ml-[260px] flex flex-col min-h-screen relative z-10">
                {/* Top bar */}
                <Topbar />

                {/* Page content */}
                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-20 lg:pb-8 max-w-5xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <MobileNav />

            {/* Gamification toast notifications */}
            <XPToast />
        </div>
    );
}

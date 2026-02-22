import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";

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
        <div className="min-h-screen bg-brand-bg">
            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main content area — offset by sidebar on desktop */}
            <div className="lg:ml-[260px] flex flex-col min-h-screen">
                {/* Top bar */}
                <Topbar />

                {/* Page content */}
                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-20 lg:pb-8 max-w-5xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <MobileNav />
        </div>
    );
}

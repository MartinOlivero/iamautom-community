import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";
import XPToast from "@/components/gamification/XPToast";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f4f6fb]">
            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main content */}
            <div className="lg:ml-[240px] flex flex-col min-h-screen">
                <Topbar />
                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-5xl mx-auto w-full">
                    {children}
                </main>
            </div>

            <MobileNav />
            <XPToast />
        </div>
    );
}

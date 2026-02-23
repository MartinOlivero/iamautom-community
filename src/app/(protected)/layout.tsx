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
        <div className="min-h-screen relative overflow-hidden bg-brand-bg dark:bg-brand-dark transition-colors duration-500">
            {/* 3D Static Mesh Background */}
            <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40">
                <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark" />
                <div className="absolute inset-0 backdrop-blur-[100px]" />
            </div>

            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main content */}
            <div className="relative z-10 lg:ml-[280px] flex flex-col min-h-screen transition-all duration-300">
                <Topbar />
                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-[1400px] mx-auto w-full">
                    {children}
                </main>
            </div>

            <MobileNav />
            <XPToast />
        </div>
    );
}

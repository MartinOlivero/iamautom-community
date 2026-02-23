"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_ITEMS } from "@/lib/constants";
import PremiumIcon from "@/components/ui/PremiumIcon";

/**
 * Bottom navigation bar for mobile devices (5 tabs).
 * Hidden on desktop (lg breakpoint and up).
 */
export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-40 rounded-2xl glass dark:glass-dark border border-white/20 shadow-glass safe-area-inset-bottom overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full duration-1000 transition-transform" />
            <div className="flex items-center justify-around h-[4.5rem] px-2 relative z-10">
                {MOBILE_NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex flex-col items-center gap-0.5 py-1 px-3
                transition-colors duration-200
                ${isActive
                                    ? "text-brand-accent"
                                    : "text-brand-muted hover:text-brand-text-secondary"
                                }
              `}
                        >
                            <PremiumIcon href={item.href} isActive={isActive} size={20} variant="ghost" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

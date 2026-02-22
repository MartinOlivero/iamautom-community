"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_ITEMS } from "@/lib/constants";

/**
 * Bottom navigation bar for mobile devices (5 tabs).
 * Hidden on desktop (lg breakpoint and up).
 */
export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-card/95 backdrop-blur-md border-t border-brand-border safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 px-2">
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
                            <span className="text-xl">{item.emoji}</span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

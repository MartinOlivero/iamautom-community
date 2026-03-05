import { useState, useRef, useEffect } from "react";

interface ReactionPickerProps {
    reactions: { emoji: string; count: number; hasReacted: boolean }[];
    onToggle: (emoji: string) => void;
}

const AVAILABLE_EMOJIS = ["🔥", "👏", "💡", "❤️", "😂", "🚀"];

/**
 * Inline emoji reaction bar for posts.
 * Shows existing reactions with counts + a picker to add new ones.
 */
export default function ReactionPicker({ reactions, onToggle }: ReactionPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {/* Existing reactions with counts */}
            {reactions
                .filter((r) => r.count > 0)
                .map((reaction) => (
                    <button
                        key={reaction.emoji}
                        onClick={() => onToggle(reaction.emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs
                       border transition-all hover:scale-105 active:scale-95
                       ${reaction.hasReacted
                                ? "bg-brand-accent/10 border-brand-accent/30 text-brand-accent shadow-sm"
                                : "bg-brand-hover-bg border-brand-border text-brand-text-secondary hover:border-brand-border/80"
                            }`}
                    >
                        <span>{reaction.emoji}</span>
                        <span className="font-mono font-medium">{reaction.count}</span>
                    </button>
                ))}

            {/* Add reaction dropdown */}
            <div className="relative" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-pill text-xs
                      border border-dashed transition-all active:scale-90
                      ${isOpen
                            ? "bg-brand-hover-bg border-brand-accent/50 text-brand-accent"
                            : "border-brand-border text-brand-muted hover:bg-brand-hover-bg hover:text-brand-text"
                        }`}
                >
                    +
                </button>

                {/* Emoji picker dropdown */}
                {isOpen && (
                    <div
                        className="absolute bottom-full left-0 mb-2 flex
                         items-center gap-1 p-1 bg-brand-card/95 backdrop-blur-md 
                         border border-brand-border rounded-xl shadow-xl z-20 
                         animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150"
                    >
                        {AVAILABLE_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    onToggle(emoji);
                                    setIsOpen(false);
                                }}
                                className="text-xl hover:scale-125 hover:bg-brand-hover-bg 
                                         rounded-lg transition-all p-1.5 active:scale-95"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

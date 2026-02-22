"use client";

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
                                ? "bg-brand-accent/10 border-brand-accent/30 text-brand-accent"
                                : "bg-brand-hover-bg border-brand-border text-brand-text-secondary"
                            }`}
                    >
                        <span>{reaction.emoji}</span>
                        <span className="font-mono font-medium">{reaction.count}</span>
                    </button>
                ))}

            {/* Add reaction dropdown */}
            <div className="relative group">
                <button
                    className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs
                     border border-dashed border-brand-border text-brand-muted
                     hover:bg-brand-hover-bg hover:text-brand-text transition-all"
                >
                    +
                </button>

                {/* Emoji picker dropdown */}
                <div
                    className="absolute bottom-full left-0 mb-1 hidden group-hover:flex
                     items-center gap-1 p-1.5 bg-brand-card border border-brand-border
                     rounded-card shadow-lg z-10 animate-scale-in"
                >
                    {AVAILABLE_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => onToggle(emoji)}
                            className="text-base hover:scale-125 active:scale-95 transition-transform p-1"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

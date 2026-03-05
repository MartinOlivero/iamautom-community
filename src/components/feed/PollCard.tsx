"use client";

import { useState } from "react";
import { createClient } from "@/lib/insforge/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface PollOption {
    id: string;
    text: string;
}

interface PollCardProps {
    poll: {
        id: string;
        question: string;
        options: PollOption[];
        ends_at: string;
        author_id: string;
    };
    votes: { option_id: string; user_id: string }[];
}

/**
 * Poll card with voting and results display.
 */
export default function PollCard({ poll, votes }: PollCardProps) {
    const { user } = useAuth();
    const supabase = createClient();
    const [localVotes, setLocalVotes] = useState(votes);
    const [isVoting, setIsVoting] = useState(false);

    const userVote = localVotes.find((v) => v.user_id === user?.id);
    const hasVoted = !!userVote;
    const totalVotes = localVotes.length;
    const isExpired = new Date(poll.ends_at) < new Date();
    const showResults = hasVoted || isExpired;

    // Count votes per option
    const voteCounts: Record<string, number> = {};
    localVotes.forEach((v) => {
        voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
    });

    async function handleVote(optionId: string) {
        if (hasVoted || isExpired || !user) return;
        setIsVoting(true);

        const { error } = await supabase.from("poll_votes").insert({
            poll_id: poll.id,
            user_id: user.id,
            option_id: optionId,
        });

        if (!error) {
            setLocalVotes((prev) => [...prev, { option_id: optionId, user_id: user.id }]);
        }
        setIsVoting(false);
    }

    // Time remaining
    const msRemaining = new Date(poll.ends_at).getTime() - Date.now();
    const hoursRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));
    const daysRemaining = Math.floor(hoursRemaining / 24);

    return (
        <div className="bg-brand-card rounded-card border border-brand-border p-5">
            {/* Question */}
            <div className="flex items-start gap-2 mb-4">
                <span className="text-xl">📊</span>
                <div>
                    <h3 className="text-sm font-semibold text-brand-text">{poll.question}</h3>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                        {isExpired
                            ? "Encuesta finalizada"
                            : daysRemaining > 0
                                ? `${daysRemaining}d ${hoursRemaining % 24}h restantes`
                                : `${hoursRemaining}h restantes`}
                        {" · "}
                        {totalVotes} voto{totalVotes !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
                {poll.options.map((option) => {
                    const count = voteCounts[option.id] || 0;
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isSelected = userVote?.option_id === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={hasVoted || isExpired || isVoting}
                            className={`relative w-full text-left px-4 py-2.5 rounded-input border
                         text-sm transition-all overflow-hidden
                         ${isSelected
                                    ? "border-brand-accent bg-brand-accent/5"
                                    : "border-brand-border hover:border-brand-accent/30"
                                }
                         ${!showResults ? "hover:bg-brand-hover-bg cursor-pointer" : "cursor-default"}
                        `}
                        >
                            {/* Progress bar background */}
                            {showResults && (
                                <div
                                    className="absolute inset-0 bg-brand-accent/10 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            <div className="relative flex items-center justify-between">
                                <span className="text-brand-text-secondary">
                                    {isSelected && "✓ "}
                                    {option.text}
                                </span>
                                {showResults && (
                                    <span className="text-xs font-mono font-medium text-brand-text">
                                        {percentage}%
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

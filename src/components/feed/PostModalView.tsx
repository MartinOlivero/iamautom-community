"use client";

import PostCard from "./PostCard";
import type { PostWithDetails } from "@/hooks/usePosts";

interface PostModalViewProps {
    post: PostWithDetails;
    onToggleReaction: (postId: string, emoji: string) => void;
    onDelete: (postId: string) => void;
    onUpdate: (postId: string, content: string) => void;
    onTogglePin?: (postId: string, isPinned: boolean) => void;
}

export default function PostModalView({ post, onToggleReaction, onDelete, onUpdate, onTogglePin }: PostModalViewProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* We reuse the PostCard but we could make it look different for modal if needed */}
            <PostCard
                post={post}
                onToggleReaction={onToggleReaction}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onTogglePin={onTogglePin}
            />

            {/* We could add a more detailed comment list or other info here */}
        </div>
    );
}

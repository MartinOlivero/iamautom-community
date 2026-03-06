"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/insforge/client";
import type { Comment, Profile } from "@/types/database";
import { triggerXPAward } from "@/lib/xpClient";

export type CommentWithAuthor = Omit<Comment, "author"> & {
    author: Pick<Profile, "id" | "full_name" | "avatar_url" | "plan_type" | "level" | "xp_points">;
};

export function useComments(postId: string) {
    const [comments, setComments] = useState<CommentWithAuthor[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        const db = createClient();
        const { data, error } = await db
            .from("comments")
            .select(
                `
        *,
        author:profiles!author_id(id, full_name, avatar_url, plan_type)
      `
            )
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (!error && data) {
            setComments(data as unknown as CommentWithAuthor[]);
        }
        setIsLoading(false);
    }, [postId]);

    const addComment = useCallback(
        async (content: string) => {
            const db = createClient();
            const {
                data: { user },
            } = await db.auth.getUser();
            if (!user) return null;

            const { data, error } = await db
                .from("comments")
                .insert({ post_id: postId, author_id: user.id, content })
                .select(
                    `
          *,
          author:profiles!author_id(id, full_name, avatar_url, plan_type)
        `
                )
                .single();

            if (!error && data) {
                const newComment = data as unknown as CommentWithAuthor;
                setComments((prev) => [...prev, newComment]);

                // XP is awarded by DB trigger (trigger_comment_xp)
                // Only ping for daily streak
                triggerXPAward("ping");

                return newComment;
            }
            return null;
        },
        [postId]
    );

    const updateComment = useCallback(
        async (commentId: string, content: string) => {
            const db = createClient();
            const { error } = await db
                .from("comments")
                .update({ content })
                .eq("id", commentId);
            if (!error) {
                setComments((prev) =>
                    prev.map((c) => (c.id === commentId ? { ...c, content } : c))
                );
            }
        },
        []
    );

    const deleteComment = useCallback(
        async (commentId: string) => {
            const db = createClient();
            const { error } = await db.from("comments").delete().eq("id", commentId);
            if (!error) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            }
        },
        []
    );

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return { comments, isLoading, addComment, updateComment, deleteComment };
}

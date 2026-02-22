"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Comment, Profile } from "@/types/database";
import { triggerXPAward } from "@/lib/xpClient";

export type CommentWithAuthor = Omit<Comment, "author"> & {
    author: Pick<Profile, "id" | "full_name" | "avatar_url" | "plan_type">;
};

export function useComments(postId: string) {
    const [comments, setComments] = useState<CommentWithAuthor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
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
    }, [supabase, postId]);

    const addComment = useCallback(
        async (content: string) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
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

                // Award XP for creating a comment
                triggerXPAward("create_comment");

                return newComment;
            }
            return null;
        },
        [supabase, postId]
    );

    const deleteComment = useCallback(
        async (commentId: string) => {
            const { error } = await supabase.from("comments").delete().eq("id", commentId);
            if (!error) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            }
        },
        [supabase]
    );

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return { comments, isLoading, addComment, deleteComment };
}

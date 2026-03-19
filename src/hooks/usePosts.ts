"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/insforge/client";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Post, Profile, PostReaction } from "@/types/database";
import { triggerXPAward } from "@/lib/xpClient";
// Note: XP for post creation is handled by DB trigger (trigger_post_published_xp)
// triggerXPAward("create_post") was removed to avoid double-awarding

/** Post with joined author, reactions, and comment count */
export type PostWithDetails = Omit<Post, "author" | "reactions"> & {
    author: Pick<Profile, "id" | "full_name" | "avatar_url" | "plan_type" | "role" | "level" | "xp_points">;
    reactions: PostReaction[];
    comment_count: number;
};

interface UsePostsOptions {
    channel?: string;
    pageSize?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
    const { channel = "general", pageSize = 20 } = options;
    const { user, isLoading: authLoading } = useAuth();
    const [posts, setPosts] = useState<PostWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    /** Fetch posts with author profile, reactions, and comment count */
    const fetchPosts = useCallback(
        async (cursor?: string) => {
            setIsLoading(true);

            try {
                console.log("[usePosts] Starting fetchPosts, creating client...");
                const db = createClient();

                console.log("[usePosts] Constructing query...");
                let query = db
                    .from("posts")
                    .select(
                        "*, author:profiles!author_id(id, full_name, avatar_url, plan_type, role, level, xp_points), reactions:post_reactions(*), comments(count)"
                    )
                    .eq("channel", channel)
                    .order("is_pinned", { ascending: false })
                    .order("created_at", { ascending: false })
                    .limit(pageSize);

                if (cursor) {
                    query = query.lt("created_at", cursor);
                }

                console.log("[usePosts] Awaiting query...");
                const { data, error } = await query;
                console.log("[usePosts] Query complete:", { dataLength: data?.length, error });

                if (error) {
                    console.error("Error fetching posts:", error);
                    // On auth errors, keep existing posts instead of showing empty feed
                    const code = typeof error === "object" && "code" in error ? (error as { code: string }).code : "";
                    const isAuthError = code === "401" || code === "403" || code === "PGRST301";
                    if (!isAuthError) {
                        setPosts([]);
                    }
                    setIsLoading(false);
                    return;
                }

                if (!data) {
                    setPosts([]);
                    setIsLoading(false);
                    return;
                }

                const formatted: PostWithDetails[] = data.map((post: Record<string, unknown>) => ({
                    ...post,
                    author: post.author as PostWithDetails["author"],
                    reactions: (post.reactions ?? []) as PostReaction[],
                    comment_count:
                        Array.isArray(post.comments) && post.comments[0]
                            ? (post.comments[0] as { count: number }).count
                            : 0,
                })) as PostWithDetails[];

                if (cursor) {
                    setPosts((prev) => [...prev, ...formatted]);
                } else {
                    setPosts(formatted);
                }

                setHasMore(formatted.length >= pageSize);
            } catch (err) {
                console.error("Exception fetching posts:", err);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        },
        [channel, pageSize]
    );

    /** Load more (next page) */
    const loadMore = useCallback(() => {
        if (posts.length > 0) {
            const lastPost = posts[posts.length - 1];
            fetchPosts(lastPost.created_at);
        }
    }, [posts, fetchPosts]);

    /** Create a new post */
    const createPost = useCallback(
        async (content: string, mediaUrls?: string[]) => {
            const db = createClient();
            const {
                data: { user },
            } = await db.auth.getUser();
            if (!user) return null;

            const { data, error } = await db
                .from("posts")
                .insert({
                    author_id: user.id,
                    content,
                    media_urls: mediaUrls ?? [],
                    channel,
                })
                .select(
                    `
          *,
          author:profiles!author_id(id, full_name, avatar_url, plan_type, role, level, xp_points),
          reactions:post_reactions(*),
          comments:comments(count)
        `
                )
                .single();

            if (error) {
                console.error("Error creating post:", error);
                return null;
            }

            const newPost: PostWithDetails = {
                ...data,
                author: data.author as PostWithDetails["author"],
                reactions: [],
                comment_count: 0,
            } as PostWithDetails;

            setPosts((prev) => [newPost, ...prev]);

            // XP is awarded by DB trigger (trigger_post_published_xp)
            // Only ping for daily streak
            triggerXPAward("ping");

            return newPost;
        },
        [channel]
    );

    /** Toggle a reaction on a post */
    const toggleReaction = useCallback(
        async (postId: string, emoji: string) => {
            const db = createClient();
            const {
                data: { user },
            } = await db.auth.getUser();
            if (!user) return;

            const existingReaction = posts
                .find((p) => p.id === postId)
                ?.reactions.find((r) => r.user_id === user.id && r.emoji === emoji);

            if (existingReaction) {
                // Remove reaction
                await db.from("post_reactions").delete().eq("id", existingReaction.id);
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === postId
                            ? { ...p, reactions: p.reactions.filter((r) => r.id !== existingReaction.id) }
                            : p
                    )
                );
            } else {
                // Add reaction
                const { data } = await db
                    .from("post_reactions")
                    .insert({ post_id: postId, user_id: user.id, emoji })
                    .select()
                    .single();

                if (data) {
                    setPosts((prev) =>
                        prev.map((p) =>
                            p.id === postId ? { ...p, reactions: [...p.reactions, data] } : p
                        )
                    );
                }
            }
        },
        [posts]
    );

    const deletePost = useCallback(
        async (postId: string) => {
            const db = createClient();
            const { error } = await db.from("posts").delete().eq("id", postId);
            if (!error) {
                setPosts((prev) => prev.filter((p) => p.id !== postId));
            }
        },
        []
    );

    /** Update a post */
    const updatePost = useCallback(
        async (postId: string, content: string) => {
            const db = createClient();
            const { error } = await db
                .from("posts")
                .update({ content })
                .eq("id", postId);
            if (!error) {
                setPosts((prev) =>
                    prev.map((p) => (p.id === postId ? { ...p, content } : p))
                );
            }
        },
        []
    );

    /** Toggle Pin */
    const togglePin = useCallback(
        async (postId: string, isPinned: boolean) => {
            const db = createClient();
            const { error } = await db
                .from("posts")
                .update({ is_pinned: !isPinned })
                .eq("id", postId);

            if (!error) {
                setPosts((prev) =>
                    prev.map((p) => (p.id === postId ? { ...p, is_pinned: !isPinned } : p))
                );
            }
        },
        []
    );

    // Fetch posts only after auth is ready and user is available
    useEffect(() => {
        if (!authLoading && user) {
            fetchPosts();
        }
    }, [fetchPosts, authLoading, user]);

    return {
        posts,
        isLoading,
        hasMore,
        loadMore,
        createPost,
        toggleReaction,
        deletePost,
        updatePost,
        togglePin,
        refresh: () => fetchPosts(),
    };
}

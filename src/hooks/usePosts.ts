"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post, Profile, PostReaction } from "@/types/database";
import { triggerXPAward } from "@/lib/xpClient";

/** Post with joined author, reactions, and comment count */
export type PostWithDetails = Omit<Post, "author" | "reactions"> & {
    author: Pick<Profile, "id" | "full_name" | "avatar_url" | "plan_type" | "role">;
    reactions: PostReaction[];
    comment_count: number;
};

interface UsePostsOptions {
    channel?: string;
    pageSize?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
    const { channel = "general", pageSize = 20 } = options;
    const [posts, setPosts] = useState<PostWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    /** Fetch posts with author profile, reactions, and comment count */
    const fetchPosts = useCallback(
        async (cursor?: string) => {
            setIsLoading(true);

            try {
                let query = supabase
                    .from("posts")
                    .select(
                        "*, author:profiles!author_id(id, full_name, avatar_url, plan_type, role), reactions:post_reactions(*), comments(count)"
                    )
                    .eq("channel", channel)
                    .order("is_pinned", { ascending: false })
                    .order("created_at", { ascending: false })
                    .limit(pageSize);

                if (cursor) {
                    query = query.lt("created_at", cursor);
                }

                const { data, error } = await query;

                if (error) {
                    console.error("Error fetching posts:", error);
                    setPosts([]);
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
        [supabase, channel, pageSize]
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
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
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
          author:profiles!author_id(id, full_name, avatar_url, plan_type, role),
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

            // Award XP for creating a post
            triggerXPAward("create_post");

            return newPost;
        },
        [supabase, channel]
    );

    /** Toggle a reaction on a post */
    const toggleReaction = useCallback(
        async (postId: string, emoji: string) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const existingReaction = posts
                .find((p) => p.id === postId)
                ?.reactions.find((r) => r.user_id === user.id && r.emoji === emoji);

            if (existingReaction) {
                // Remove reaction
                await supabase.from("post_reactions").delete().eq("id", existingReaction.id);
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === postId
                            ? { ...p, reactions: p.reactions.filter((r) => r.id !== existingReaction.id) }
                            : p
                    )
                );
            } else {
                // Add reaction
                const { data } = await supabase
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
        [supabase, posts]
    );

    /** Delete a post */
    const deletePost = useCallback(
        async (postId: string) => {
            const { error } = await supabase.from("posts").delete().eq("id", postId);
            if (!error) {
                setPosts((prev) => prev.filter((p) => p.id !== postId));
            }
        },
        [supabase]
    );

    // Initial fetch
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        isLoading,
        hasMore,
        loadMore,
        createPost,
        toggleReaction,
        deletePost,
        refresh: () => fetchPosts(),
    };
}

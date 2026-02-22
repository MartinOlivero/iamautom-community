"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import ChannelTabs from "@/components/feed/ChannelTabs";
import PostForm from "@/components/feed/PostForm";
import PostCard from "@/components/feed/PostCard";
import { usePosts } from "@/hooks/usePosts";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

/**
 * Main community feed page with channel tabs, post form, and infinite scroll.
 */
export default function FeedPage() {
    const [channel, setChannel] = useState("general");
    const { posts, isLoading, hasMore, loadMore, createPost, toggleReaction, deletePost } =
        usePosts({ channel });

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Page header */}
            <div>
                <h1 className="text-xl font-display font-bold text-brand-text">Comunidad</h1>
                <p className="text-sm text-brand-muted mt-1">
                    Compartí, aprendé y conectá con otros miembros
                </p>
            </div>

            {/* Channel tabs */}
            <ChannelTabs activeChannel={channel} onChannelChange={setChannel} />

            {/* Post creation form */}
            <PostForm onSubmit={createPost} channel={channel} />

            {/* Post list */}
            <div className="space-y-4">
                {isLoading && posts.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-4xl mb-3">✍️</p>
                        <p className="text-brand-muted text-sm">
                            Sé el primero en publicar en este canal
                        </p>
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onToggleReaction={toggleReaction}
                                onDelete={deletePost}
                            />
                        ))}

                        {/* Load more */}
                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadMore}
                                    isLoading={isLoading}
                                >
                                    Cargar más
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

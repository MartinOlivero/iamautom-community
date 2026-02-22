"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import ChannelTabs from "@/components/feed/ChannelTabs";
import PostForm from "@/components/feed/PostForm";
import PostCard from "@/components/feed/PostCard";
import { usePosts } from "@/hooks/usePosts";

export default function FeedPage() {
    const [channel, setChannel] = useState("general");
    const { posts, isLoading, hasMore, loadMore, createPost, toggleReaction, deletePost } =
        usePosts({ channel });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                        Comunidad
                    </h1>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[10px] font-mono text-[#10b981] uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                        Online
                    </span>
                </div>
                <p className="text-sm text-white/35">
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
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 border-2 border-[#38bdf8]/20 border-t-[#38bdf8] rounded-full animate-spin" />
                            <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-b-[#a78bfa]/40 rounded-full animate-spin" style={{ animationDuration: '1.4s', animationDirection: 'reverse' }} />
                        </div>
                        <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Cargando feed...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl border border-white/5 bg-[rgba(10,16,30,0.4)]">
                        <p className="text-4xl mb-3">✍️</p>
                        <p className="text-white/40 text-sm">
                            Sé el primero en publicar en #{channel}
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

                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-[#38bdf8]/30 hover:text-white/80 hover:bg-white/5 transition-all duration-300 disabled:opacity-40"
                                >
                                    {isLoading ? "Cargando..." : "Cargar más"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

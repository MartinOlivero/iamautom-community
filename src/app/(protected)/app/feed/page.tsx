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
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                        Comunidad
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Compartí, aprendé y conectá con otros miembros
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                </div>
            </div>

            {/* Channel tabs */}
            <ChannelTabs activeChannel={channel} onChannelChange={setChannel} />

            {/* Post creation form */}
            <PostForm onSubmit={createPost} channel={channel} />

            {/* Post list */}
            <div className="space-y-4">
                {posts.length > 0 ? (
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
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600
                                        bg-white border border-slate-200 shadow-card-sm
                                        hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50
                                        hover:shadow-[0_4px_12px_rgba(99,102,241,0.15)]
                                        active:scale-[0.97] transition-all duration-200"
                                >
                                    {isLoading ? "Cargando..." : "Cargar más publicaciones"}
                                </button>
                            </div>
                        )}
                    </>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 border-2 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                            <div className="absolute inset-1 border-2 border-transparent border-b-orange-400 rounded-full animate-spin" style={{ animationDuration: '1.4s', animationDirection: 'reverse' }} />
                        </div>
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Cargando...</span>
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-2xl border border-slate-200 bg-white shadow-card-sm">
                        <p className="text-4xl mb-3">✍️</p>
                        <p className="text-slate-900 font-semibold mb-1">Nadie ha publicado aquí todavía</p>
                        <p className="text-slate-500 text-sm">¡Sé el primero en publicar en #{channel}!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

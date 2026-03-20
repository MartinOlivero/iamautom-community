"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import ChannelNav from "@/components/feed/ChannelNav";
import CommunitySidebar from "@/components/feed/CommunitySidebar";
import PostForm from "@/components/feed/PostForm";
import PostCard from "@/components/feed/PostCard";
import Modal from "@/components/ui/Modal";
import PostModalView from "@/components/feed/PostModalView";
import MobileChannelNav from "@/components/feed/MobileChannelNav";
import { usePosts, type PostWithDetails } from "@/hooks/usePosts";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRefreshOnTabReturn } from "@/hooks/useVisibilityRefresh";

export default function FeedPage({
    searchParams,
}: {
    searchParams: { channel?: string };
}) {
    const { user } = useAuth();
    const initialChannel = searchParams.channel || "general";
    const [channel, setChannel] = useState(initialChannel);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);

    const {
        posts,
        isLoading,
        hasMore,
        loadMore,
        createPost,
        toggleReaction,
        deletePost,
        updatePost,
        togglePin,
        refresh
    } = usePosts({ channel, pageSize: 10 });

    // Re-fetch posts when user returns to the tab after inactivity
    useRefreshOnTabReturn(refresh);

    const {
        onlineMembers,
        stats,
        topContributors,
        updateLastSeen
    } = useCommunityStats();

    // Update last seen on mount
    useEffect(() => {
        if (user?.id) {
            updateLastSeen(user.id);
        }
    }, [user?.id, updateLastSeen]);

    // Filter posts by search query (client-side for now, could be server-side later)
    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 3) return posts;
        const query = searchQuery.toLowerCase();
        return posts.filter(post =>
            post.content.toLowerCase().includes(query) ||
            post.author.full_name.toLowerCase().includes(query)
        );
    }, [posts, searchQuery]);

    // Infinite Scroll Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !searchQuery) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        const target = document.getElementById("infinite-scroll-trigger");
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [hasMore, isLoading, loadMore, searchQuery]);

    const filterTabs = [
        { id: "recent", label: "Recientes" },
        { id: "popular", label: "Popular" },
        { id: "unanswered", label: "Sin responder" },
    ];
    const [activeFilter, setActiveFilter] = useState("recent");

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: EMPTY (Channels moved to center) */}
            <div className="hidden lg:block w-[120px]" />

            {/* Center Column: Feed Content */}
            <div className="flex-1 w-full max-w-[760px] mx-auto space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted group-focus-within:text-brand-accent transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar en la comunidad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-brand-card border border-brand-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all shadow-card-sm"
                    />
                </div>

                {/* Channels below buscador */}
                <div className="lg:hidden">
                    <ChannelNav activeChannel={channel} onChannelChange={setChannel} />
                </div>
                <div className="hidden lg:block bg-brand-card rounded-2xl border border-brand-border p-2 overflow-visible">
                    <ChannelNav activeChannel={channel} onChannelChange={setChannel} horizontal />
                </div>

                {/* Post creation form */}
                <PostForm onSubmit={createPost} channel={channel} />

                {/* Feed Filters */}
                <div className="flex items-center gap-2 overflow-visible py-1">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`
                                px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                                ${activeFilter === tab.id
                                    ? "bg-brand-accent/10 text-brand-accent"
                                    : "text-brand-muted hover:text-brand-text hover:bg-brand-hover-bg"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Post list */}
                <div className="space-y-4">
                    {filteredPosts.length > 0 ? (
                        <>
                            {filteredPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onToggleReaction={toggleReaction}
                                    onDelete={deletePost}
                                    onUpdate={updatePost}
                                    onTogglePin={togglePin}
                                    onSelect={setSelectedPost}
                                />
                            ))}

                            {/* Infinite scroll trigger */}
                            <div id="infinite-scroll-trigger" className="h-10 w-full" />

                            {hasMore && !searchQuery && (
                                <div className="flex justify-center pt-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-tighter">Cargando más...</span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                            <span className="text-xs font-mono text-brand-muted uppercase tracking-widest">Sincronizando feed...</span>
                        </div>
                    ) : (
                        <div className="text-center py-16 rounded-2xl border border-brand-border bg-brand-card shadow-card-sm">
                            <p className="text-4xl mb-4">📭</p>
                            <p className="text-brand-text font-bold text-lg mb-1">
                                {searchQuery ? "No encontramos nada" : "Feed vacío"}
                            </p>
                            <p className="text-brand-muted text-sm px-10">
                                {searchQuery
                                    ? `No hay publicaciones que coincidan con "${searchQuery}"`
                                    : `¡Sé el primero en iniciar la conversación en #${channel}!`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Sidebar (Hidden on mobile) */}
            <aside className="hidden lg:block w-[280px] sticky top-24">
                <CommunitySidebar
                    onlineMembers={onlineMembers}
                    stats={stats}
                    topContributors={topContributors}
                />
            </aside>

            {/* Post Modal */}
            <Modal
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                size="xl"
            >
                {selectedPost && (
                    <PostModalView
                        post={selectedPost}
                        onToggleReaction={toggleReaction}
                        onDelete={(id) => { deletePost(id); setSelectedPost(null); }}
                        onUpdate={updatePost}
                        onTogglePin={togglePin}
                    />
                )}
            </Modal>

            {/* Mobile Channel Navigation */}
            <MobileChannelNav
                activeChannel={channel}
                onChannelChange={setChannel}
            />
        </div>
    );
}

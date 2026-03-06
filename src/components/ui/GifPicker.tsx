"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "";
const GIPHY_BASE = "https://api.giphy.com/v1/gifs";

interface GifResult {
    id: string;
    title: string;
    images: {
        fixed_width: { url: string; width: string; height: string };
        original: { url: string };
        preview_gif: { url: string };
    };
}

interface GifPickerProps {
    onSelect: (gifUrl: string) => void;
    onClose: () => void;
}

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
    const [query, setQuery] = useState("");
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    const fetchGifs = useCallback(async (searchQuery: string) => {
        if (!GIPHY_API_KEY) {
            console.error("GIPHY API key not configured. Set NEXT_PUBLIC_GIPHY_API_KEY in your .env.local");
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = searchQuery.trim()
                ? `${GIPHY_BASE}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=20&rating=pg-13&lang=es`
                : `${GIPHY_BASE}/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=pg-13`;

            const res = await fetch(endpoint);
            const json = await res.json();
            setGifs(json.data || []);
            setHasSearched(true);
        } catch (err) {
            console.error("Error fetching GIFs:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load trending on mount
    useEffect(() => {
        fetchGifs("");
        inputRef.current?.focus();
    }, [fetchGifs]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchGifs(query);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, fetchGifs]);

    const handleSelect = (gif: GifResult) => {
        onSelect(gif.images.original.url);
    };

    return (
        <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in scale-in" style={{ maxHeight: "70vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-brand-border">
                <h3 className="text-sm font-bold text-brand-text">Buscar GIF</h3>
                <button
                    onClick={onClose}
                    className="p-1 text-brand-muted hover:text-brand-text transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="flex items-center gap-2 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 focus-within:border-brand-accent transition-colors">
                    <Search size={16} className="text-brand-muted flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar GIFs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent text-sm text-brand-text placeholder:text-brand-muted focus:outline-none"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="text-brand-muted hover:text-brand-text">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-3 pt-0" style={{ minHeight: "200px" }}>
                {!GIPHY_API_KEY ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-sm text-brand-muted">
                            Configura <code className="text-brand-accent">NEXT_PUBLIC_GIPHY_API_KEY</code> en tu archivo <code className="text-brand-accent">.env.local</code>
                        </p>
                        <p className="text-xs text-brand-muted mt-2">
                            Obtene una API key gratis en developers.giphy.com
                        </p>
                    </div>
                ) : isLoading && !hasSearched ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 size={24} className="animate-spin text-brand-accent" />
                    </div>
                ) : gifs.length === 0 && hasSearched ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-brand-muted">No se encontraron GIFs</p>
                    </div>
                ) : (
                    <div className="columns-2 gap-2">
                        {gifs.map((gif) => (
                            <button
                                key={gif.id}
                                onClick={() => handleSelect(gif)}
                                className="w-full mb-2 rounded-lg overflow-hidden hover:ring-2 ring-brand-accent transition-all cursor-pointer break-inside-avoid"
                                title={gif.title}
                            >
                                <img
                                    src={gif.images.fixed_width.url}
                                    alt={gif.title}
                                    width={gif.images.fixed_width.width}
                                    height={gif.images.fixed_width.height}
                                    loading="lazy"
                                    className="w-full h-auto block"
                                />
                            </button>
                        ))}
                    </div>
                )}
                {isLoading && hasSearched && (
                    <div className="flex justify-center py-3">
                        <Loader2 size={18} className="animate-spin text-brand-accent" />
                    </div>
                )}
            </div>

            {/* GIPHY attribution */}
            <div className="p-3 border-t border-brand-border flex items-center justify-center gap-2">
                <span className="text-xs text-brand-muted font-medium">Powered by</span>
                <img
                    src="https://giphy.com/static/img/giphy_logo_square_social.png"
                    alt="GIPHY"
                    className="h-6 object-contain"
                />
                <span className="text-sm font-extrabold tracking-tight text-brand-text">GIPHY</span>
            </div>
        </div>
    );
}

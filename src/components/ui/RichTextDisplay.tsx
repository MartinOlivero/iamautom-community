"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

interface RichTextDisplayProps {
    content: string;
    className?: string;
}

export default function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
    // Sanitize then process content to highlight @mentions
    const processedContent = useMemo(() => {
        if (!content) return "";
        // Sanitize HTML first to prevent XSS
        const sanitized = DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "h1", "h2", "h3", "blockquote", "img", "iframe", "span", "code", "pre"],
            ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "width", "height", "allowfullscreen", "frameborder"],
            ALLOW_DATA_ATTR: false,
        });
        // Regex to find @username and wrap in a span
        return sanitized.replace(
            /(@[a-zA-Z0-9_]+)/g,
            '<span class="text-brand-accent font-bold cursor-pointer hover:underline">$1</span>'
        );
    }, [content]);

    return (
        <div className={`rich-text-content ${className}`}>
            <div
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-brand-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            <style jsx global>{`
                .rich-text-content .prose p { margin-top: 0.5em; margin-bottom: 0.5em; }
                .rich-text-content .prose h1 { font-size: 1.875rem; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; color: var(--color-text); font-family: var(--font-display); }
                .rich-text-content .prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; color: var(--color-text); font-family: var(--font-display); }
                .rich-text-content .prose blockquote { border-left: 4px solid var(--color-accent); padding-left: 1rem; margin-left: 0; margin-right: 0; font-style: italic; color: var(--color-text-secondary); background: var(--color-hover-bg); padding: 0.5rem 1rem; border-radius: 0 0.5rem 0.5rem 0; }
                .rich-text-content .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                .rich-text-content .prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                .rich-text-content .prose img { border-radius: 0.75rem; margin: 1rem 0; max-width: 100%; height: auto; }
                .rich-text-content .prose img[src*="giphy.com"] { max-width: 280px; max-height: 200px; object-fit: cover; }
                .rich-text-content .prose iframe { border-radius: 0.75rem; overflow: hidden; margin: 1rem 0; }
            `}</style>
        </div>
    );
}

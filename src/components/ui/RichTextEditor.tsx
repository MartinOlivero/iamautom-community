import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    Youtube as YoutubeIcon,
    Undo,
    Redo
} from "lucide-react";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt("URL de la imagen:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt("URL del video de YouTube:");
        if (url) {
            editor.chain().focus().setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
            }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL del enlace:", previousUrl || "");

        // If user cancelled or entered empty string
        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }: any) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isActive
                ? "bg-brand-accent text-white shadow-sm"
                : "text-brand-text hover:bg-brand-hover-bg hover:text-brand-accent disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-brand-border bg-brand-bg-2/50 backdrop-blur-md rounded-t-xl">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Negrita"
            >
                <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Cursiva"
            >
                <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Tachado"
            >
                <Strikethrough size={16} />
            </ToolbarButton>

            <div className="w-px h-6 bg-brand-border mx-1" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                title="Título 1"
            >
                <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                title="Título 2"
            >
                <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Cita"
            >
                <Quote size={16} />
            </ToolbarButton>

            <div className="w-px h-6 bg-brand-border mx-1" />

            <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Enlace">
                <LinkIcon size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Imagen (URL)">
                <ImageIcon size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={addYoutubeVideo} title="YouTube">
                <YoutubeIcon size={16} />
            </ToolbarButton>

            <div className="flex-1" />

            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Deshacer"
            >
                <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Rehacer"
            >
                <Redo size={16} />
            </ToolbarButton>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, placeholder = "Escribe aquí..." }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto border border-brand-border shadow-md my-4',
                },
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: 'w-full aspect-video rounded-xl shadow-md my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-accent hover:underline cursor-pointer transition-colors',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-brand-text',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="w-full bg-white dark:bg-black/20 border border-brand-border rounded-input shadow-sm overflow-hidden flex flex-col focus-within:ring-2 ring-brand-accent/40 transition-all">
            <MenuBar editor={editor} />
            <div className="bg-transparent relative flex-1 cursor-text">
                <EditorContent editor={editor} className="w-full h-full" />
            </div>

            <style jsx global>{`
                /* TipTap Placeholder Styles */
                .is-editor-empty:first-child::before {
                    color: var(--color-muted);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                
                /* Base TipTap styles overrides to match our theme */
                .ProseMirror p { margin-top: 0.5em; margin-bottom: 0.5em; }
                .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; color: var(--color-text); font-family: var(--font-display); }
                .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; color: var(--color-text); font-family: var(--font-display); }
                .ProseMirror blockquote { border-left: 4px solid var(--color-accent); padding-left: 1rem; margin-left: 0; margin-right: 0; font-style: italic; color: var(--color-text-secondary); background: var(--color-hover-bg); padding: 0.5rem 1rem; border-radius: 0 0.5rem 0.5rem 0; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                .ProseMirror iframe { border-radius: 0.75rem; overflow: hidden; }
            `}</style>
        </div>
    );
}

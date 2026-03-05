import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
    Redo,
    Smile,
    X
} from "lucide-react";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useToastQueue } from "@/hooks/useToastQueue";
import { createClient } from "@/lib/insforge/client";
import Modal from "./Modal";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuBar = ({ editor }: { editor: any }) => {
    const { addToast } = useToastQueue();
    const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
    const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
    const [isUploading, setIsUploading] = useState(false);
    const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");

    const emojiMenuRef = useRef<HTMLDivElement>(null);
    const linkInputRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Link persistence in input
    useEffect(() => {
        if (!isLinkInputOpen) {
            setLinkUrl("");
        } else {
            const previousUrl = editor.getAttributes("link").href;
            setLinkUrl(previousUrl || "");
        }
    }, [isLinkInputOpen, editor]);

    // Handle click outside for link and emoji menus
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiMenuRef.current && !emojiMenuRef.current.contains(event.target as Node)) {
                setIsEmojiMenuOpen(false);
            }
            if (linkInputRef.current && !linkInputRef.current.contains(event.target as Node)) {
                setIsLinkInputOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!editor) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEmojiSelect = (emoji: any) => {
        editor.chain().focus().insertContent(emoji.native).run();
        setIsEmojiMenuOpen(false);
    };

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (linkUrl === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
        }
        setIsLinkInputOpen(false);
    };

    const handleImageSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setIsImageModalOpen(false);
            setImageUrl("");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            if (!uploadData?.url) throw new Error("No se pudo obtener la URL de la imagen");

            editor.chain().focus().setImage({ src: uploadData.url }).run();
            setIsImageModalOpen(false);
            addToast({ type: 'success', title: 'Imagen subida', message: 'La imagen se ha subido correctamente' });
        } catch (error) {
            console.error('Error uploading image:', error);
            addToast({ type: 'error', title: 'Error', message: 'No se pudo subir la imagen' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleYouTubeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (youtubeUrl) {
            editor.chain().focus().setYoutubeVideo({
                src: youtubeUrl,
                width: 640,
                height: 480,
            }).run();
            setIsYouTubeModalOpen(false);
            setYoutubeUrl("");
        }
    };

    const removeYoutubeVideo = () => {
        editor.chain().focus().deleteNode('youtube').run();
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

            <div className="relative" ref={linkInputRef}>
                <ToolbarButton
                    onClick={() => setIsLinkInputOpen(!isLinkInputOpen)}
                    isActive={editor.isActive("link") || isLinkInputOpen}
                    title="Enlace"
                >
                    <LinkIcon size={16} />
                </ToolbarButton>

                {isLinkInputOpen && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div
                            ref={linkInputRef}
                            className="w-full max-w-sm bg-brand-card border border-brand-border rounded-xl shadow-2xl p-6 space-y-4 animate-in scale-in"
                        >
                            <h3 className="text-sm font-bold text-brand-text mb-2">Insertar enlace</h3>
                            <form onSubmit={handleLinkSubmit} className="flex flex-col gap-3">
                                <input
                                    type="url"
                                    placeholder="https://ejemplo.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsLinkInputOpen(false)}
                                        className="px-4 py-2 text-xs font-bold text-brand-muted hover:text-brand-text transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-brand-accent text-white rounded-lg px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
                                    >
                                        Insertar enlace
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            <ToolbarButton onClick={() => setIsImageModalOpen(true)} title="Imagen">
                <ImageIcon size={16} />
            </ToolbarButton>

            <div className="relative">
                <ToolbarButton
                    onClick={() => setIsYouTubeModalOpen(true)}
                    title="YouTube"
                    isActive={editor.isActive('youtube') || isYouTubeModalOpen}
                >
                    <YoutubeIcon size={16} />
                </ToolbarButton>
                {editor.isActive('youtube') && (
                    <button
                        onClick={removeYoutubeVideo}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors z-10"
                        title="Eliminar video"
                    >
                        <X size={10} />
                    </button>
                )}
            </div>

            <div className="relative" ref={emojiMenuRef}>
                <ToolbarButton
                    onClick={() => setIsEmojiMenuOpen(!isEmojiMenuOpen)}
                    isActive={isEmojiMenuOpen}
                    title="Insertar Emoji"
                >
                    <Smile size={16} />
                </ToolbarButton>

                {isEmojiMenuOpen && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div
                            ref={emojiMenuRef}
                            className="relative animate-in scale-in"
                        >
                            <Picker
                                data={data}
                                onEmojiSelect={handleEmojiSelect}
                                theme="dark"
                                set="native"
                                locale="es"
                            />
                            <button
                                onClick={() => setIsEmojiMenuOpen(false)}
                                className="absolute -top-10 right-0 text-white hover:text-brand-accent transition-colors flex items-center gap-2 font-bold text-sm"
                            >
                                Esc o click fuera para cerrar <X size={20} />
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>

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

            {/* Image Upload/URL Modal */}
            <Modal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                title="Adjuntar imagen"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="flex border-b border-brand-border">
                        <button
                            onClick={() => setActiveTab("upload")}
                            className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === "upload" ? "text-brand-accent border-b-2 border-brand-accent" : "text-brand-muted hover:text-brand-text"}`}
                        >
                            Subir archivo
                        </button>
                        <button
                            onClick={() => setActiveTab("url")}
                            className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === "url" ? "text-brand-accent border-b-2 border-brand-accent" : "text-brand-muted hover:text-brand-text"}`}
                        >
                            Desde URL
                        </button>
                    </div>

                    {activeTab === "upload" ? (
                        <div className="space-y-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-brand-border rounded-xl p-8 text-center cursor-pointer hover:border-brand-accent transition-colors bg-brand-hover-bg/30"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                                        <p className="text-xs text-brand-muted text-center italic">Subiendo imagen...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-accent">
                                            <ImageIcon size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-brand-text">Haz click para seleccionar</p>
                                        <p className="text-[10px] text-brand-muted mt-1">JPG, PNG o GIF up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleImageSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider px-1">URL de la imagen</label>
                                <input
                                    type="url"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsImageModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-muted hover:text-brand-text hover:bg-brand-hover-bg transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!imageUrl}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-accent hover:opacity-90 disabled:opacity-40 transition-all shadow-lg"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>

            {/* YouTube Modal */}
            <Modal
                isOpen={isYouTubeModalOpen}
                onClose={() => setIsYouTubeModalOpen(false)}
                title="Insertar video de YouTube"
                size="sm"
            >
                <form onSubmit={handleYouTubeSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider px-1">Enlace del video</label>
                        <input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsYouTubeModalOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-muted hover:text-brand-text hover:bg-brand-hover-bg transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!youtubeUrl}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-accent hover:opacity-90 disabled:opacity-40 transition-all shadow-lg"
                        >
                            Insertar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, placeholder = "Escribe aquí...", autoFocus = false }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto border border-brand-border shadow-md my-4 cursor-pointer',
                },
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: 'w-full aspect-video rounded-xl shadow-md my-4 relative',
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
        autofocus: autoFocus,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-brand-text',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync editor content with props (important for clearing after submit)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="w-full bg-white dark:bg-black/20 border border-brand-border rounded-input shadow-sm flex flex-col focus-within:ring-2 ring-brand-accent/40 transition-all overflow-visible">
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

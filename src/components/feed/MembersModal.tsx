"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/insforge/client";

interface Member {
    id: string;
    full_name: string;
    avatar_url: string | null;
    level: number;
    created_at: string;
}

interface MembersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MembersModal({ isOpen, onClose }: MembersModalProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchMembers = async () => {
                const db = createClient();
                const { data, error } = await db
                    .from("profiles")
                    .select("id, full_name, avatar_url, created_at, level")
                    .order("created_at", { ascending: false });

                if (!error && data) {
                    setMembers(data as Member[]);
                }
                setIsLoading(false);
            };
            fetchMembers();
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Miembros de la comunidad" size="md">
            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-border h-[500px]">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-hover-bg/30 border border-brand-border/30 hover:border-brand-accent/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        name={member.full_name}
                                        imageUrl={member.avatar_url || undefined}
                                        size="md"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-brand-text">{member.full_name}</p>
                                        <p className="text-[10px] text-brand-muted">
                                            Se unió el {new Date(member.created_at).toLocaleDateString("es-AR", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                                        Nivel {member.level || 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}

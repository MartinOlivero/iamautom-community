"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface UpgradeWallProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal that appears when a Member tries to access Inner Circle content.
 * Shows an aspirational message with upgrade CTA.
 */
export default function UpgradeWall({ isOpen, onClose }: UpgradeWallProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center py-4">
                <div className="text-5xl mb-4">👑</div>
                <h3 className="text-xl font-display font-semibold mb-2">
                    Contenido Exclusivo
                </h3>
                <p className="text-brand-text-secondary text-sm mb-6 max-w-xs mx-auto">
                    Esta sección es exclusiva para miembros{" "}
                    <span className="font-semibold text-brand-gold">Inner Circle</span>.
                    Accedé a contenido VIP, chat exclusivo y más.
                </p>
                <div className="space-y-3">
                    <Button variant="gold" size="lg" className="w-full">
                        ✨ Upgrade a Inner Circle
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Quizás más tarde
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

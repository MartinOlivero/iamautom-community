import { UserLevel } from "@/types/database";

export interface LevelInfo {
    number: number;
    name: string;
    label: string;
    color: string;
    icon: string;
}

export const LEVEL_MAP: Record<UserLevel, LevelInfo> = {
    novato: { number: 1, name: "novato", label: "Novato", color: "#9CA3AF", icon: "🌱" },
    aprendiz: { number: 2, name: "aprendiz", label: "Aprendiz", color: "#60A5FA", icon: "📚" },
    automatizador: { number: 3, name: "automatizador", label: "Automatizador", color: "#34D399", icon: "⚡" },
    experto: { number: 4, name: "experto", label: "Experto", color: "#A78BFA", icon: "🧠" },
    maestro_ia: { number: 5, name: "maestro_ia", label: "Maestro IA", color: "#F59E0B", icon: "👑" },
};

export function getLevelInfo(level: UserLevel | string | undefined): LevelInfo {
    const defaultLevel = LEVEL_MAP.novato;
    if (!level) return defaultLevel;

    const key = level.toLowerCase() as UserLevel;
    return LEVEL_MAP[key] || defaultLevel;
}

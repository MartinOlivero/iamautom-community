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
    practicante: { number: 3, name: "practicante", label: "Practicante", color: "#34D399", icon: "⚡" },
    especialista: { number: 4, name: "especialista", label: "Especialista", color: "#A78BFA", icon: "🔧" },
    experto: { number: 5, name: "experto", label: "Experto", color: "#F59E0B", icon: "🧠" },
    architect: { number: 6, name: "architect", label: "Architect", color: "#F97316", icon: "🏗️" },
    innovador: { number: 7, name: "innovador", label: "Innovador", color: "#EF4444", icon: "🚀" },
    mentor: { number: 8, name: "mentor", label: "Mentor", color: "#EC4899", icon: "🎓" },
    visionario: { number: 9, name: "visionario", label: "Visionario", color: "#8B5CF6", icon: "👑" },
    automatizador: { number: 10, name: "automatizador", label: "Automatizador", color: "#F59E0B", icon: "🧠" }, // Adjusted based on legacy enums
    maestro_ia: { number: 11, name: "maestro_ia", label: "Maestro IA", color: "#8B5CF6", icon: "👑" },
};

export function getLevelInfo(level: UserLevel | string | undefined): LevelInfo {
    const defaultLevel = LEVEL_MAP.novato;
    if (!level) return defaultLevel;

    const key = level.toLowerCase() as UserLevel;
    return LEVEL_MAP[key] || defaultLevel;
}

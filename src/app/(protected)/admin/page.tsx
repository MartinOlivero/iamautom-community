import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch total members
    const { count: membersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    // Fetch total modules
    const { count: modulesCount } = await supabase
        .from("modules")
        .select("*", { count: "exact", head: true });

    // Fetch active subscriptions
    const { count: subsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("subscription_status", ["active", "trialing"]);

    return (
        <div className="space-y-8">
            <p className="text-brand-muted">
                Bienvenido al panel de administración. Desde aquí podés gestionar el contenido y ver estadísticas generales de IamAutom.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-brand-card rounded-card border border-brand-border p-5">
                    <div className="flex items-center gap-3 mb-2 text-brand-muted">
                        <span className="text-xl">👥</span>
                        <h3 className="font-medium text-sm">Usuarios Totales</h3>
                    </div>
                    <p className="text-3xl font-bold font-mono text-brand-text">
                        {membersCount || 0}
                    </p>
                </div>

                <div className="bg-brand-card rounded-card border border-brand-border p-5">
                    <div className="flex items-center gap-3 mb-2 text-brand-muted">
                        <span className="text-xl">💳</span>
                        <h3 className="font-medium text-sm">Suscripciones Activas</h3>
                    </div>
                    <p className="text-3xl font-bold font-mono text-brand-text">
                        {subsCount || 0}
                    </p>
                </div>

                <div className="bg-brand-card rounded-card border border-brand-border p-5">
                    <div className="flex items-center gap-3 mb-2 text-brand-muted">
                        <span className="text-xl">📚</span>
                        <h3 className="font-medium text-sm">Módulos de Curso</h3>
                    </div>
                    <p className="text-3xl font-bold font-mono text-brand-text">
                        {modulesCount || 0}
                    </p>
                </div>
            </div>

            {/* Admin Actions */}
            <div>
                <h2 className="text-lg font-semibold text-brand-text mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        href="/admin/cursos"
                        className="bg-brand-card rounded-card border border-brand-border p-5 flex items-center gap-4 hover:border-brand-accent/50 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-hover-bg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📚
                        </div>
                        <div>
                            <h3 className="font-semibold text-brand-text">Gestionar Cursos</h3>
                            <p className="text-sm text-brand-muted mt-1">
                                Crear, editar y organizar módulos y lecciones
                            </p>
                        </div>
                    </Link>

                    {/* Placeholder for future admin tools */}
                    <div className="bg-brand-card rounded-card border border-brand-border border-dashed p-5 flex items-center gap-4 opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 rounded-full bg-brand-hover-bg flex items-center justify-center text-2xl">
                            📢
                        </div>
                        <div>
                            <h3 className="font-semibold text-brand-text">Anuncios Globales (Pronto)</h3>
                            <p className="text-sm text-brand-muted mt-1">
                                Enviar notificaciones push a todos
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

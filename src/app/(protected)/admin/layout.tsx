import { redirect } from "next/navigation";
import { createClient } from "@/lib/insforge/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Check role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/app/feed");
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-2xl font-display font-bold text-brand-text mb-6 flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                Panel de Administración
            </h1>
            {children}
        </div>
    );
}

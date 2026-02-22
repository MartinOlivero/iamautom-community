"use client";

const GOOGLE_CALENDAR_SRC =
    "https://calendar.google.com/calendar/embed?src=ccc56afb9234251966e1982c75a1462256149d6a2d89564e92f4e6649de1ba8d%40group.calendar.google.com&ctz=America%2FArgentina%2FBuenos_Aires";

const GOOGLE_CALENDAR_ADD_URL =
    "https://calendar.google.com/calendar/u/0/r?cid=ccc56afb9234251966e1982c75a1462256149d6a2d89564e92f4e6649de1ba8d@group.calendar.google.com";

export default function CalendarioPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-display font-bold text-brand-text">
                        Calendario de Clases
                    </h1>
                    <p className="text-sm text-brand-muted mt-1">
                        Próximos eventos y clases en vivo de la comunidad
                    </p>
                </div>
                <a
                    href={GOOGLE_CALENDAR_ADD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                    📅 Agregar a mi calendario
                </a>
            </div>

            {/* Calendar embed */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-sm">
                <iframe
                    src={GOOGLE_CALENDAR_SRC}
                    className="w-full border-0"
                    style={{ height: "600px" }}
                    title="Calendario de clases IamAutom"
                />
            </div>
        </div>
    );
}

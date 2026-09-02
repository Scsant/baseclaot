import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, X, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function fmt(d) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function NotificacaoManutencaoToast() {
  const [toasts, setToasts] = useState([]);
  const [seenIds, setSeenIds] = useState(new Set());

  useEffect(() => {
    const unsub = base44.entities.NotificacaoManutencao.subscribe(async (event) => {
      if (event.type === "create") {
        const notif = event.data;
        if (!notif || seenIds.has(notif.id)) return;
        if (notif.status_novo !== "liberado") return;

        setSeenIds(prev => new Set([...prev, notif.id]));
        setToasts(prev => [...prev, { ...notif, _toastId: notif.id }]);

        // Mark as visualized after 5 min
        setTimeout(async () => {
          try {
            await base44.entities.NotificacaoManutencao.update(notif.id, {
              visualizada: true,
              data_visualizacao: new Date().toISOString(),
            });
          } catch (_) {}
        }, 5 * 60 * 1000);

        // Auto-remove toast after 4 minutes
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t._toastId !== notif.id));
        }, 4 * 60 * 1000);
      }
    });
    return unsub;
  }, [seenIds]);

  const dismiss = (toastId) => {
    setToasts(prev => prev.filter(t => t._toastId !== toastId));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: 360 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t._toastId}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-card border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white tracking-wide">MANUTENÇÃO CREARE REALIZADA</span>
              </div>
              <button onClick={() => dismiss(t._toastId)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="px-4 py-3 space-y-1.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Placa</span><p className="font-bold text-foreground">{t.placa}</p></div>
                <div><span className="text-muted-foreground">CM</span><p className="font-bold text-foreground">{t.cm}</p></div>
                {t.numero_chamado && <div><span className="text-muted-foreground">Chamado</span><p className="font-bold text-foreground">{t.numero_chamado}</p></div>}
                {t.empresa_executora && <div><span className="text-muted-foreground">Empresa</span><p className="font-bold text-foreground">{t.empresa_executora}</p></div>}
                {t.tecnico_responsavel && <div><span className="text-muted-foreground">Técnico</span><p className="font-bold text-foreground">{t.tecnico_responsavel}</p></div>}
                {t.data_notificacao && <div><span className="text-muted-foreground">Data/Hora</span><p className="font-semibold text-foreground">{fmt(t.data_notificacao)}</p></div>}
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Status: LIBERADO</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
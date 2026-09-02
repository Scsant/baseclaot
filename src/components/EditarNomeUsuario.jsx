import { useState } from "react";
import { Pencil, Check, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function EditarNomeUsuario({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!nome.trim()) { setError("Nome não pode ser vazio."); return; }
    setSaving(true);
    setError("");
    try {
      await base44.auth.updateMe({ full_name: nome.trim() });
      onUpdate && onUpdate(nome.trim());
      setEditing(false);
    } catch (e) {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNome(user?.full_name || "");
    setError("");
    setEditing(false);
  };

  return (
    <div className="w-full max-w-3xl px-4 mb-2">
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0 shadow">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nome de exibição</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={handleSave} disabled={saving}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCancel} disabled={saving}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{user?.full_name || "—"}</span>
              <button onClick={() => setEditing(true)} className="text-muted-foreground/50 hover:text-muted-foreground">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-right shrink-0">Este nome aparece<br/>nos registros do sistema</p>
      </div>
    </div>
  );
}
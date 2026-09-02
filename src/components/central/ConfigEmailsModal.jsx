import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const EMAILS_KEY = "alerta_turno_emails";

export function loadEmailsDestinatarios() {
  try {
    const raw = localStorage.getItem(EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function ConfigEmailsModal({ open, onClose }) {
  const [emails, setEmails] = useState([]);
  const [novoEmail, setNovoEmail] = useState("");

  useEffect(() => {
    if (open) setEmails(loadEmailsDestinatarios());
  }, [open]);

  const handleAdd = () => {
    const trimmed = novoEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Insira um email válido.");
      return;
    }
    if (emails.includes(trimmed)) {
      toast.error("Email já adicionado.");
      return;
    }
    setEmails((prev) => [...prev, trimmed]);
    setNovoEmail("");
  };

  const handleRemove = (email) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSave = () => {
    localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
    toast.success("Emails salvos com sucesso!");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-blue-500" />
            Destinatários do Alerta de Turno
          </SheetTitle>
        </SheetHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Os emails abaixo receberão o alerta automático 10 minutos antes do fim de cada turno.
        </p>

        {/* Add email */}
        <div className="flex gap-2 mb-4">
          <Input
            type="email"
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="email@exemplo.com"
            className="flex-1 h-9"
          />
          <Button size="sm" onClick={handleAdd} className="gap-1 shrink-0">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {/* List */}
        {emails.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhum destinatário cadastrado.
          </div>
        ) : (
          <ul className="space-y-2 mb-6">
            {emails.map((email) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
              >
                <span className="text-sm truncate">{email}</span>
                <button
                  onClick={() => handleRemove(email)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-4 border-t border-border">
          <Button onClick={handleSave} className="w-full h-10 gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
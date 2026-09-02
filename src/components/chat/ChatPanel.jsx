import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { MessageCircle, Send, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatTime(dateStr) {
  if (!dateStr) return "";
  return format(new Date(dateStr), "HH:mm", { locale: ptBR });
}

export default function ChatPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const prevCountRef = useRef(0);

  const [mensagens, setMensagens] = useState([]);

  // Carrega mensagens e aplica limpeza de antigas (>8h) via deleteMany
  const carregarMensagens = async () => {
    try {
      const cutoff = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
      await base44.entities.ChatMensagem.deleteMany({ created_date: { $lt: cutoff } });
    } catch (_) {}
    try {
      const data = await base44.entities.ChatMensagem.list("created_date", 200);
      setMensagens(data);
    } catch (_) {}
  };

  useEffect(() => {
    carregarMensagens();
    // Limpeza periódica a cada 30min
    const interval = setInterval(carregarMensagens, 30 * 60 * 1000);
    // Subscrição em tempo real
    const unsub = base44.entities.ChatMensagem.subscribe(() => {
      base44.entities.ChatMensagem.list("created_date", 200).then(setMensagens).catch(() => {});
    });
    return () => { clearInterval(interval); unsub(); };
  }, []);

  // Track unread messages + play sound
  useEffect(() => {
    if (!open && mensagens.length > prevCountRef.current) {
      const newCount = mensagens.length - prevCountRef.current;
      setUnread((u) => u + newCount);
      // Play notification sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch (_) {}
    }
    prevCountRef.current = mensagens.length;
  }, [mensagens.length, open]);

  // Clear unread on open
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // Scroll to bottom on new messages when open
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens, open]);

  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = texto.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setTexto("");
    try {
      await base44.entities.ChatMensagem.create({
        texto: trimmed,
        autor_nome: user?.full_name || "Usuário",
        autor_role: user?.role || "operador",
        data_envio: new Date().toISOString(),
      });
    } catch (_) {}
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const myRole = user?.role || "operador";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {/* Chat Window */}
      {open && (
        <div className="w-80 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "460px" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">Chat Balança ↔ Central</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-muted/30">
            {mensagens.length === 0 && (
              <div className="text-center text-xs text-muted-foreground mt-10">
                Nenhuma mensagem ainda.<br />Inicie a conversa!
              </div>
            )}
            {mensagens.map((msg) => {
              const isMe = msg.autor_nome === user?.full_name;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card text-foreground border border-border rounded-bl-sm"
                  }`}>
                    <p className={`text-[10px] font-semibold mb-0.5 ${
                      isMe
                        ? "text-primary-foreground/80 text-right"
                        : msg.autor_role === "central" ? "text-blue-500" : "text-amber-500"
                    }`}>
                      {msg.autor_nome}
                    </p>
                    <p className="leading-snug break-words">{msg.texto}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatTime(msg.data_envio || msg.created_date)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Bar */}
          <div className="px-3 pt-2 bg-card flex items-center gap-1 flex-wrap">
            {["👍", "✅", "⚠️", "🚛", "🔴", "🟢", "⏳", "📋", "🚨", "👀"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setTexto((t) => t + emoji)}
                className="text-base hover:scale-125 transition-transform px-1"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-border bg-card flex items-center gap-2">
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem..."
              className="h-9 text-sm rounded-full bg-muted border-none focus-visible:ring-1"
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-full shrink-0"
              onClick={handleSend}
              disabled={!texto.trim() || isSending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 transition-transform ${
          !open && unread > 0 ? "animate-bounce" : ""
        }`}
      >
        {/* Ping ring when unread */}
        {!open && unread > 0 && (
          <span className="absolute inset-0 rounded-full bg-primary opacity-40 animate-ping" />
        )}
        {open ? <ChevronDown className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Loader2, RefreshCw, MessageSquare } from "lucide-react";
import MessageBubble from "@/components/agente-turno/MessageBubble";

export default function AgenteTurnoManager() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const bottomRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const startConversation = async () => {
    setIsCreating(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "turno_manager",
        metadata: { name: "Troca de Turno", description: "Sessão de gerenciamento de turno" }
      });
      setConversation(conv);
      setMessages(conv.messages || []);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    if (unsubscribeRef.current) unsubscribeRef.current();
    unsubscribeRef.current = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setIsSending(false);
    });
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending || !conversation) return;
    const text = input.trim();
    setInput("");
    setIsSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = async () => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    setConversation(null);
    setMessages([]);
    await startConversation();
  };

  const suggestions = [
    "Faça a troca de turno completa com todas as informações do sistema",
    "Mostre os módulos, produção, equipamentos e impactos",
    "Liste as pendências críticas para o próximo turno",
    "Resuma frota, OTs, desvios e caminhões indisponíveis",
    "Mostre bloqueios de distribuição e manutenção em aberto",
    "Compare o TPA de abertura com o atual",
  ];

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)] max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base">Agente de Troca de Turno</h2>
            <p className="text-xs text-muted-foreground">Leitura integrada e passagem de turno estruturada</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleReset} title="Nova conversa">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 space-y-5 bg-background">
        {isCreating ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">Como posso ajudar?</p>
              <p className="text-sm text-muted-foreground">Pergunte sobre caminhões, turnos ou status operacional</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); }}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-card rounded-b-xl">
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Agente processando...</span>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre caminhões, turnos, módulos..."
            disabled={isSending || isCreating}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isSending || isCreating} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
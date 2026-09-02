import { Bot, Loader2, User } from "lucide-react";
import MarkdownReport from "@/components/agente-turno/MarkdownReport";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isUser ? "bg-primary" : "bg-slate-700"}`}>
        {isUser ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-white" />}
      </div>
      <div className={`rounded-2xl px-4 py-3 ${isUser ? "max-w-[80%] rounded-tr-sm bg-primary text-sm text-primary-foreground" : "min-w-0 max-w-[94%] flex-1 rounded-tl-sm border border-border bg-card shadow-sm"}`}>
        {isUser ? <p className="leading-6">{message.content}</p> : <MarkdownReport>{message.content}</MarkdownReport>}
        {message.tool_calls?.map((toolCall, index) => {
          const running = ["pending", "running", "in_progress"].includes(toolCall.status);
          const failed = ["failed", "error"].includes(toolCall.status);
          return (
            <div key={index} className="mt-3 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
              {running && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>{running ? "Consultando informações do sistema..." : failed ? "Não foi possível consultar uma fonte" : "✓ Informações consultadas"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
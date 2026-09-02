import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "distribuicao_fazendas";
const ALERTA_KEY = "alerta_turno_enviado";
const EMAILS_KEY = "alerta_turno_emails";

function getEmailsDestinatarios() {
  try {
    const raw = localStorage.getItem(EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Horários de fim de turno (hora exata em que o turno termina)
const FIM_TURNOS = [
  { turno: 1, hora: 14, minuto: 0 },
  { turno: 2, hora: 22, minuto: 0 },
  { turno: 3, hora: 6,  minuto: 0 },
];

function getAlertaKey(turno, date) {
  const d = new Date(date);
  return `${turno}_${d.toDateString()}`;
}

function jaEnviou(turno, date) {
  try {
    const raw = localStorage.getItem(ALERTA_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return !!map[getAlertaKey(turno, date)];
  } catch {
    return false;
  }
}

function marcarEnviado(turno, date) {
  try {
    const raw = localStorage.getItem(ALERTA_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[getAlertaKey(turno, date)] = true;
    localStorage.setItem(ALERTA_KEY, JSON.stringify(map));
  } catch {}
}

function getMinutosParaFim(turno, agora) {
  const h = agora.getHours();
  const m = agora.getMinutes();
  const totalMinutosAgora = h * 60 + m;

  const ft = FIM_TURNOS.find((f) => f.turno === turno);
  if (!ft) return Infinity;

  let totalMinutosFim = ft.hora * 60 + ft.minuto;

  // Para o 3° turno (fim às 06:00), se agora é depois das 22:00, fim é amanhã
  if (turno === 3 && totalMinutosAgora >= 22 * 60) {
    totalMinutosFim += 24 * 60;
  }

  let diff = totalMinutosFim - totalMinutosAgora;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function getTurnoAtivo(agora) {
  const h = agora.getHours();
  if (h >= 6 && h < 14) return 1;
  if (h >= 14 && h < 22) return 2;
  return 3;
}

function getDesvios(solicitacoes) {
  return solicitacoes.filter((s) => s.is_desvio);
}

function getProjetosBloqueados() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    const btfs = data.btfs || {};
    return Object.entries(btfs)
      .filter(([k, v]) => k.startsWith("linha_") && v?.bloqueado && v?.fazenda)
      .map(([, v]) => ({ fazenda: v.fazenda || "—", modulo: v.modulo || "—", motivo: v.motivo_bloqueio || "Não informado", bloqueio_em: v.bloqueio_em || null }));
  } catch {
    return [];
  }
}

async function enviarEmail(turno, desvios, bloqueados, destinatarios) {
  const turnoLabels = { 1: "1º Turno (06:00 - 14:00)", 2: "2º Turno (14:00 - 22:00)", 3: "3º Turno (22:00 - 06:00)" };

  let corpo = `<h2>⚠️ Alerta de Encerramento de Turno — ${turnoLabels[turno]}</h2>`;
  corpo += `<p>Faltam <strong>10 minutos</strong> para o encerramento do ${turnoLabels[turno]}.</p>`;
  corpo += `<hr/>`;

  // Caminhões desviados
  corpo += `<h3>🔀 Caminhões Desviados (${desvios.length})</h3>`;
  if (desvios.length === 0) {
    corpo += `<p><em>Nenhum caminhão desviado neste turno.</em></p>`;
  } else {
    corpo += `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">`;
    corpo += `<tr><th>Placa</th><th>Frota</th><th>BTF</th><th>Fazenda Origem</th><th>Novo Destino</th><th>Motivo</th></tr>`;
    desvios.forEach((s) => {
      corpo += `<tr>
        <td><strong>${s.placa || s.cm || "—"}</strong></td>
        <td>${s.frota || "—"}</td>
        <td>${s.btf || "—"}</td>
        <td>${s.fazenda_origem || "—"}</td>
        <td>${s.fazenda_destino_desvio || "—"}</td>
        <td>${s.motivo_desvio || "—"}</td>
      </tr>`;
    });
    corpo += `</table>`;
  }

  corpo += `<br/>`;

  // Projetos bloqueados
  corpo += `<h3>🚫 Projetos / Fazendas Bloqueadas (${bloqueados.length})</h3>`;
  if (bloqueados.length === 0) {
    corpo += `<p><em>Nenhum projeto bloqueado.</em></p>`;
  } else {
    corpo += `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">`;
    corpo += `<tr><th>Fazenda</th><th>Módulo</th><th>Motivo do Bloqueio</th><th>Bloqueado Desde</th></tr>`;
    bloqueados.forEach((b) => {
      const bloqHora = b.bloqueio_em ? new Date(b.bloqueio_em).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";
      corpo += `<tr>
        <td><strong>${b.fazenda}</strong></td>
        <td>${b.modulo}</td>
        <td>${b.motivo}</td>
        <td>${bloqHora}</td>
      </tr>`;
    });
    corpo += `</table>`;
  }

  corpo += `<br/><p style="color:#888;font-size:12px">Email gerado automaticamente pelo Sistema OT.</p>`;

  if (destinatarios.length === 0) return;
  // Envia um único email para o primeiro destinatário; os demais no campo to separado não é suportado,
  // então enviamos sequencialmente com um delay para evitar rate limit
  for (let i = 0; i < destinatarios.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2000));
    await base44.integrations.Core.SendEmail({
      to: destinatarios[i],
      subject: `[Sistema OT] Alerta: 10 min para fim do ${turnoLabels[turno]}`,
      body: corpo,
    });
  }
}

/**
 * Hook que monitora o tempo e envia email 10 minutos antes do fim do turno ativo.
 * Recebe a lista de solicitações atual.
 */
export function useAlertaTurno(solicitacoes = []) {
  const solicitacoesRef = useRef(solicitacoes);
  useEffect(() => { solicitacoesRef.current = solicitacoes; }, [solicitacoes]);

  useEffect(() => {
    const check = async () => {
      const agora = new Date();
      const turnoAtivo = getTurnoAtivo(agora);
      const minutos = getMinutosParaFim(turnoAtivo, agora);

      // Janela: entre 9 e 11 minutos para o fim (verificação a cada 60s)
      if (minutos >= 9 && minutos <= 11) {
        if (!jaEnviou(turnoAtivo, agora)) {
          const destinatarios = getEmailsDestinatarios();
          if (destinatarios.length > 0) {
            marcarEnviado(turnoAtivo, agora);
            const desvios = getDesvios(solicitacoesRef.current);
            const bloqueados = getProjetosBloqueados();
            await enviarEmail(turnoAtivo, desvios, bloqueados, destinatarios);
          }
        }
      }
    };

    // Verifica imediatamente e a cada 60 segundos
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);
}
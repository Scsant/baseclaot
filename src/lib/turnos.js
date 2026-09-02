/**
 * Turnos:
 *  1° Turno: 06:00 – 14:00
 *  2° Turno: 14:00 – 22:00
 *  3° Turno: 22:00 – 06:00 (cruza meia-noite)
 */

export const TURNOS = [
  { id: 1, label: "1º Turno", horario: "06:00 - 14:00", inicio: 6, fim: 14, color: "blue", icon: "" },
  { id: 2, label: "2º Turno", horario: "14:00 - 22:00", inicio: 14, fim: 22, color: "amber", icon: "" },
  { id: 3, label: "3º Turno", horario: "22:00 - 06:00", inicio: 22, fim: 6, color: "purple", icon: "" },
];

/** Retorna o turno (1, 2 ou 3) de uma data qualquer */
export function getTurno(date) {
  const d = date instanceof Date ? date : new Date(date);
  const h = d.getHours();
  if (h >= 6 && h < 14) return 1;
  if (h >= 14 && h < 22) return 2;
  return 3; // 22:00 – 06:00
}

/** Retorna o turno atual */
export function getTurnoAtual() {
  return getTurno(new Date());
}

/**
 * Dado um Date de referência (normalmente hoje), retorna o intervalo
 * [start, end) em timestamps para o turno informado.
 *
 * Para o 3° turno cruzando meia-noite:
 *   - Se agora é entre 00:00-05:59 → a "noite" começou ontem às 22:00
 *   - Se agora é entre 22:00-23:59 → a "noite" começa hoje às 22:00
 */
export function getTurnoInterval(turnoId, refDate = new Date()) {
  const ref = new Date(refDate);

  if (turnoId === 1) {
    const start = new Date(ref);
    start.setHours(6, 0, 0, 0);
    const end = new Date(ref);
    end.setHours(14, 0, 0, 0);
    return { start, end };
  }

  if (turnoId === 2) {
    const start = new Date(ref);
    start.setHours(14, 0, 0, 0);
    const end = new Date(ref);
    end.setHours(22, 0, 0, 0);
    return { start, end };
  }

  // Turno 3: 22:00 → 06:00 do dia seguinte
  const h = ref.getHours();
  let start, end;
  if (h < 6) {
    // Estamos na madrugada — a noite começou ontem
    start = new Date(ref);
    start.setDate(start.getDate() - 1);
    start.setHours(22, 0, 0, 0);
    end = new Date(ref);
    end.setHours(6, 0, 0, 0);
  } else {
    // Ainda não começou ou já é noite de hoje
    start = new Date(ref);
    start.setHours(22, 0, 0, 0);
    end = new Date(ref);
    end.setDate(end.getDate() + 1);
    end.setHours(6, 0, 0, 0);
  }
  return { start, end };
}

/** Filtra uma lista de registros pelo turno, usando o campo de data informado */
export function filtrarPorTurno(lista, turnoId, campoData = "data_solicitacao") {
  const { start, end } = getTurnoInterval(turnoId);
  return lista.filter((item) => {
    const d = item[campoData] ? new Date(item[campoData]) : null;
    if (!d) return false;
    return d >= start && d < end;
  });
}
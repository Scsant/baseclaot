import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_CORES = {
  programado: "#94a3b8",
  em_transito_ida: "#3b82f6",
  em_fila: "#f59e0b",
  carregando: "#8b5cf6",
  em_transito_volta: "#06b6d4",
  concluido: "#22c55e",
};

const STATUS_LABELS = {
  programado: "Programado",
  em_transito_ida: "Trânsito →",
  em_fila: "Em Fila",
  carregando: "Carregando",
  em_transito_volta: "Retornando",
  concluido: "Concluído",
};

export default function GraficoDistribuicao({ caminhoes }) {
  // Por status
  const statusData = Object.entries(STATUS_LABELS).map(([k, label]) => ({
    name: label,
    qtd: caminhoes.filter((c) => c.status === k).length,
    fill: STATUS_CORES[k],
  })).filter((d) => d.qtd > 0);

  // Por fazenda
  const porFazenda = {};
  caminhoes.forEach((c) => {
    const k = c.fazenda_nome || "Sem fazenda";
    porFazenda[k] = (porFazenda[k] || 0) + 1;
  });
  const fazendaData = Object.entries(porFazenda)
    .map(([name, qtd]) => ({ name, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold mb-3 text-foreground">Caminhões por Status</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={statusData} margin={{ left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="qtd" name="Qtd." radius={[4, 4, 0, 0]}>
              {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold mb-3 text-foreground">Caminhões por Fazenda</p>
        {fazendaData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fazendaData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="qtd" name="Caminhões" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
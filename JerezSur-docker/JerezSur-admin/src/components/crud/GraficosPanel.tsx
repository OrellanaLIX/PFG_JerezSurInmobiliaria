// Componente que muestra los gráficos del panel de estadísticas del admin.
// Llama al backend que a su vez llama al microservicio Python (matplotlib) para generar las imágenes en base64.
import { useEffect, useState } from 'react';
import api from '../../services/api';

interface PanelData {
  kpis: {
    inmuebles: number;
    clientes: number;
    visitas: number;
    contratos: number;
  };
  graficos: {
    kpis?: string;
    barras?: string;
    dona?: string;
    evolucion?: string;
  };
}

const KPI_META = [
  { key: 'inmuebles', label: 'Inmuebles activos', icon: '🏠', color: '#00439c' },
  { key: 'clientes',  label: 'Clientes nuevos',   icon: '👥', color: '#4a9e2f' },
  { key: 'visitas',   label: 'Citas próximas',    icon: '📅', color: '#d97706' },
  { key: 'contratos', label: 'Contratos activos', icon: '📋', color: '#c0392b' },
] as const;

export const GraficosPanel = () => {
  const [panel, setPanel] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<PanelData>('/estadisticas/panel')
      .then(({ data }) => setPanel(data))
      .catch(() => {
        // Fallback: intenta el endpoint antiguo
        api.get<{ datos: PanelData['kpis']; imagen: string }>('/estadisticas/dashboard')
          .then(({ data }) => setPanel({
            kpis: data.datos,
            graficos: { kpis: data.imagen },
          }))
          .catch(() => setError('No se pudieron cargar las estadísticas'));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="graficos-loading">Cargando estadísticas…</div>;
  if (error) return <div className="graficos-error">{error}</div>;
  if (!panel) return null;

  const { kpis, graficos } = panel;
  const tienePython = !!(graficos.kpis || graficos.barras || graficos.dona || graficos.evolucion);

  return (
    <section className="graficos-panel">

      {/* ── KPI cards nativas (siempre visibles) ── */}
      <div className="kpi-grid">
        {KPI_META.map(({ key, label, icon, color }) => (
          <div key={key} className="kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
            <div className="kpi-card__accent" />
            <div className="kpi-card__body">
              <span className="kpi-card__icon">{icon}</span>
              <span className="kpi-card__value">{(kpis as any)[key] ?? 0}</span>
            </div>
            <p className="kpi-card__label">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Gráficos de Python — solo los más compactos ── */}
      {tienePython && (
        <>
          {/* Barras mensuales */}
          {graficos.barras && (
            <div className="grafico-bloque">
              <img src={`data:image/png;base64,${graficos.barras}`}
                   alt="Operaciones por mes" className="grafico-img" />
            </div>
          )}

          {/* Dona de distribución de clientes — Evolución de registros eliminada */}
          {graficos.dona && (
            <div className="grafico-bloque grafico-bloque--full">
              <img src={`data:image/png;base64,${graficos.dona}`}
                   alt="Distribución de clientes" className="grafico-img" />
            </div>
          )}
        </>
      )}
    </section>
  );
};

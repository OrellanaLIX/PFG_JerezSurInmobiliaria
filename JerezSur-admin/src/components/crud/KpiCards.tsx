import { useEffect, useState } from "react";
import api from "../../services/api";

export const KpiCards = () => {
  const [imagen, setImagen] = useState<string | null>(null);
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => {
    api.get('/estadisticas/dashboard').then(({ data }) => {
      setImagen(data.imagen || null);
      setDatos(data.datos);
    });
  }, []);

  // Si Python está disponible → muestra el gráfico bonito
  if (imagen) {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px',
                    border: '1px solid #eee' }}>
        <img src={`data:image/png;base64,${imagen}`}
             alt="KPIs del dashboard"
             style={{ width: '100%', height: 'auto' }} />
      </div>
    );
  }

  // Fallback → muestra los datos simples si Python no responde
  if (!datos) return <p>Cargando...</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
      {[
        { label: 'Inmuebles activos', value: datos.inmuebles },
        { label: 'Clientes nuevos',   value: datos.clientes },
        { label: 'Visitas',           value: datos.visitas },
        { label: 'Contratos',         value: datos.contratos },
      ].map(kpi => (
        <div key={kpi.label} style={{ padding: '16px', border: '1px solid #eee',
                                      borderRadius: '8px', textAlign: 'center' }}>
          <strong style={{ fontSize: '28px' }}>{kpi.value}</strong>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>{kpi.label}</p>
        </div>
      ))}
    </div>
  );
};
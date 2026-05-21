interface KpiCardsProps {
  inmuebles: number;
  clientes: number;
  visitas: number;
  contratos: number;
}

export const KpiCards = ({ inmuebles, clientes, visitas, contratos }: KpiCardsProps) => {
  const kpis = [
    { label: 'Inmuebles activos', value: inmuebles },
    { label: 'Clientes nuevos', value: clientes },
    { label: 'Visitas programadas', value: visitas },
    { label: 'Contratos pendientes', value: contratos },
  ];

  return (
    <div>
      {kpis.map((kpi) => (
        <div key={kpi.label}>
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
        </div>
      ))}
    </div>
  );
};
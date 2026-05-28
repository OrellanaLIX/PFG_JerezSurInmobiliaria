import { useDashboard } from '../hooks/useDashboard';
import { KpiCards } from '../components/crud/KpiCards';
import { TareasPendientes } from '../components/crud/TareasPendientes';
import '../styles/pages/CrudPages.scss';

const DashboardResumen = () => {
  const { data, loading, error, crearTarea, eliminarTarea } = useDashboard();

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;

  return (
    <div>
      <h1>Dashboard</h1>

      <KpiCards />

      <TareasPendientes
        tareas={data.tareas}
        onCrear={crearTarea}
        onCompletar={eliminarTarea}
      />
    </div>
  );
};

export default DashboardResumen;
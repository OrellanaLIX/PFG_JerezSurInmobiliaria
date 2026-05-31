import { useDashboard } from '../hooks/useDashboard';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import { KpiCards } from '../components/crud/KpiCards';
import { TareasPendientes } from '../components/crud/TareasPendientes';
import '../styles/pages/CrudPages.scss';

const DashboardResumen = () => {
  const { data, loading, error, crearTarea, eliminarTarea } = useDashboard();
  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const handleCrearTarea = async (tarea: any) => {
    try {
      await crearTarea(tarea);
      showSuccess('Tarea creada correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al crear la tarea.');
    }
  };

  const handleEliminarTarea = async (id: number) => {
    try {
      await eliminarTarea(id);
      showSuccess('Tarea completada.');
    } catch {
      showError('Error al completar la tarea.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <h1>Dashboard</h1>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      <KpiCards />

      <TareasPendientes
        tareas={data.tareas}
        onCrear={handleCrearTarea}
        onCompletar={handleEliminarTarea}
      />
    </div>
  );
};

export default DashboardResumen;

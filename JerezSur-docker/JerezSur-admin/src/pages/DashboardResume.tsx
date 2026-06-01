import { useDashboard } from '../hooks/useDashboard';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import { GraficosPanel } from '../components/crud/GraficosPanel';
import { TareasPendientes } from '../components/crud/TareasPendientes';
import '../styles/pages/Dashboard.scss';

const DashboardResumen = () => {
  const { data, loading, error, crearTarea, eliminarTarea } = useDashboard();
  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const hora = new Date().getHours();
  const saludo = hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  const handleCrear = async (t: any) => {
    try   { await crearTarea(t); showSuccess('Tarea creada.'); }
    catch (e: any) { showError(e?.response?.data?.message ?? 'Error al crear la tarea.'); }
  };

  const handleCompletar = async (id: number) => {
    try   { await eliminarTarea(id); showSuccess('Tarea completada.'); }
    catch { showError('Error al completar la tarea.'); }
  };

  return (
    <div className="dash">

      {/* Header compacto */}
      <header className="dash__header">
        <div>
          <p className="dash__saludo">{saludo} 👋</p>
          <h1 className="dash__titulo">Panel de control</h1>
        </div>
        <span className="dash__badge">JerezSur Inmobiliaria</span>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      {/* Layout de dos columnas: stats izq | tareas der */}
      <div className="dash__body">

        {/* Columna izquierda — estadísticas */}
        <section className="dash__col dash__col--stats">
          <GraficosPanel />
        </section>

        {/* Columna derecha — tareas */}
        <aside className="dash__col dash__col--tasks">
          {loading && (
            <div className="dash__loading">
              <div className="dash__spinner" />
              <span>Cargando…</span>
            </div>
          )}
          {error && <p className="dash__error">{error}</p>}
          {data && (
            <TareasPendientes
              tareas={data.tareas}
              onCrear={handleCrear}
              onCompletar={handleCompletar}
            />
          )}
        </aside>
      </div>
    </div>
  );
};

export default DashboardResumen;

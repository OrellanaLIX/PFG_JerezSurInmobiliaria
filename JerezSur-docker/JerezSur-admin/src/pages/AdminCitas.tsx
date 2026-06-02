// Página de gestión de citas del panel de administración.
// Permite ver las citas en vista calendario o en lista, y gestionarlas (aceptar, completar, cancelar).
import { useState, useCallback } from 'react';
import { useCitas } from '../hooks/useCitas';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import { Calendario } from '../components/crud/Citas/Calendario';
import { ListaCitas } from '../components/crud/Citas/ListaCitas';
import { DetalleCitaModal } from '../components/crud/Citas/DetalleCita';
import { FormCitaModal } from '../components/crud/Citas/FormCitaModal';
import type { Cita, EstadoCita } from '../types/cita';
import '../styles/pages/CrudPages.scss';

// Tipo para alternar entre las dos vistas disponibles
type Vista = 'calendario' | 'lista';

const AdminCitas = () => {
  // useCitas carga las citas del backend y expone las operaciones sobre ellas
  const {
    citas,
    loading,
    error,
    crear,
    aceptar,
    completar,
    cancelar,
    noPresentado,
  } = useCitas();

  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const hoy = new Date();
  // Estado para el mes y año que muestra el calendario
  const [año, setAño] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [vista, setVista] = useState<Vista>('calendario');
  // filtroEstado permite ver solo citas de un estado concreto en la vista lista
  const [filtroEstado, setFiltroEstado] = useState<EstadoCita | 'TODAS'>('TODAS');
  // Cita que se está viendo en el modal de detalle (null = ninguna)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  // fechaInicialForm: cuando el trabajador pulsa un día del calendario, se pasa como fecha sugerida al formulario
  const [fechaInicialForm, setFechaInicialForm] = useState<Date | undefined>(undefined);

  // Navega al mes anterior o siguiente gestionando el cambio de año automáticamente
  const cambiarMes = useCallback((delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAño = año;
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAño--; }
    else if (nuevoMes > 11) { nuevoMes = 0; nuevoAño++; }
    setMes(nuevoMes);
    setAño(nuevoAño);
  }, [año, mes]);

  const irHoy = useCallback(() => {
    const ahora = new Date();
    setAño(ahora.getFullYear());
    setMes(ahora.getMonth());
  }, []);

  const handleCrear = async (datos: any) => {
    try {
      await crear(datos);
      setMostrarForm(false);
      setFechaInicialForm(undefined);
      showSuccess('Cita creada correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al crear la cita.');
    }
  };

  const handleAceptar = async (id: number) => {
    try {
      await aceptar(id);
      setCitaSeleccionada(null);
      showSuccess('Cita aceptada.');
    } catch { showError('Error al aceptar la cita.'); }
  };

  const handleCompletar = async (id: number) => {
    try {
      await completar(id);
      setCitaSeleccionada(null);
      showSuccess('Cita completada.');
    } catch { showError('Error al completar la cita.'); }
  };

  const handleCancelar = async (id: number) => {
    try {
      await cancelar(id);
      setCitaSeleccionada(null);
      showSuccess('Cita cancelada.');
    } catch { showError('Error al cancelar la cita.'); }
  };

  const handleNoPresentado = async (id: number) => {
    try {
      await noPresentado(id);
      setCitaSeleccionada(null);
      showSuccess('Cita marcada como no presentado.');
    } catch { showError('Error al actualizar la cita.'); }
  };

  if (loading) return <p>Cargando citas...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>Gestión de Citas</h1>
        <div className="actions">
          <button
            className={`btn ${vista === 'calendario' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setVista('calendario')}
            disabled={vista === 'calendario'}
          >
            Calendario
          </button>
          <button
            className={`btn ${vista === 'lista' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setVista('lista')}
            disabled={vista === 'lista'}
          >
            Lista
          </button>
          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            + Nueva cita
          </button>
        </div>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      {vista === 'calendario' && (
        <Calendario
          año={año}
          mes={mes}
          citas={citas}
          onCambiarMes={cambiarMes}
          onIrHoy={irHoy}
          onClickCita={setCitaSeleccionada}
          onClickDia={fecha => { setFechaInicialForm(fecha); setMostrarForm(true); }}
        />
      )}

      {vista === 'lista' && (
        <ListaCitas
          citas={citas}
          onClickCita={setCitaSeleccionada}
          filtroEstado={filtroEstado}
          onCambiarFiltro={setFiltroEstado}
        />
      )}

      {citaSeleccionada && (
        <DetalleCitaModal
          cita={citaSeleccionada}
          onCerrar={() => setCitaSeleccionada(null)}
          onAceptar={handleAceptar}
          onCompletar={handleCompletar}
          onCancelar={handleCancelar}
          onNoPresentado={handleNoPresentado}
        />
      )}

      {mostrarForm && (
        <FormCitaModal
          fechaInicial={fechaInicialForm}
          onCrear={handleCrear}
          onCancelar={() => { setMostrarForm(false); setFechaInicialForm(undefined); }}
        />
      )}
    </div>
  );
};

export default AdminCitas;

import { useState, useCallback } from 'react';
import { useCitas } from '../hooks/useCitas';
import { Calendario } from '../components/crud/Citas/Calendario';
import { ListaCitas } from '../components/crud/Citas/ListaCitas';
import { DetalleCita } from '../components/crud/Citas/DetalleCita';
import { FormCita } from '../components/crud/Citas/FormCita';
import type { Cita, EstadoCita } from '../types/cita';

type Vista = 'calendario' | 'lista';

const AdminCitas = () => {
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

  const hoy = new Date();
  const [año, setAño] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [vista, setVista] = useState<Vista>('calendario');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCita | 'TODAS'>('TODAS');

  // Modal de detalle
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  // Modal de creación
  const [mostrarForm, setMostrarForm] = useState(false);
  const [fechaInicialForm, setFechaInicialForm] = useState<Date | undefined>(undefined);

  const cambiarMes = useCallback((delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAño = año;

    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAño--;
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAño++;
    }

    setMes(nuevoMes);
    setAño(nuevoAño);
  }, [año, mes]);

  const irHoy = useCallback(() => {
    const ahora = new Date();
    setAño(ahora.getFullYear());
    setMes(ahora.getMonth());
  }, []);

  const handleClickDia = useCallback((fecha: Date) => {
    setFechaInicialForm(fecha);
    setMostrarForm(true);
  }, []);

  const handleClickCita = useCallback((cita: Cita) => {
    setCitaSeleccionada(cita);
  }, []);

  const cerrarDetalle = useCallback(() => {
    setCitaSeleccionada(null);
  }, []);

  const cerrarForm = useCallback(() => {
    setMostrarForm(false);
    setFechaInicialForm(undefined);
  }, []);

  // Wrappers para cerrar el detalle tras una acción
  const handleAceptar = async (id: number) => {
    await aceptar(id);
    cerrarDetalle();
  };

  const handleCompletar = async (id: number) => {
    await completar(id);
    cerrarDetalle();
  };

  const handleCancelar = async (id: number) => {
    await cancelar(id);
    cerrarDetalle();
  };

  const handleNoPresentado = async (id: number) => {
    await noPresentado(id);
    cerrarDetalle();
  };

  if (loading) return <p>Cargando citas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <header>
        <h1>Gestión de Citas</h1>

        <div>
          <button
            onClick={() => setVista('calendario')}
            disabled={vista === 'calendario'}
          >
            📅 Calendario
          </button>
          <button
            onClick={() => setVista('lista')}
            disabled={vista === 'lista'}
          >
            📋 Lista
          </button>
          <button onClick={() => setMostrarForm(true)}>
            + Nueva cita
          </button>
        </div>
      </header>

      {/* Vista de calendario */}
      {vista === 'calendario' && (
        <Calendario
          año={año}
          mes={mes}
          citas={citas}
          onCambiarMes={cambiarMes}
          onIrHoy={irHoy}
          onClickCita={handleClickCita}
          onClickDia={handleClickDia}
        />
      )}

      {/* Vista de lista */}
      {vista === 'lista' && (
        <ListaCitas
          citas={citas}
          onClickCita={handleClickCita}
          filtroEstado={filtroEstado}
          onCambiarFiltro={setFiltroEstado}
        />
      )}

      {/* Modal de detalle */}
      {citaSeleccionada && (
        <DetalleCita
          cita={citaSeleccionada}
          onCerrar={cerrarDetalle}
          onAceptar={handleAceptar}
          onCompletar={handleCompletar}
          onCancelar={handleCancelar}
          onNoPresentado={handleNoPresentado}
        />
      )}

      {/* Modal de creación */}
      {mostrarForm && (
        <FormCita
          fechaInicial={fechaInicialForm}
          onCrear={crear}
          onCancelar={cerrarForm}
        />
      )}
    </div>
  );
};

export default AdminCitas;
// Componente de vista mensual del calendario de citas para el panel de administración.
// Recibe la lista de citas del mes activo y las pinta en la celda del día correspondiente.
// Al pulsar un día vacío se abre el formulario de nueva cita con esa fecha preseleccionada,
// y al pulsar una cita existente se abre el modal de detalle para gestionarla.
import { useMemo } from 'react';
import type { Cita } from '../../../types/cita';
import {
  generarMesCalendario,
  NOMBRES_DIA,
  NOMBRES_MES,
  formatearHora,
  traducirEstado,
} from '../../../utils/calendario';
import '../../../styles/App.scss';

interface CalendarioProps {
  año: number;
  mes: number; // 0-11 (igual que el índice de Date.getMonth())
  citas: Cita[];
  onCambiarMes: (delta: number) => void; // +1 = mes siguiente, -1 = mes anterior
  onIrHoy: () => void;
  onClickCita: (cita: Cita) => void;
  onClickDia: (fecha: Date) => void; // se usa para preseleccionar la fecha en el formulario
}

export const Calendario = ({
  año,
  mes,
  citas,
  onCambiarMes,
  onIrHoy,
  onClickCita,
  onClickDia,
}: CalendarioProps) => {
  // Recalculamos la cuadrícula solo cuando cambia el mes o la lista de citas,
  // no en cada render, para no recalcular 42 celdas innecesariamente
  const dias = useMemo(
    () => generarMesCalendario(año, mes, citas),
    [año, mes, citas]
  );

  return (
    <div className="calendar">
      <header className="calendar-header">
        <div className="calendar-controls">
          <button onClick={() => onCambiarMes(-1)}>← Anterior</button>
          <button onClick={() => onCambiarMes(1)}>Siguiente →</button>
          <button onClick={onIrHoy}>Hoy</button>
        </div>
        <h3 className="calendar-title">{NOMBRES_MES[mes]} {año}</h3>
      </header>

      <div className="calendar-weekdays" role="row">
        {NOMBRES_DIA.map((nombre) => (
          <div key={nombre} role="columnheader" className="calendar-weekday">{nombre}</div>
        ))}
      </div>

      <div className="calendar-grid" role="grid">
        {dias.map((dia, idx) => (
          <div
            key={idx}
            role="gridcell"
            onClick={() => onClickDia(dia.fecha)}
            className={`calendar-cell ${dia.esMesActual ? '' : 'calendar-cell--muted'} ${dia.esHoy ? 'calendar-cell--today' : ''}`}
          >
            <div className="calendar-cell__header">
              <strong>{dia.diaMes}</strong>
            </div>

            {/* Lista de citas del día */}
            {dia.citas.slice(0, 3).map((cita) => (
              <div
                key={cita.id}
                onClick={(e) => { e.stopPropagation(); onClickCita(cita); }}
                title={`${cita.nombreCliente} - ${traducirEstado(cita.estado)}`}
                className="calendar-event"
              >
                {formatearHora(cita.fechaHora)} {cita.nombreCliente}
              </div>
            ))}

            {dia.citas.length > 3 && (
              <small className="text-soft">+{dia.citas.length - 3} más</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
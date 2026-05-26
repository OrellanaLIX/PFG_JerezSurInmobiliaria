import { useMemo } from 'react';
import type { Cita } from '../../../types/cita';
import {
  generarMesCalendario,
  NOMBRES_DIA,
  NOMBRES_MES,
  formatearHora,
  traducirEstado,
} from '../../../utils/calendario';

interface CalendarioProps {
  año: number;
  mes: number; // 0-11
  citas: Cita[];
  onCambiarMes: (delta: number) => void;
  onIrHoy: () => void;
  onClickCita: (cita: Cita) => void;
  onClickDia: (fecha: Date) => void;
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
  const dias = useMemo(
    () => generarMesCalendario(año, mes, citas),
    [año, mes, citas]
  );

  return (
    <div>
      {/* Header del calendario */}
      <header>
        <button onClick={() => onCambiarMes(-1)}>← Anterior</button>
        <h3>
          {NOMBRES_MES[mes]} {año}
        </h3>
        <button onClick={() => onCambiarMes(1)}>Siguiente →</button>
        <button onClick={onIrHoy}>Hoy</button>
      </header>

      {/* Cabecera de días de la semana */}
      <div role="row">
        {NOMBRES_DIA.map((nombre) => (
          <div key={nombre} role="columnheader">
            {nombre}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div role="grid">
        {dias.map((dia, idx) => (
          <div
            key={idx}
            role="gridcell"
            onClick={() => onClickDia(dia.fecha)}
            style={{
              cursor: 'pointer',
              opacity: dia.esMesActual ? 1 : 0.4,
              border: dia.esHoy ? '2px solid blue' : '1px solid #ccc',
              padding: '4px',
              minHeight: '80px',
            }}
          >
            <div>
              <strong>{dia.diaMes}</strong>
            </div>

            {/* Lista de citas del día */}
            {dia.citas.slice(0, 3).map((cita) => (
              <div
                key={cita.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onClickCita(cita);
                }}
                title={`${cita.nombreCliente} - ${traducirEstado(cita.estado)}`}
                style={{ fontSize: '0.8em', cursor: 'pointer' }}
              >
                {formatearHora(cita.fechaHora)} {cita.nombreCliente}
              </div>
            ))}

            {dia.citas.length > 3 && (
              <small>+{dia.citas.length - 3} más</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
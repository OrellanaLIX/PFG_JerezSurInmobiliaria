import type { OperacionDetalle, EstadoOperacion } from '../../../types/operacion';
import '../../../styles/App.scss';
import { useState } from 'react';

type Tab = 'datos' | 'inmueble' | 'vendedor' | 'interesado';

interface Props {
  operacion: OperacionDetalle;
  loading: boolean;
  onCerrar: () => void;
  onActualizar: (id: number, data: Partial<OperacionDetalle>) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleOperacionModal = ({ operacion, loading, onCerrar, onActualizar, onEliminar }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');
  if (loading) return <div className="modal"><p>Cargando la información del expediente...</p></div>;

  const handleCambiarEstado = async (nuevoEstado: EstadoOperacion) => {
    const clon = { ...operacion, estadoActual: nuevoEstado };
    delete (clon as any).documentos; // Quitamos arrays pesados para el PUT
    await onActualizar(operacion.id, clon);
  };

  return (
    <div className="form-modal">
      <div className="form-modal__backdrop" onClick={onCerrar} />
      <div className="form-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Expediente Jurídico: EXP-{operacion.id}</h2>
          <button className="btn btn-ghost" onClick={onCerrar}>❌</button>
        </header>

        <section className="modal-body">
          <div className="tabs" role="tablist">
            <button type="button" className={`tab ${tab === 'datos' ? 'active' : ''}`} onClick={() => setTab('datos')}>
              🔎 Operación
            </button>
            <button type="button" className={`tab ${tab === 'inmueble' ? 'active' : ''}`} onClick={() => setTab('inmueble')}>
              🏠 Inmueble
            </button>
            <button type="button" className={`tab ${tab === 'vendedor' ? 'active' : ''}`} onClick={() => setTab('vendedor')}>
              👤 Vendedor
            </button>
            <button type="button" className={`tab ${tab === 'interesado' ? 'active' : ''}`} onClick={() => setTab('interesado')}>
              💼 Interesado
            </button>
          </div>

          {tab === 'datos' && (
            <div className="detail-panel">
              <p><strong>Inmueble Vinculado:</strong> {operacion.inmuebleReferencia}</p>
              <p><strong>Precio Acordado:</strong> {operacion.precioAcordado.toLocaleString('es-ES')} €</p>
              <p><strong>Tipo de operación:</strong> {operacion.tipo}</p>
              <p><strong>Categoría:</strong> {operacion.categoria_operacion}</p>
              <p><strong>Estado actual:</strong> {operacion.estadoActual}</p>

              <label><strong>Actualizar estado:</strong></label>
              <select value={operacion.estadoActual} onChange={(e) => handleCambiarEstado(e.target.value as EstadoOperacion)}>
                <option value="ABIERTA">Abierta / Estudio</option>
                <option value="EN_TRAMITE">En Trámite</option>
                <option value="CERRADA">Cerrada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>

              {operacion.categoria_operacion === 'VENTA' ? (
                <fieldset className="inmueble-fieldset">
                  <legend>✍️ Datos de Compraventa</legend>
                  <p>Depósito de arras: {operacion.importeArras ? `${operacion.importeArras} €` : 'No especificado'}</p>
                  <p>Incluye mobiliario: {operacion.incluyeMobiliario ? 'Sí' : 'No'}</p>
                </fieldset>
              ) : (
                <fieldset className="inmueble-fieldset">
                  <legend>🔑 Datos de Arrendamiento</legend>
                  <p>Fianza: {operacion.fianzaMeses ?? 'No especificada'} meses</p>
                  <p>Admite mascotas: {operacion.incluyeGastosComunidad ? 'Sí' : 'No'}</p>
                </fieldset>
              )}
            </div>
          )}

          {tab === 'inmueble' && (
            <div className="detail-panel">
              <p><strong>ID del Inmueble:</strong> {operacion.inmuebleId}</p>
              <p><strong>Referencia/Dirección:</strong> {operacion.inmuebleReferencia}</p>
              <p className="text-soft">Los datos del inmueble son de solo lectura en este expediente. Edita el inmueble desde su módulo si necesitas cambiar la propiedad.</p>
            </div>
          )}

          {tab === 'vendedor' && (
            <div className="detail-panel">
              <p><strong>Vendedor principal:</strong> {operacion.vendedorNombre || 'No disponible'}</p>
              <p className="text-soft">Si necesitas modificar el vendedor, actualiza su perfil en el módulo de usuarios.</p>
            </div>
          )}

          {tab === 'interesado' && (
            <div className="detail-panel">
              <p><strong>Interesado:</strong> {operacion.compradorNombre || 'No disponible'}</p>
              <p className="text-soft">Los datos de este interesado se gestionan desde el módulo de usuarios.</p>
            </div>
          )}
        </section>

        <section className="modal-body">
          <p className="text-soft">Para crear o gestionar un contrato asociado a esta operación, usa el botón "Crear Contrato" desde la fila correspondiente en la tabla.</p>
        </section>

        <footer className="modal-footer">
          <button 
            className="btn btn-danger"
            onClick={async () => { if(confirm('¿Archivar y eliminar este expediente permanentemente?')) { await onEliminar(operacion.id); onCerrar(); } }} 
          >
            Eliminar Expediente
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};
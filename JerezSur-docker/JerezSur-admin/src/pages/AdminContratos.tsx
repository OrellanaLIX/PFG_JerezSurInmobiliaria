// Página de operaciones y contratos del panel de administración.
// Una operación registra una compraventa o alquiler; el contrato es el documento PDF asociado.
import { useState } from 'react';
import { useOperaciones } from '../hooks/useOperaciones';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import type { EstadoOperacion, CategoriaOperacion, OperacionBase } from '../types/operacion';
import { TablaOperaciones } from '../components/crud/Contratos/TablaOperaciones';
import { DetalleOperacionModal } from '../components/crud/Contratos/DetalleOperacionModal';
import { FormOperacionModal } from '../components/crud/Contratos/FormOperacionModal';
import { ContratosModal } from '../components/crud/Contratos/ContratosModal';
import '../styles/pages/CrudPages.scss';

const AdminContratos = () => {
  const {
    operaciones,
    operacionSeleccionada,
    loading,
    loadingDetalle,
    error,
    cargar,
    crear,
    actualizarEstado,
    eliminar,
    cargarDetalle,
    limpiarSeleccionada,
  } = useOperaciones();

  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [operacionParaContratos, setOperacionParaContratos] = useState<OperacionBase | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaOperacion | 'TODOS'>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<EstadoOperacion | 'TODOS'>('TODOS');
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleVerDetalle = async (id: number) => {
    setMostrarDetalle(true);
    try {
      await cargarDetalle(id);
    } catch {
      showError('Error al cargar los detalles del expediente.');
    }
  };

  const handleCerrarDetalle = () => {
    setMostrarDetalle(false);
    limpiarSeleccionada();
  };

  const handleCrear = async (datos: any) => {
    try {
      await crear(datos);
      setMostrarForm(false);
      showSuccess('Expediente abierto correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al crear el expediente.');
    }
  };

  const handleActualizarEstado = async (id: number, estado: EstadoOperacion) => {
    try {
      await actualizarEstado(id, estado);
      showSuccess('Estado actualizado correctamente.');
    } catch {
      showError('Error al actualizar el estado.');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await eliminar(id);
      await cargar();
      showSuccess('Expediente eliminado correctamente.');
    } catch {
      showError('Error al eliminar el expediente.');
    }
  };

  const operacionesFiltradas = operaciones.filter(o => {
    const coincideCat = filtroCategoria === 'TODOS' || o.categoria_operacion === filtroCategoria;
    const coincideEst = filtroEstado === 'TODOS' || o.estadoActual === filtroEstado;
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      o.inmuebleReferencia?.toLowerCase().includes(texto) ||
      String(o.primerInteresadoId ?? '').includes(texto);
    return coincideCat && coincideEst && coincideTexto;
  });

  if (loading) return <p>Cargando operaciones...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>Expedientes y Contratos</h1>
        <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
          + Abrir nueva operación
        </button>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      <div className="crud-page__filters">
        <input
          type="text"
          placeholder="Buscar por ref. inmueble..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value as any)}>
          <option value="TODOS">Todas las categorías</option>
          <option value="VENTA">Compraventas</option>
          <option value="ALQUILER">Alquileres</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as any)}>
          <option value="TODOS">Todos los estados</option>
          <option value="ABIERTA">⚪ Abierta</option>
          <option value="EN_TRAMITE">🟡 En Trámite</option>
          <option value="CERRADA">🟢 Cerrada</option>
          <option value="CANCELADA">🔴 Cancelada</option>
        </select>
      </div>

      <TablaOperaciones
        operaciones={operacionesFiltradas}
        onVerDetalle={handleVerDetalle}
        onVerContratos={id => {
          const match = operaciones.find(o => o.id === id);
          if (match) setOperacionParaContratos(match);
        }}
        onCambiarEstado={(op, estado) => handleActualizarEstado(op.id, estado)}
      />

      {mostrarDetalle && (
        <DetalleOperacionModal
          operacion={operacionSeleccionada}
          loading={loadingDetalle}
          onCerrar={handleCerrarDetalle}
          onActualizarEstado={handleActualizarEstado}
          onEliminar={handleEliminar}
        />
      )}

      {mostrarForm && (
        <FormOperacionModal onCrear={handleCrear} onCancelar={() => setMostrarForm(false)} />
      )}

      {operacionParaContratos && (
        <ContratosModal
          operacion={operacionParaContratos}
          onCerrar={() => setOperacionParaContratos(null)}
        />
      )}
    </div>
  );
};

export default AdminContratos;

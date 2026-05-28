import { useState } from 'react';
import { useOperaciones } from '../hooks/useOperaciones';
import type { EstadoOperacion, CategoriaOperacion, OperacionBase } from '../types/operacion';
import { TablaOperaciones } from '../components/crud/Contratos/TablaOperaciones';
import { DetalleOperacionModal } from '../components/crud/Contratos/DetalleOperacionModal';
import { FormOperacionModal } from '../components/crud/Contratos/FormOperacionModal';
import '../styles/pages/CrudPages.scss';

const AdminContratos = () => {
  const {
    operaciones,
    operacionSeleccionada,
    loading,
    loadingDetalle,
    error,
    crear,
    actualizar,
    eliminar,
    cargarDetalle,
    limpiarSeleccionada,
  } = useOperaciones();

  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaOperacion | 'TODOS'>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<EstadoOperacion | 'TODOS'>('TODOS');
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleCambiarEstadoRapido = async (operacion: OperacionBase, nuevoEstado: EstadoOperacion) => {
    await actualizar(operacion.id, { ...operacion, estadoActual: nuevoEstado });
  };

  const operacionesFiltradas = operaciones.filter((o) => {
    const coincideCat = filtroCategoria === 'TODOS' || o.categoria_operacion === filtroCategoria;
    const coincideEst = filtroEstado === 'TODOS' || o.estadoActual === filtroEstado;
    const coincideTexto = 
      o.inmuebleReferencia.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.vendedorNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.compradorNombre?.toLowerCase().includes(busqueda.toLowerCase());

    return coincideCat && coincideEst && coincideTexto;
  });

  if (loading) return <p>Cargando operaciones inmobiliarias...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>Expedientes y Contratos Comerciales</h1>
        <div className="actions">
          <button onClick={() => setMostrarForm(true)}>+ Abrir Nueva Operación</button>
        </div>
      </header>

      <div className="crud-page__filters">
        <input 
          type="text" 
          placeholder="Buscar por Ref Inmueble, Cliente..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)} 
        />
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value as any)}>
          <option value="TODOS">Todas las Categorías</option>
          <option value="VENTA">Ventas de Inmuebles</option>
          <option value="ALQUILER">Alquileres / Arrendamientos</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as any)}>
          <option value="TODOS">Todos los Estados</option>
          <option value="ABIERTA">⚪ Abierta</option>
          <option value="EN_TRAMITE">🟡 En Trámite / Arras</option>
          <option value="CERRADA">🟢 Cerrada (Firmada)</option>
          <option value="CANCELADA">🔴 Cancelada</option>
        </select>
      </div>

      <TablaOperaciones
        operaciones={operacionesFiltradas}
        onVerDetalle={cargarDetalle}
        onCambiarEstado={handleCambiarEstadoRapido}
      />

      {operacionSeleccionada && (
        <DetalleOperacionModal
          operacion={operacionSeleccionada}
          loading={loadingDetalle}
          onCerrar={limpiarSeleccionada}
          onActualizar={actualizar}
          onEliminar={eliminar}
        />
      )}

      {mostrarForm && (
        <FormOperacionModal onCrear={crear} onCancelar={() => setMostrarForm(false)} />
      )}
    </div>
  );
};

export default AdminContratos;
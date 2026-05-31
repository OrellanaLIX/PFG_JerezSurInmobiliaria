import { useState } from 'react';
import { useOperaciones } from '../hooks/useOperaciones';
import type { EstadoOperacion, CategoriaOperacion, OperacionBase } from '../types/operacion';
import { TablaOperaciones } from '../components/crud/Contratos/TablaOperaciones';
import { DetalleOperacionModal } from '../components/crud/Contratos/DetalleOperacionModal';
import { FormOperacionModal } from '../components/crud/Contratos/FormOperacionModal';
import { contratoService } from '../services/contratoService';
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

  const [operacionParaContrato, setOperacionParaContrato] = useState<OperacionBase | null>(null);
  const [modeloContrato, setModeloContrato] = useState<string>('ARRAS');
  const [guardandoContrato, setGuardandoContrato] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaOperacion | 'TODOS'>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<EstadoOperacion | 'TODOS'>('TODOS');
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleCambiarEstadoRapido = async (operacion: OperacionBase, nuevoEstado: EstadoOperacion) => {
    await actualizar(operacion.id, { ...operacion, estadoActual: nuevoEstado });
  };

  const handleCerrarContrato = () => setOperacionParaContrato(null);

  const handleGenerarContrato = async () => {
    if (!operacionParaContrato) return;
    setGuardandoContrato(true);
    try {
      await contratoService.generarBorrador(operacionParaContrato.id, modeloContrato, {});
      alert('Borrador de contrato generado correctamente.');
      await cargarDetalle(operacionParaContrato.id);
      await cargar();
    } catch (e: any) {
      alert(`Error al generar contrato: ${e.message || e}`);
    } finally {
      setGuardandoContrato(false);
      setOperacionParaContrato(null);
    }
  };

  const operacionesFiltradas = operaciones.filter((o) => {
    const coincideCat = filtroCategoria === 'TODOS' || o.categoria_operacion === filtroCategoria;
    const coincideEst = filtroEstado === 'TODOS' || o.estadoActual === filtroEstado;
    const textoBuscado = busqueda.toLowerCase();
    const inmuebleRef = o.inmuebleReferencia?.toLowerCase() || '';
    const vendedor = o.vendedorNombre?.toLowerCase() || '';
    const comprador = o.compradorNombre?.toLowerCase() || '';

    const coincideTexto =
      inmuebleRef.includes(textoBuscado) ||
      vendedor.includes(textoBuscado) ||
      comprador.includes(textoBuscado);

    return coincideCat && coincideEst && coincideTexto;
  });

  if (loading) return <p>Cargando operaciones inmobiliarias...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>Expedientes y Contratos Comerciales</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            + Abrir Nueva Operación
          </button>
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
        onCrearContrato={(id) => {
          const match = operaciones.find((o) => o.id === id);
          if (match) setOperacionParaContrato(match);
        }}
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
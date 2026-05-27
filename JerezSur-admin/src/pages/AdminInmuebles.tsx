import { useState } from 'react';
import { useInmuebles } from '../hooks/useInmuebles';
import type { TipoOperacionInmueble, EstadoInmueble, Inmueble } from '../types/inmueble';
import { TablaInmuebles } from '../components/crud/Inmuebles/TablaInmuebles';
import { DetalleInmuebleModal } from '../components/crud/Inmuebles/DetallesInmuebleModal';
import { FormInmuebleModal } from '../components/crud/Inmuebles/FormInmuebleModal';

const AdminInmuebles = () => {
  const {
    inmuebles,
    inmuebleSeleccionado,
    loading,
    loadingDetalle,
    error,
    crear,
    actualizar,
    eliminar,
    cargarDetalle,
    limpiarSeleccionado,
  } = useInmuebles();

  const [busqueda, setBusqueda] = useState('');
  const [filtroOperacion, setFiltroOperacion] = useState<TipoOperacionInmueble | 'TODOS'>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<EstadoInmueble | 'TODOS'>('TODOS');
  const [mostrarForm, setMostrarForm] = useState(false);

  // Cambio rápido de disponibilidad desde la tabla mediante PUT unificado
  const handleCambiarEstadoRapido = async (inmueble: Inmueble, nuevoEstado: EstadoInmueble) => {
    await actualizar(inmueble.id, { ...inmueble, estado: nuevoEstado });
  };

  const inmueblesFiltrados = inmuebles.filter((i) => {
    const coincideOperacion = filtroOperacion === 'TODOS' || i.operacion === filtroOperacion;
    const coincideEstado = filtroEstado === 'TODOS' || i.estado === filtroEstado;
    const coincideTexto = 
      i.referencia.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.titulo.toLowerCase().includes(busqueda.toLowerCase());

    return coincideOperacion && coincideEstado && coincideTexto;
  });

  if (loading) return <p>Cargando catálogo de propiedades...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
        <h1>Gestión de Inmuebles (JerezSur)</h1>
        <button onClick={() => setMostrarForm(true)}>+ Añadir Propiedad</button>
      </header>

      {/* Controles de Búsqueda */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Buscar por Ref, Ciudad o Título..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)} 
        />
        <select value={filtroOperacion} onChange={e => setFiltroOperacion(e.target.value as any)}>
          <option value="TODOS">Todas las Operaciones</option>
          <option value="VENTA">En Venta</option>
          <option value="ALQUILER">En Alquiler</option>
          <option value="AMBOS">Ambos</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as any)}>
          <option value="TODOS">Todos los Estados</option>
          <option value="DISPONIBLE">🟢 Disponible</option>
          <option value="RESERVADO">🟡 Reservado</option>
          <option value="VENDIDO">🔴 Vendido</option>
        </select>
      </div>

      <TablaInmuebles
        inmuebles={inmueblesFiltrados}
        onVerDetalle={cargarDetalle}
        onCambiarEstado={handleCambiarEstadoRapido}
      />

      {inmuebleSeleccionado && (
        <DetalleInmuebleModal
          inmueble={inmuebleSeleccionado}
          loading={loadingDetalle}
          onCerrar={limpiarSeleccionado}
          onActualizar={actualizar}
          onEliminar={eliminar}
        />
      )}

      {mostrarForm && (
        <FormInmuebleModal onCrear={crear} onCancelar={() => setMostrarForm(false)} />
      )}
    </div>
  );
};

export default AdminInmuebles;
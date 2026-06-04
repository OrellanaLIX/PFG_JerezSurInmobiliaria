// Página de gestión de inmuebles del panel de administración.
// Permite crear, editar, eliminar y cambiar el estado de cada inmueble del catálogo.
import { useState } from 'react';
import { useInmuebles } from '../hooks/useInmuebles';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import type { TipoOperacion, EstadoInmueble, Inmueble } from '../types/inmueble';
import { TablaInmuebles } from '../components/crud/Inmuebles/TablaInmuebles';
import { DetalleInmuebleModal } from '../components/crud/Inmuebles/DetallesInmuebleModal';
import { FormInmuebleModal } from '../components/crud/Inmuebles/FormInmuebleModal';
import '../styles/pages/CrudPages.scss';

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

  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const [busqueda, setBusqueda] = useState('');
  const [filtroOperacion, setFiltroOperacion] = useState<TipoOperacion | 'TODOS'>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<EstadoInmueble | 'TODOS'>('TODOS');
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleCrear = async (datos: any) => {
    // FormInmuebleModal espera que onCrear devuelva el inmueble creado (con id)
    // para poder subir imágenes a continuación. No cerramos el modal aquí;
    // el propio modal llama a onCancelar() cuando termina.
    const result = await crear(datos);
    showSuccess('Inmueble creado correctamente.');
    return result;
  };

  const handleActualizar = async (id: number, datos: Inmueble) => {
    try {
      await actualizar(id, datos);
      showSuccess('Inmueble actualizado correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al actualizar el inmueble.');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await eliminar(id);
      limpiarSeleccionado();
      showSuccess('Inmueble eliminado correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al eliminar el inmueble.');
    }
  };

  const handleCambiarEstadoRapido = async (inmueble: Inmueble, nuevoEstado: EstadoInmueble) => {
    try {
      await actualizar(inmueble.id, { ...inmueble, estado: nuevoEstado });
      showSuccess('Estado actualizado.');
    } catch (e: any) {
      showError('Error al cambiar el estado.');
    }
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
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>Gestión de Inmuebles</h1>
        <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
          + Añadir Propiedad
        </button>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      <div className="crud-page__filters">
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
          <option value="CUALQUIERA">Ambos (Venta y Alquiler)</option>
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
          onEliminar={handleEliminar}
          onActualizar={cargarDetalle}
        />
      )}

      {mostrarForm && (
        <FormInmuebleModal onCrear={handleCrear} onCancelar={() => setMostrarForm(false)} error={null} />
      )}
    </div>
  );
};

export default AdminInmuebles;

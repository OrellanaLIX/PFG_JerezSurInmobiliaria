// Página de gestión de mensajes de contacto del panel de administración.
// Muestra los mensajes que llegan desde el formulario de la web pública y permite marcarlos como leídos.
import { useState } from 'react';
import { useContactos } from '../hooks/useContactos';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import type { MensajeContacto } from '../types/contacto';
import { TablaContactos } from '../components/crud/Contactos/TablaContactos';
import { DetalleContactoModal } from '../components/crud/Contactos/DetallesContactosModal';
import '../styles/pages/CrudPages.scss';

const AdminContactos = () => {
  const {
    contactos,
    contactoSeleccionado,
    loading,
    loadingDetalle,
    error,
    actualizar,
    eliminar,
    cargarDetalle,
    limpiarSeleccionado,
  } = useContactos();

  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const [busqueda, setBusqueda] = useState('');
  const [filtroLeido, setFiltroLeido] = useState<'TODOS' | 'LEIDOS' | 'PENDIENTES'>('TODOS');

  const handleToggleLeido = async (contacto: MensajeContacto) => {
    try {
      await actualizar(contacto.id, { leido: !contacto.leido });
      showSuccess(contacto.leido ? 'Marcado como no leído.' : 'Marcado como leído.');
    } catch {
      showError('Error al actualizar el estado del mensaje.');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await eliminar(id);
      limpiarSeleccionado();
      showSuccess('Mensaje eliminado correctamente.');
    } catch {
      showError('Error al eliminar el mensaje.');
    }
  };

  const contactosFiltrados = contactos.filter((c) => {
    const coincideEstado =
      filtroLeido === 'TODOS' ||
      (filtroLeido === 'LEIDOS' && c.leido) ||
      (filtroLeido === 'PENDIENTES' && !c.leido);
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      !busqueda ||
      (c.nombre?.toLowerCase().includes(texto) ?? false) ||
      (c.email?.toLowerCase().includes(texto) ?? false) ||
      (c.telefono?.toLowerCase().includes(texto) ?? false);
    return coincideEstado && coincideTexto;
  });

  if (loading) return <p>Cargando bandeja de entrada...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>Bandeja de Contactos y Leads</h1>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      <div className="crud-page__filters">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select value={filtroLeido} onChange={e => setFiltroLeido(e.target.value as any)}>
          <option value="TODOS">Todas las consultas</option>
          <option value="PENDIENTES">No leídos</option>
          <option value="LEIDOS">Leídos / Gestionados</option>
        </select>
      </div>

      <TablaContactos
        contactos={contactosFiltrados}
        onVerDetalle={cargarDetalle}
        onToggleLeido={handleToggleLeido}
      />

      {contactoSeleccionado && (
        <DetalleContactoModal
          contacto={contactoSeleccionado}
          loading={loadingDetalle}
          onCerrar={limpiarSeleccionado}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  );
};

export default AdminContactos;

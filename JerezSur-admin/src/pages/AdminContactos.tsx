import { useState } from 'react';
import { useContactos } from '../hooks/useContactos';
import type { MensajeContacto } from '../types/contacto';
import { TablaContactos } from '../components/crud/Contactos/TablaContactos';
import { DetalleContactoModal } from '../components/crud/Contactos/DetallesContactosModal';
import { FormContactoModal } from '../components/crud/Contactos/FormContactoModal';
import '../styles/pages/CrudPages.scss';

const AdminContactos = () => {
  const {
    contactos,
    contactoSeleccionado,
    loading,
    loadingDetalle,
    error,
    crear,
    actualizar,
    eliminar,
    cargarDetalle,
    limpiarSeleccionado,
  } = useContactos();

  const [busqueda, setBusqueda] = useState('');
  const [filtroLeido, setFiltroLeido] = useState<'TODOS' | 'LEIDOS' | 'PENDIENTES'>('TODOS');
  const [mostrarForm, setMostrarForm] = useState(false); // Para simular leads manualmente

  // Marcar/Desmarcar rápido desde la tabla con el PUT
  const handleToggleLeido = async (contacto: MensajeContacto) => {
    await actualizar(contacto.id, { leido: !contacto.leido });
  };

  const contactosFiltrados = contactos.filter((c) => {
    const coincideEstado = 
      filtroLeido === 'TODOS' || 
      (filtroLeido === 'LEIDOS' && c.leido) || 
      (filtroLeido === 'PENDIENTES' && !c.leido);
      
    const coincideTexto = 
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email.toLowerCase().includes(busqueda.toLowerCase());

    return coincideEstado && coincideTexto;
  });

  if (loading) return <p>Cargando bandeja de entrada...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>📥 Bandeja de Contactos y Leads</h1>
        <div className="actions">
          <button onClick={() => setMostrarForm(true)}>+ Registrar Lead Manual</button>
        </div>
      </header>

      <div className="crud-page__filters">
        <input 
          type="text" 
          placeholder="Buscar por nombre o email del remitente..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)} 
          className="w-300"
        />
        <select value={filtroLeido} onChange={e => setFiltroLeido(e.target.value as any)}>
          <option value="TODOS">Todas las consultas</option>
          <option value="PENDIENTES">📩 No leídos</option>
          <option value="LEIDOS">📁 Leídos / Gestionados</option>
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
          onEliminar={eliminar}
        />
      )}

      {mostrarForm && (
        <FormContactoModal onCrear={crear} onCancelar={() => setMostrarForm(false)} />
      )}
    </div>
  );
};

export default AdminContactos;
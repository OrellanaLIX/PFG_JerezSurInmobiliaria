import { useState } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import { TablaUsuarios } from '../components/crud/Usuarios/TablaUsuarios';
import { DetalleUsuarioModal } from '../components/crud/Usuarios/DetalleUsuarioModal';
import { FormUsuarioModal } from '../components/crud/Usuarios/FormUsuarioModal';
import type { Role, Usuario } from '../types/usuario';
import '../styles/pages/CrudPages.scss';

const AdminUsuarios = () => {
  const {
    usuarios,
    usuarioSeleccionado,
    loading,
    loadingDetalle,
    error,
    crear,
    actualizar,
    eliminar,
    cargarDetalle,
    limpiarSeleccionado,
  } = useUsuarios();

  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<Role | 'TODOS'>('TODOS');
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false);

  const handleCrear = async (datos: any) => {
    try {
      await crear(datos);
      setMostrarFormCrear(false);
      showSuccess('Usuario registrado correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al registrar el usuario.');
    }
  };

  const handleActualizar = async (id: number, datos: any) => {
    try {
      await actualizar(id, datos);
      showSuccess('Usuario actualizado correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al actualizar el usuario.');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await eliminar(id);
      limpiarSeleccionado();
      showSuccess('Usuario eliminado correctamente.');
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Error al eliminar el usuario.');
    }
  };

  const handleToggleActivo = async (usuarioOriginal: Usuario) => {
    try {
      await actualizar(usuarioOriginal.id, { ...usuarioOriginal, cuentaActivada: !usuarioOriginal.cuentaActivada });
      showSuccess(usuarioOriginal.cuentaActivada ? 'Cuenta desactivada.' : 'Cuenta activada.');
    } catch (e: any) {
      showError('Error al cambiar el estado de la cuenta.');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol === 'TODOS' || u.role === filtroRol;
    const texto = busqueda.toLowerCase();
    const nombreCompleto = `${u.nombre || ''} ${u.apellidos || ''}`.toLowerCase();
    return coincideRol && (
      nombreCompleto.includes(texto) ||
      (u.email?.toLowerCase() || '').includes(texto) ||
      (u.telefono?.toLowerCase() || '').includes(texto) ||
      (u.dni?.toLowerCase() || '').includes(texto) ||
      u.role?.toLowerCase().includes(texto)
    );
  });

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <header className="crud-page__header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn btn-primary" onClick={() => setMostrarFormCrear(true)}>
          + Registrar Lead Manual
        </button>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      <div className="crud-page__filters">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar usuarios..." />
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value as any)}>
          <option value="TODOS">Todos</option>
          <option value="ROLE_ADMIN">ADMIN</option>
          <option value="ROLE_TRABAJADOR">TRABAJADOR</option>
          <option value="ROLE_INTERESADO">INTERESADO</option>
          <option value="ROLE_VENDEDOR">VENDEDOR</option>
          <option value="ROLE_AMBOS">AMBOS</option>
        </select>
      </div>

      <TablaUsuarios
        usuarios={usuariosFiltrados}
        onVerDetalle={cargarDetalle}
        onToggleActivo={handleToggleActivo}
      />

      {usuarioSeleccionado && (
        <DetalleUsuarioModal
          usuario={usuarioSeleccionado}
          loading={loadingDetalle}
          onCerrar={limpiarSeleccionado}
          onActualizar={handleActualizar}
          onEliminar={handleEliminar}
        />
      )}

      {mostrarFormCrear && (
        <FormUsuarioModal onCrear={handleCrear} onCancelar={() => setMostrarFormCrear(false)} />
      )}
    </div>
  );
};

export default AdminUsuarios;

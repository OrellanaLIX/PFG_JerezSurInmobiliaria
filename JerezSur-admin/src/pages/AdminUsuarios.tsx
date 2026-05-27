import { useState } from 'react';
import { useUsuarios } from '../hooks/useUsuarios'; // Asumimos que tu hook ahora expone "actualizar"
import { TablaUsuarios } from '../components/crud/Usuarios/TablaUsuarios';
import { DetalleUsuarioModal } from '../components/crud/Usuarios/DetalleUsuarioModal';
import { FormUsuarioModal } from '../components/crud/Usuarios/FormUsuarioModal';
import type { Role, Usuario } from '../types/usuario';

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

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<Role | 'TODOS'>('TODOS');
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false);

  // Manejador para el botón rápido de activar/desactivar en la tabla mediante PUT
  const handleToggleActivo = async (usuarioOriginal: Usuario) => {
    const datosModificados = {
      ...usuarioOriginal,
      cuentaActivada: !usuarioOriginal.cuentaActivada
    };
    await actualizar(usuarioOriginal.id, datosModificados);
  };

  // Filtrado en memoria
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol === 'TODOS' || u.role === filtroRol;
    const nombreCompleto = `${u.nombre} ${u.apellidos || ''}`.toLowerCase();
    return coincideRol && (nombreCompleto.includes(busqueda.toLowerCase()) || u.email?.toLowerCase().includes(busqueda.toLowerCase()));
  });

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
        <h1>Gestión de Usuarios (Modo PUT Unificado)</h1>
        <button onClick={() => setMostrarFormCrear(true)}>+ Registrar Usuario</button>
      </header>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)} 
        />
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value as Role | 'TODOS')}>
          <option value="TODOS">Todos los roles</option>
          <option value="ROLE_NOROL">ROLE_NOROL</option>
          <option value="ROLE_USER">ROLE_USER</option>
          <option value="ROLE_ADMIN">ROLE_ADMIN</option>
        </select>
      </div>

      <TablaUsuarios
        usuarios={usuariosFiltrados}
        onVerDetalle={cargarDetalle}
        onToggleActivo={handleToggleActivo} // Enviamos la función adaptada
      />

      {usuarioSeleccionado && (
        <DetalleUsuarioModal
          usuario={usuarioSeleccionado}
          loading={loadingDetalle}
          onCerrar={limpiarSeleccionado}
          onActualizar={actualizar} // Compartimos el mismo PUT para cambios internos
          onEliminar={eliminar}
        />
      )}

      {mostrarFormCrear && (
        <FormUsuarioModal onCrear={crear} onCancelar={() => setMostrarFormCrear(false)} />
      )}
    </div>
  );
};

export default AdminUsuarios;
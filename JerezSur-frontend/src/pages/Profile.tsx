import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Inmueble {
  direccion?: string;
  tipo?: string;
  precio?: number;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  descripcion?: string;
}

interface Operacion {
  tipo?: string;
  precio?: number;
  fechaInicio?: string;
  fechaFin?: string;
  comprador?: string;
}

interface Propiedad {
  id: number;
  inmueble: Inmueble;
  estado: 'activo' | 'vendido' | 'eliminado';
}

interface Contrato {
  id: number;
  operacion: Operacion;
  estado: 'vigente' | 'finalizado' | 'cancelado';
}

interface VendedorData {
  dni: string;
  propiedades: Propiedad[];
  contratos: Contrato[];
}

interface Interes {
  tipoInmueble: string;
  zona: string;
  presupuesto: number;
  habitaciones: number;
  banos: number;
  operacion: 'compra' | 'alquiler';
}

interface InteresadoData {
  dni: string;
  intereses: Interes[];
}

interface UserProfileData {
  id: number;
  nombre: string;
  email: string;
  avatarUrl?: string;
  roles: ('vendedor' | 'interesado' | 'ambos')[];
  vendedor?: VendedorData;
  interesado?: InteresadoData;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [editNombre, setEditNombre] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const [showAddPropiedad, setShowAddPropiedad] = useState<boolean>(false);
  const [newPropiedad, setNewPropiedad] = useState<Inmueble>({
    direccion: '',
    tipo: '',
    precio: 0,
    superficie: 0,
    habitaciones: 0,
    banos: 0,
    descripcion: '',
  });

  const [showAddInteres, setShowAddInteres] = useState<boolean>(false);
  const [newInteres, setNewInteres] = useState<Interes>({
    tipoInmueble: '',
    zona: '',
    presupuesto: 0,
    habitaciones: 0,
    banos: 0,
    operacion: 'compra',
  });

  const [editingPropiedadId, setEditingPropiedadId] = useState<number | null>(null);
  const [editPropiedad, setEditPropiedad] = useState<Inmueble>({});
  const [editPropiedadEstado, setEditPropiedadEstado] = useState<'activo' | 'vendido' | 'eliminado'>('activo');

  const [editingInteresIndex, setEditingInteresIndex] = useState<number | null>(null);
  const [editInteres, setEditInteres] = useState<Interes>({
    tipoInmueble: '',
    zona: '',
    presupuesto: 0,
    habitaciones: 0,
    banos: 0,
    operacion: 'compra',
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = localStorage.getItem('userSession');
        if (!session) {
          navigate('/acceder');
          return;
        }

        const { id } = JSON.parse(session);

        const response = await fetch(`/api/users/profile/${id}`);
        if (!response.ok) throw new Error('Error al conectar con la base de datos');

        const data: UserProfileData = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleStartEditProfile = () => {
    if (!user) return;
    setEditNombre(user.nombre);
    setEditEmail(user.email);
    setEditAvatarUrl(user.avatarUrl || '');
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          email: editEmail,
          avatarUrl: editAvatarUrl || undefined,
        }),
      });
      if (!response.ok) throw new Error('Error al actualizar el perfil');
      const updatedUser: UserProfileData = await response.json();
      setUser(updatedUser);
      setEditingProfile(false);
      showFeedback('Perfil actualizado correctamente.');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleCancelEditProfile = () => {
    setEditingProfile(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar la cuenta');
      localStorage.removeItem('userSession');
      navigate('/');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al eliminar la cuenta');
      setShowDeleteConfirm(false);
    }
  };

  const handleAddPropiedad = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.id}/propiedades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inmueble: newPropiedad,
          estado: 'activo',
        }),
      });
      if (!response.ok) throw new Error('Error al añadir propiedad');
      const createdPropiedad: Propiedad = await response.json();

      setUser((prev) => {
        if (!prev || !prev.vendedor) return prev;
        return {
          ...prev,
          vendedor: {
            ...prev.vendedor,
            propiedades: [...prev.vendedor.propiedades, createdPropiedad],
          },
        };
      });

      setShowAddPropiedad(false);
      setNewPropiedad({
        direccion: '',
        tipo: '',
        precio: 0,
        superficie: 0,
        habitaciones: 0,
        banos: 0,
        descripcion: '',
      });
      showFeedback('Propiedad añadida correctamente.');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al añadir propiedad');
    }
  };

  const handleStartEditPropiedad = (propiedad: Propiedad) => {
    setEditingPropiedadId(propiedad.id);
    setEditPropiedad({ ...propiedad.inmueble });
    setEditPropiedadEstado(propiedad.estado);
  };

  const handleSaveEditPropiedad = async () => {
    if (!user || editingPropiedadId === null) return;
    try {
      const response = await fetch(`/api/users/${user.id}/propiedades/${editingPropiedadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inmueble: editPropiedad,
          estado: editPropiedadEstado,
        }),
      });
      if (!response.ok) throw new Error('Error al actualizar propiedad');
      const updatedPropiedad: Propiedad = await response.json();

      setUser((prev) => {
        if (!prev || !prev.vendedor) return prev;
        return {
          ...prev,
          vendedor: {
            ...prev.vendedor,
            propiedades: prev.vendedor.propiedades.map((p) =>
              p.id === editingPropiedadId ? updatedPropiedad : p
            ),
          },
        };
      });

      setEditingPropiedadId(null);
      showFeedback('Propiedad actualizada correctamente.');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al actualizar propiedad');
    }
  };

  const handleDeletePropiedad = async (propiedadId: number) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.id}/propiedades/${propiedadId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar propiedad');

      setUser((prev) => {
        if (!prev || !prev.vendedor) return prev;
        return {
          ...prev,
          vendedor: {
            ...prev.vendedor,
            propiedades: prev.vendedor.propiedades.filter((p) => p.id !== propiedadId),
          },
        };
      });
      showFeedback('Propiedad eliminada correctamente.');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al eliminar propiedad');
    }
  };

  const handleAddInteres = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.id}/intereses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInteres),
      });
      if (!response.ok) throw new Error('Error al añadir interés');
      const createdInteres: Interes = await response.json();

      setUser((prev) => {
        if (!prev || !prev.interesado) return prev;
        return {
          ...prev,
          interesado: {
            ...prev.interesado,
            intereses: [...prev.interesado.intereses, createdInteres],
          },
        };
      });

      setShowAddInteres(false);
      setNewInteres({
        tipoInmueble: '',
        zona: '',
        presupuesto: 0,
        habitaciones: 0,
        banos: 0,
        operacion: 'compra',
      });
      showFeedback('Interés añadido correctamente.');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al añadir interés');
    }
  };

  const handleStartEditInteres = (index: number) => {
    if (!user || !user.interesado) return;
    setEditingInteresIndex(index);
    setEditInteres({ ...user.interesado.intereses[index] });
  };

  const handleSaveEditInteres = async () => {
    if (!user || editingInteresIndex === null) return;
    try {
      const response = await fetch(`/api/users/${user.id}/intereses/${editingInteresIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editInteres),
      });
      if (!response.ok) throw new Error('Error al actualizar interés');
      const updatedInteres: Interes = await response.json();

      setUser((prev) => {
        if (!prev || !prev.interesado || editingInteresIndex === null) return prev;
        const newIntereses = [...prev.interesado.intereses];
        newIntereses[editingInteresIndex] = updatedInteres;
        return {
          ...prev,
          interesado: {
            ...prev.interesado,
            intereses: newIntereses,
          },
        };
      });

      setEditingInteresIndex(null);
      showFeedback('Interés actualizado correctamente.');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al actualizar interés');
    }
  };

  const handleDeleteInteres = async (index: number) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.id}/intereses/${index}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar interés');

      setUser((prev) => {
        if (!prev || !prev.interesado) return prev;
        return {
          ...prev,
          interesado: {
            ...prev.interesado,
            intereses: prev.interesado.intereses.filter((_, i) => i !== index),
          },
        };
      });
      showFeedback('Interés eliminado correctamente.');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Error al eliminar interés');
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p>Hubo un error: {error}</p>;
  if (!user) return <p>No se encontraron datos de usuario.</p>;

  return (
    <div>
      {feedback && <div><p>{feedback}</p></div>}

      <header>
        <button onClick={() => navigate(-1)}>Volver</button>

        {!editingProfile ? (
          <>
            <img
              src={user.avatarUrl || '/default-user.png'}
              alt="Avatar"
              width="100"
              height="100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-user.png';
              }}
            />
            <h1>{user.nombre}</h1>
            <p>{user.email}</p>
            <p>
              <strong>Roles:</strong>{' '}
              {user.roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
            </p>
            <button onClick={handleStartEditProfile}>Editar Perfil</button>
          </>
        ) : (
          <div>
            <h2>Editar Perfil</h2>
            <div>
              <label>Nombre:</label>
              <br />
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />
            </div>
            <div>
              <label>Email:</label>
              <br />
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div>
              <label>URL de Avatar:</label>
              <br />
              <input
                type="text"
                value={editAvatarUrl}
                onChange={(e) => setEditAvatarUrl(e.target.value)}
              />
            </div>
            <br />
            <button onClick={handleSaveProfile}>Guardar</button>{' '}
            <button onClick={handleCancelEditProfile}>Cancelar</button>
          </div>
        )}
      </header>

      {(user.roles.includes('vendedor') || user.roles.includes('ambos')) && user.vendedor && (
        <section>
          <h2>Informacion de Vendedor</h2>
          <p>
            <strong>DNI:</strong> {user.vendedor.dni}
          </p>

          <h3>Propiedades ({user.vendedor.propiedades.length})</h3>
          <button onClick={() => setShowAddPropiedad(!showAddPropiedad)}>
            {showAddPropiedad ? 'Cancelar' : 'Añadir Propiedad'}
          </button>

          {showAddPropiedad && (
            <div>
              <h4>Nueva Propiedad</h4>
              <div>
                <label>Direccion:</label>
                <br />
                <input
                  type="text"
                  value={newPropiedad.direccion || ''}
                  onChange={(e) => setNewPropiedad({ ...newPropiedad, direccion: e.target.value })}
                />
              </div>
              <div>
                <label>Tipo:</label>
                <br />
                <select
                  value={newPropiedad.tipo || ''}
                  onChange={(e) => setNewPropiedad({ ...newPropiedad, tipo: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="piso">Piso</option>
                  <option value="casa">Casa</option>
                  <option value="chalet">Chalet</option>
                  <option value="local">Local</option>
                  <option value="oficina">Oficina</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <div>
                <label>Precio:</label>
                <br />
                <input
                  type="number"
                  value={newPropiedad.precio || 0}
                  onChange={(e) => setNewPropiedad({ ...newPropiedad, precio: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label>Superficie:</label>
                <br />
                <input
                  type="number"
                  value={newPropiedad.superficie || 0}
                  onChange={(e) => setNewPropiedad({ ...newPropiedad, superficie: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label>Habitaciones:</label>
                <br />
                <input
                  type="number"
                  value={newPropiedad.habitaciones || 0}
                  onChange={(e) => setNewPropiedad({ ...newPropiedad, habitaciones: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label>Banos:</label>
                <br />
                <input
                  type="number"
                  value={newPropiedad.banos || 0}
                  onChange={(e) => setNewPropiedad({ ...newPropiedad, banos: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label>Descripcion:</label>
                <br />
                <textarea
                  value={newPropiedad.descripcion || ''}
                  onChange={(e) => setNewPropiedad({ ...newPropiedad, descripcion: e.target.value })}
                />
              </div>
              <br />
              <button onClick={handleAddPropiedad}>Guardar Propiedad</button>
            </div>
          )}

          {user.vendedor.propiedades.length === 0 ? (
            <p>No tienes propiedades registradas.</p>
          ) : (
            <ul>
              {user.vendedor.propiedades.map((propiedad) => (
                <li key={propiedad.id}>
                  {editingPropiedadId === propiedad.id ? (
                    <div>
                      <h4>Editando Propiedad #{propiedad.id}</h4>
                      <div>
                        <label>Direccion:</label>
                        <br />
                        <input
                          type="text"
                          value={editPropiedad.direccion || ''}
                          onChange={(e) => setEditPropiedad({ ...editPropiedad, direccion: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Tipo:</label>
                        <br />
                        <select
                          value={editPropiedad.tipo || ''}
                          onChange={(e) => setEditPropiedad({ ...editPropiedad, tipo: e.target.value })}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="piso">Piso</option>
                          <option value="casa">Casa</option>
                          <option value="chalet">Chalet</option>
                          <option value="local">Local</option>
                          <option value="oficina">Oficina</option>
                          <option value="terreno">Terreno</option>
                        </select>
                      </div>
                      <div>
                        <label>Precio:</label>
                        <br />
                        <input
                          type="number"
                          value={editPropiedad.precio || 0}
                          onChange={(e) =>
                            setEditPropiedad({ ...editPropiedad, precio: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <label>Superficie:</label>
                        <br />
                        <input
                          type="number"
                          value={editPropiedad.superficie || 0}
                          onChange={(e) =>
                            setEditPropiedad({ ...editPropiedad, superficie: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <label>Habitaciones:</label>
                        <br />
                        <input
                          type="number"
                          value={editPropiedad.habitaciones || 0}
                          onChange={(e) =>
                            setEditPropiedad({ ...editPropiedad, habitaciones: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <label>Banos:</label>
                        <br />
                        <input
                          type="number"
                          value={editPropiedad.banos || 0}
                          onChange={(e) =>
                            setEditPropiedad({ ...editPropiedad, banos: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <label>Descripcion:</label>
                        <br />
                        <textarea
                          value={editPropiedad.descripcion || ''}
                          onChange={(e) => setEditPropiedad({ ...editPropiedad, descripcion: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Estado:</label>
                        <br />
                        <select
                          value={editPropiedadEstado}
                          onChange={(e) =>
                            setEditPropiedadEstado(e.target.value as 'activo' | 'vendido' | 'eliminado')
                          }
                        >
                          <option value="activo">Activo</option>
                          <option value="vendido">Vendido</option>
                          <option value="eliminado">Eliminado</option>
                        </select>
                      </div>
                      <br />
                      <button onClick={handleSaveEditPropiedad}>Guardar</button>{' '}
                      <button onClick={() => setEditingPropiedadId(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <div>
                      <p><strong>ID:</strong> {propiedad.id}</p>
                      <p><strong>Direccion:</strong> {propiedad.inmueble.direccion || 'N/A'}</p>
                      <p><strong>Tipo:</strong> {propiedad.inmueble.tipo || 'N/A'}</p>
                      <p><strong>Precio:</strong> {propiedad.inmueble.precio ?? 'N/A'}</p>
                      <p><strong>Superficie:</strong> {propiedad.inmueble.superficie ?? 'N/A'}</p>
                      <p><strong>Habitaciones:</strong> {propiedad.inmueble.habitaciones ?? 'N/A'}</p>
                      <p><strong>Banos:</strong> {propiedad.inmueble.banos ?? 'N/A'}</p>
                      <p><strong>Descripcion:</strong> {propiedad.inmueble.descripcion || 'N/A'}</p>
                      <p><strong>Estado:</strong> {propiedad.estado}</p>
                      <button onClick={() => handleStartEditPropiedad(propiedad)}>Editar</button>{' '}
                      <button
                        onClick={() => {
                          if (window.confirm('Estas seguro de eliminar esta propiedad?')) {
                            handleDeletePropiedad(propiedad.id);
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <h3>Contratos ({user.vendedor.contratos.length})</h3>
          {user.vendedor.contratos.length === 0 ? (
            <p>No tienes contratos registrados.</p>
          ) : (
            <ul>
              {user.vendedor.contratos.map((contrato) => (
                <li key={contrato.id}>
                  <p><strong>ID Contrato:</strong> {contrato.id}</p>
                  <p><strong>Tipo de Operacion:</strong> {contrato.operacion.tipo || 'N/A'}</p>
                  <p><strong>Precio:</strong> {contrato.operacion.precio ?? 'N/A'}</p>
                  <p><strong>Fecha Inicio:</strong> {contrato.operacion.fechaInicio || 'N/A'}</p>
                  <p><strong>Fecha Fin:</strong> {contrato.operacion.fechaFin || 'N/A'}</p>
                  <p><strong>Comprador:</strong> {contrato.operacion.comprador || 'N/A'}</p>
                  <p><strong>Estado:</strong> {contrato.estado}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {(user.roles.includes('interesado') || user.roles.includes('ambos')) && user.interesado && (
        <section>
          <h2>Panel de Interesado</h2>
          <p><strong>DNI:</strong> {user.interesado.dni}</p>

          <h3>Intereses ({user.interesado.intereses.length})</h3>
          <button onClick={() => setShowAddInteres(!showAddInteres)}>
            {showAddInteres ? 'Cancelar' : 'Añadir Interes'}
          </button>

          {showAddInteres && (
            <div>
              <h4>Nuevo Interes</h4>
              <div>
                <label>Tipo de Inmueble:</label>
                <br />
                <select
                  value={newInteres.tipoInmueble}
                  onChange={(e) => setNewInteres({ ...newInteres, tipoInmueble: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="piso">Piso</option>
                  <option value="casa">Casa</option>
                  <option value="chalet">Chalet</option>
                  <option value="local">Local</option>
                  <option value="oficina">Oficina</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <div>
                <label>Zona:</label>
                <br />
                <input
                  type="text"
                  value={newInteres.zona}
                  onChange={(e) => setNewInteres({ ...newInteres, zona: e.target.value })}
                />
              </div>
              <div>
                <label>Presupuesto:</label>
                <br />
                <input
                  type="number"
                  value={newInteres.presupuesto}
                  onChange={(e) =>
                    setNewInteres({ ...newInteres, presupuesto: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label>Habitaciones:</label>
                <br />
                <input
                  type="number"
                  value={newInteres.habitaciones}
                  onChange={(e) =>
                    setNewInteres({ ...newInteres, habitaciones: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label>Banos:</label>
                <br />
                <input
                  type="number"
                  value={newInteres.banos}
                  onChange={(e) =>
                    setNewInteres({ ...newInteres, banos: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label>Operacion:</label>
                <br />
                <select
                  value={newInteres.operacion}
                  onChange={(e) =>
                    setNewInteres({ ...newInteres, operacion: e.target.value as 'compra' | 'alquiler' })
                  }
                >
                  <option value="compra">Compra</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              <br />
              <button onClick={handleAddInteres}>Guardar Interes</button>
            </div>
          )}

          {user.interesado.intereses.length === 0 ? (
            <p>No tienes intereses registrados.</p>
          ) : (
            <div>
              {user.interesado.intereses.map((interes, index) => (
                <div key={index}>
                  {editingInteresIndex === index ? (
                    <div>
                      <h4>Editando Interes #{index + 1}</h4>
                      <div>
                        <label>Tipo de Inmueble:</label>
                        <br />
                        <select
                          value={editInteres.tipoInmueble}
                          onChange={(e) =>
                            setEditInteres({ ...editInteres, tipoInmueble: e.target.value })
                          }
                        >
                          <option value="">Seleccionar...</option>
                          <option value="piso">Piso</option>
                          <option value="casa">Casa</option>
                          <option value="chalet">Chalet</option>
                          <option value="local">Local</option>
                          <option value="oficina">Oficina</option>
                          <option value="terreno">Terreno</option>
                        </select>
                      </div>
                      <div>
                        <label>Zona:</label>
                        <br />
                        <input
                          type="text"
                          value={editInteres.zona}
                          onChange={(e) => setEditInteres({ ...editInteres, zona: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Presupuesto:</label>
                        <br />
                        <input
                          type="number"
                          value={editInteres.presupuesto}
                          onChange={(e) =>
                            setEditInteres({
                              ...editInteres,
                              presupuesto: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label>Habitaciones:</label>
                        <br />
                        <input
                          type="number"
                          value={editInteres.habitaciones}
                          onChange={(e) =>
                            setEditInteres({
                              ...editInteres,
                              habitaciones: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label>Banos:</label>
                        <br />
                        <input
                          type="number"
                          value={editInteres.banos}
                          onChange={(e) =>
                            setEditInteres({
                              ...editInteres,
                              banos: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label>Operacion:</label>
                        <br />
                        <select
                          value={editInteres.operacion}
                          onChange={(e) =>
                            setEditInteres({
                              ...editInteres,
                              operacion: e.target.value as 'compra' | 'alquiler',
                            })
                          }
                        >
                          <option value="compra">Compra</option>
                          <option value="alquiler">Alquiler</option>
                        </select>
                      </div>
                      <br />
                      <button onClick={handleSaveEditInteres}>Guardar</button>{' '}
                      <button onClick={() => setEditingInteresIndex(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <div>
                      <p><strong>Tipo de Inmueble:</strong> {interes.tipoInmueble}</p>
                      <p><strong>Zona:</strong> {interes.zona}</p>
                      <p><strong>Presupuesto:</strong> {interes.presupuesto}</p>
                      <p><strong>Habitaciones:</strong> {interes.habitaciones}</p>
                      <p><strong>Banos:</strong> {interes.banos}</p>
                      <p><strong>Operacion:</strong> {interes.operacion}</p>
                      <button onClick={() => handleStartEditInteres(index)}>Editar</button>{' '}
                      <button
                        onClick={() => {
                          if (window.confirm('Estas seguro de eliminar este interes?')) {
                            handleDeleteInteres(index);
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <footer>
        <button onClick={handleLogout}>Cerrar Sesion</button>{' '}
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}>Eliminar Cuenta</button>
        ) : (
          <span>
            <strong>Estas seguro? Esta accion es irreversible.</strong>{' '}
            <button onClick={handleDeleteAccount}>Si, eliminar mi cuenta</button>{' '}
            <button onClick={() => setShowDeleteConfirm(false)}>No, cancelar</button>
          </span>
        )}
      </footer>
    </div>
  );
};

export default UserProfile;
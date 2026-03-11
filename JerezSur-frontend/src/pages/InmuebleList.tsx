import { useEffect, useState } from 'react';
import { getInmuebles } from '../services/api';

interface Inmueble {
  id: number;
  titulo: string;
  precio: number;
  tipo: string;
}

const InmuebleList = () => {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);

  useEffect(() => {
    getInmuebles()
      .then(response => setInmuebles(response.data))
      .catch(error => console.error("Error cargando inmuebles:", error));
  }, []);

  return (
    <div className="inmuebles-container">
      <h1>Inmuebles Disponibles</h1>
      <div className="grid">
        {inmuebles.map(i => (
          <div key={i.id} className="card">
            <h3>{i.titulo}</h3>
            <p>{i.precio} €</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InmuebleList;
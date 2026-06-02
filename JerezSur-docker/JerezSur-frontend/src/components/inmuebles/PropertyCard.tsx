// src/components/inmuebles/PropertyCard.tsx
// Tarjeta que muestra los datos resumidos de un inmueble en el listado.
// Soporta dos modos de visualización: cuadrícula (grid) y lista (list).
import { Link } from 'react-router-dom';
import type { Property } from '../../pages/Inmuebles';
import '../../styles/PropertyCard.scss';

interface PropertyCardProps {
  property: Property;
  viewMode: 'grid' | 'list';
}

const PropertyCard = ({ property, viewMode }: PropertyCardProps) => {
  // Formatea el precio con separador de miles y añade €/mes si es alquiler
  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('es-ES').format(price);
    return type === 'Alquiler' ? `${formatted} €/mes` : `${formatted} €`;
  };

  return (
    // Usamos <article> porque semánticamente cada card es un contenido independiente
    <article className={`property-card property-card--${viewMode}`}>
      <div className="property-card__media">
        <Link to={`/inmuebles/${property.id}`}>
          {/* Si hay imagen la mostramos; si no, mostramos un placeholder con icono */}
          {property.image ? (
            <img src={property.image} alt={property.title} loading="lazy" />
          ) : (
            <div className="property-card__no-image">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Aún no hay imágenes</span>
            </div>
          )}
        </Link>
        <div className="property-card__badges">
          <span className={`property-card__tag property-card__tag--${property.type.toLowerCase()}`}>
            {property.type}
          </span>
          {property.featured && (
            <span className="property-card__tag property-card__tag--featured">
              Destacado
            </span>
          )}
        </div>
        <button className="property-card__favorite" aria-label="Añadir a favoritos">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className="property-card__content">
        <div className="property-card__header">
          <h3 className="property-card__title">
            <Link to={`/inmuebles/${property.id}`}>{property.title}</Link>
          </h3>
          <p className="property-card__location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {property.location}
          </p>
        </div>

        {viewMode === 'list' && property.description && (
          <p className="property-card__description">{property.description}</p>
        )}

        <div className="property-card__features">
          {property.beds > 0 && (
            <span className="property-card__feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              {property.beds} hab.
            </span>
          )}
          {property.baths > 0 && (
            <span className="property-card__feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6h11"></path>
                <path d="M12 9v12"></path>
                <path d="M12 3v3"></path>
                <path d="M3 13.2A9 9 0 0 0 12 21a9 9 0 0 0 9-7.8"></path>
              </svg>
              {property.baths} baños
            </span>
          )}
          <span className="property-card__feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            {property.area} m²
          </span>
        </div>

        {viewMode === 'list' && (
          <div className="property-card__extras">
            {property.hasElevator && (
              <span className="property-card__extra">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Ascensor
              </span>
            )}
            {property.hasParking && (
              <span className="property-card__extra">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Parking
              </span>
            )}
            {property.hasGarden && (
              <span className="property-card__extra">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Jardín
              </span>
            )}
            {property.hasPool && (
              <span className="property-card__extra">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Piscina
              </span>
            )}
          </div>
        )}

        <div className="property-card__footer">
          <span className="property-card__price">{formatPrice(property.price, property.type)}</span>
          <Link to={`/inmuebles/${property.id}`} className="btn btn--primary btn--small">
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
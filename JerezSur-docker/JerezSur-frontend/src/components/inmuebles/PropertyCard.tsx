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
        <Link to={`/inmuebles/${property.id}`}
              aria-label={`Ver detalle de ${property.title}`}
              tabIndex={-1}>
          {/* Si hay imagen la mostramos; si no, mostramos un placeholder con icono */}
          {property.image ? (
            <img src={property.image} alt="" loading="lazy" decoding="async" width="400" height="300" />
          ) : (
            <div className="property-card__media-no-image" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Sin imágenes</span>
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
        {/* Botón de favoritos eliminado — funcionalidad no implementada */}
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
          <Link to={`/inmuebles/${property.id}`} className="btn btn--primary btn--sm">
            Ver detalles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
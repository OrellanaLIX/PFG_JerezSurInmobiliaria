// Skeleton de PropertyCard: se muestra mientras se cargan las propiedades del backend.
// Muestra la misma estructura visual que PropertyCard pero con placeholders animados.
const PropertyCardSkeleton = ({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) => (
  <div className={`property-card property-card--${viewMode} property-card--skeleton`} aria-hidden="true">
    <div className="property-card__media skeleton skeleton-img" />
    <div className="property-card__content">
      <div className="property-card__header">
        <div className="skeleton skeleton-text" style={{ height: '1.2rem', width: '80%', marginBottom: '0.5rem' }} />
        <div className="skeleton skeleton-text" style={{ height: '0.9rem', width: '55%' }} />
      </div>
      <div className="property-card__features" style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '0.75rem 0' }}>
        <div className="skeleton" style={{ height: '0.9rem', width: '60px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '0.9rem', width: '60px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '0.9rem', width: '60px', borderRadius: '4px' }} />
      </div>
      <div className="property-card__footer">
        <div className="skeleton" style={{ height: '1.5rem', width: '120px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '2.5rem', width: '100px', borderRadius: '10px' }} />
      </div>
    </div>
  </div>
);

export default PropertyCardSkeleton;

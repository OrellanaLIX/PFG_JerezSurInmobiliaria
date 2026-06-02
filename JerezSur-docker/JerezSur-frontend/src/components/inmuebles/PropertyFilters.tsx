// src/components/inmuebles/PropertyFilters.tsx
// Panel lateral de filtros para el listado de inmuebles.
// Los filtros de operación, tipo, precio, zona, habitaciones, baños y superficie
// se envían al backend. Las características (ascensor, garaje, etc.) se filtran en cliente.
import { useState } from 'react';
import type { FilterOptions } from '../../pages/Inmuebles';
import '../../styles/PropertyFilters.scss';

interface PropertyFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const PropertyFilters = ({ filters, onFilterChange, onClearFilters }: PropertyFiltersProps) => {
  // Guardamos qué secciones del acordeón están abiertas. Por defecto las más importantes.
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'operation', 'type', 'price', 'zone',
  ]);

  // Abre o cierra una sección del acordeón al pulsar su cabecera
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Actualiza un campo del filtro y notifica al componente padre (Inmuebles.tsx)
  const handleChange = (field: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  // Añade o quita una característica del array de features seleccionadas
  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    onFilterChange({ ...filters, features: newFeatures });
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg
      className={`property-filters__section-icon ${expanded ? 'property-filters__section-icon--expanded' : ''}`}
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <div className="property-filters" role="search" aria-label="Filtros de búsqueda de inmuebles">

      {/* OPERACIÓN */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('operation')}
                aria-expanded={isExpanded('operation')}>
          <h3>Operación</h3>
          <ChevronIcon expanded={isExpanded('operation')} />
        </button>
        {isExpanded('operation') && (
          <div className="property-filters__section-content">
            <fieldset className="property-filters__radio-group">
              <legend className="sr-only">Tipo de operación</legend>
              {[
                { value: 'all',      label: 'Todos' },
                { value: 'Venta',    label: 'Comprar' },
                { value: 'Alquiler', label: 'Alquilar' },
              ].map(opt => (
                <label key={opt.value} className="property-filters__radio">
                  <input type="radio" name="operation" value={opt.value}
                         checked={filters.operation === opt.value}
                         onChange={e => handleChange('operation', e.target.value as any)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </div>

      {/* TIPO DE INMUEBLE */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('type')}
                aria-expanded={isExpanded('type')}>
          <h3>Tipo de inmueble</h3>
          <ChevronIcon expanded={isExpanded('type')} />
        </button>
        {isExpanded('type') && (
          <div className="property-filters__section-content">
            <label htmlFor="filter-tipo" className="sr-only">Tipo de inmueble</label>
            <select id="filter-tipo" value={filters.propertyType}
                    onChange={e => handleChange('propertyType', e.target.value)}
                    className="property-filters__select">
              <option value="">Todos los tipos</option>
              <option value="Piso">Piso / Apartamento</option>
              <option value="Casa">Casa / Chalet</option>
              <option value="Ático">Ático</option>
              <option value="Dúplex">Dúplex</option>
              <option value="Local">Local comercial</option>
              <option value="Parcela">Parcela / Terreno</option>
            </select>
          </div>
        )}
      </div>

      {/* ZONA — opciones basadas en los barrios reales de los inmuebles */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('zone')}
                aria-expanded={isExpanded('zone')}>
          <h3>Zona</h3>
          <ChevronIcon expanded={isExpanded('zone')} />
        </button>
        {isExpanded('zone') && (
          <div className="property-filters__section-content">
            <label htmlFor="filter-zona" className="sr-only">Zona de Jerez de la Frontera</label>
            <select id="filter-zona" value={filters.zone}
                    onChange={e => handleChange('zone', e.target.value)}
                    className="property-filters__select">
              <option value="">Todas las zonas</option>
              <option value="Centro">Centro</option>
              <option value="Chapin">Chapín</option>
              <option value="MOPU">MOPU</option>
              <option value="Ronda">Ronda</option>
              <option value="La Granja">La Granja</option>
              <option value="La Cartuja">La Cartuja</option>
              <option value="San Telmo">San Telmo</option>
              <option value="Ciudad Jardín">Ciudad Jardín</option>
            </select>
          </div>
        )}
      </div>

      {/* PRECIO */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('price')}
                aria-expanded={isExpanded('price')}>
          <h3>Precio (€)</h3>
          <ChevronIcon expanded={isExpanded('price')} />
        </button>
        {isExpanded('price') && (
          <div className="property-filters__section-content">
            <div className="property-filters__range">
              <label htmlFor="filter-precio-min" className="sr-only">Precio mínimo</label>
              <input id="filter-precio-min" type="number" min="0" step="5000"
                     placeholder="Mín €" value={filters.minPrice}
                     onChange={e => handleChange('minPrice', e.target.value)}
                     className="property-filters__input" />
              <span aria-hidden="true">—</span>
              <label htmlFor="filter-precio-max" className="sr-only">Precio máximo</label>
              <input id="filter-precio-max" type="number" min="0" step="5000"
                     placeholder="Máx €" value={filters.maxPrice}
                     onChange={e => handleChange('maxPrice', e.target.value)}
                     className="property-filters__input" />
            </div>
          </div>
        )}
      </div>

      {/* HABITACIONES */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('beds')}
                aria-expanded={isExpanded('beds')}>
          <h3>Habitaciones</h3>
          <ChevronIcon expanded={isExpanded('beds')} />
        </button>
        {isExpanded('beds') && (
          <div className="property-filters__section-content">
            <label htmlFor="filter-habs" className="sr-only">Mínimo de habitaciones</label>
            <select id="filter-habs" value={filters.minBeds}
                    onChange={e => handleChange('minBeds', e.target.value)}
                    className="property-filters__select">
              <option value="">Cualquiera</option>
              <option value="1">1 o más</option>
              <option value="2">2 o más</option>
              <option value="3">3 o más</option>
              <option value="4">4 o más</option>
              <option value="5">5 o más</option>
            </select>
          </div>
        )}
      </div>

      {/* BAÑOS */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('baths')}
                aria-expanded={isExpanded('baths')}>
          <h3>Baños</h3>
          <ChevronIcon expanded={isExpanded('baths')} />
        </button>
        {isExpanded('baths') && (
          <div className="property-filters__section-content">
            <label htmlFor="filter-banos" className="sr-only">Mínimo de baños</label>
            <select id="filter-banos" value={filters.minBaths}
                    onChange={e => handleChange('minBaths', e.target.value)}
                    className="property-filters__select">
              <option value="">Cualquiera</option>
              <option value="1">1 o más</option>
              <option value="2">2 o más</option>
              <option value="3">3 o más</option>
            </select>
          </div>
        )}
      </div>

      {/* SUPERFICIE */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('area')}
                aria-expanded={isExpanded('area')}>
          <h3>Superficie (m²)</h3>
          <ChevronIcon expanded={isExpanded('area')} />
        </button>
        {isExpanded('area') && (
          <div className="property-filters__section-content">
            <div className="property-filters__range">
              <label htmlFor="filter-sup-min" className="sr-only">Superficie mínima</label>
              <input id="filter-sup-min" type="number" min="0" step="10"
                     placeholder="Mín m²" value={filters.minArea}
                     onChange={e => handleChange('minArea', e.target.value)}
                     className="property-filters__input" />
              <span aria-hidden="true">—</span>
              <label htmlFor="filter-sup-max" className="sr-only">Superficie máxima</label>
              <input id="filter-sup-max" type="number" min="0" step="10"
                     placeholder="Máx m²" value={filters.maxArea}
                     onChange={e => handleChange('maxArea', e.target.value)}
                     className="property-filters__input" />
            </div>
          </div>
        )}
      </div>

      {/* CARACTERÍSTICAS */}
      <div className="property-filters__section">
        <button className="property-filters__section-header"
                onClick={() => toggleSection('features')}
                aria-expanded={isExpanded('features')}>
          <h3>Características</h3>
          <ChevronIcon expanded={isExpanded('features')} />
        </button>
        {isExpanded('features') && (
          <div className="property-filters__section-content">
            <fieldset className="property-filters__checkbox-group">
              <legend className="sr-only">Características del inmueble</legend>
              {[
                { key: 'elevator', label: 'Ascensor' },
                { key: 'parking',  label: 'Garaje / Parking' },
                { key: 'garden',   label: 'Jardín' },
                { key: 'pool',     label: 'Piscina' },
              ].map(feat => (
                <label key={feat.key} className="property-filters__checkbox">
                  <input type="checkbox"
                         checked={filters.features.includes(feat.key)}
                         onChange={() => handleFeatureToggle(feat.key)} />
                  <span>{feat.label}</span>
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </div>

      {/* LIMPIAR FILTROS */}
      <button className="property-filters__clear" onClick={onClearFilters}
              aria-label="Limpiar todos los filtros de búsqueda">
        Limpiar filtros
      </button>
    </div>
  );
};

export default PropertyFilters;

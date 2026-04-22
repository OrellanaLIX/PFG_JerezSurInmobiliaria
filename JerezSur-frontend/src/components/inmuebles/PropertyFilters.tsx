// src/components/inmuebles/PropertyFilters.tsx
import { useState } from 'react';
import type { FilterOptions } from '../../pages/Inmuebles';
import '../../styles/PropertyFilters.scss';

interface PropertyFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const PropertyFilters = ({ filters, onFilterChange, onClearFilters }: PropertyFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['operation', 'type', 'price']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleChange = (field: keyof FilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    
    onFilterChange({
      ...filters,
      features: newFeatures,
    });
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  return (
    <div className="property-filters">
      {/* OPERACIÓN */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('operation')}
        >
          <h3>Operación</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('operation') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('operation') && (
          <div className="property-filters__section-content">
            <div className="property-filters__radio-group">
              <label className="property-filters__radio">
                <input
                  type="radio"
                  name="operation"
                  value="all"
                  checked={filters.operation === 'all'}
                  onChange={(e) => handleChange('operation', e.target.value as any)}
                />
                <span>Todos</span>
              </label>
              <label className="property-filters__radio">
                <input
                  type="radio"
                  name="operation"
                  value="Venta"
                  checked={filters.operation === 'Venta'}
                  onChange={(e) => handleChange('operation', e.target.value as any)}
                />
                <span>Comprar</span>
              </label>
              <label className="property-filters__radio">
                <input
                  type="radio"
                  name="operation"
                  value="Alquiler"
                  checked={filters.operation === 'Alquiler'}
                  onChange={(e) => handleChange('operation', e.target.value as any)}
                />
                <span>Alquilar</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* TIPO DE PROPIEDAD */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('type')}
        >
          <h3>Tipo de inmueble</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('type') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('type') && (
          <div className="property-filters__section-content">
            <select
              value={filters.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value)}
              className="property-filters__select"
            >
              <option value="">Todos</option>
              <option value="Piso">Piso</option>
              <option value="Casa">Casa / Chalet</option>
              <option value="Ático">Ático</option>
              <option value="Dúplex">Dúplex</option>
              <option value="Local">Local comercial</option>
              <option value="Parcela">Parcela / Terreno</option>
            </select>
          </div>
        )}
      </div>

      {/* ZONA */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('zone')}
        >
          <h3>Zona</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('zone') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('zone') && (
          <div className="property-filters__section-content">
            <select
              value={filters.zone}
              onChange={(e) => handleChange('zone', e.target.value)}
              className="property-filters__select"
            >
              <option value="">Todas las zonas</option>
              <option value="Centro">Centro</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
              <option value="Este">Este</option>
              <option value="Oeste">Oeste</option>
            </select>
          </div>
        )}
      </div>

      {/* PRECIO */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('price')}
        >
          <h3>Precio</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('price') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('price') && (
          <div className="property-filters__section-content">
            <div className="property-filters__range">
              <input
                type="number"
                placeholder="Mín"
                value={filters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                className="property-filters__input"
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Máx"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                className="property-filters__input"
              />
            </div>
          </div>
        )}
      </div>

      {/* HABITACIONES */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('beds')}
        >
          <h3>Habitaciones</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('beds') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('beds') && (
          <div className="property-filters__section-content">
            <select
              value={filters.minBeds}
              onChange={(e) => handleChange('minBeds', e.target.value)}
              className="property-filters__select"
            >
              <option value="">Cualquiera</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        )}
      </div>

      {/* BAÑOS */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('baths')}
        >
          <h3>Baños</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('baths') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('baths') && (
          <div className="property-filters__section-content">
            <select
              value={filters.minBaths}
              onChange={(e) => handleChange('minBaths', e.target.value)}
              className="property-filters__select"
            >
              <option value="">Cualquiera</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>
        )}
      </div>

      {/* SUPERFICIE */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('area')}
        >
          <h3>Superficie (m²)</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('area') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('area') && (
          <div className="property-filters__section-content">
            <div className="property-filters__range">
              <input
                type="number"
                placeholder="Mín"
                value={filters.minArea}
                onChange={(e) => handleChange('minArea', e.target.value)}
                className="property-filters__input"
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Máx"
                value={filters.maxArea}
                onChange={(e) => handleChange('maxArea', e.target.value)}
                className="property-filters__input"
              />
            </div>
          </div>
        )}
      </div>

      {/* CARACTERÍSTICAS */}
      <div className="property-filters__section">
        <button
          className="property-filters__section-header"
          onClick={() => toggleSection('features')}
        >
          <h3>Características</h3>
          <svg
            className={`property-filters__section-icon ${isExpanded('features') ? 'property-filters__section-icon--expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isExpanded('features') && (
          <div className="property-filters__section-content">
            <div className="property-filters__checkbox-group">
              <label className="property-filters__checkbox">
                <input
                  type="checkbox"
                  checked={filters.features.includes('elevator')}
                  onChange={() => handleFeatureToggle('elevator')}
                />
                <span>Ascensor</span>
              </label>
              <label className="property-filters__checkbox">
                <input
                  type="checkbox"
                  checked={filters.features.includes('parking')}
                  onChange={() => handleFeatureToggle('parking')}
                />
                <span>Parking</span>
              </label>
              <label className="property-filters__checkbox">
                <input
                  type="checkbox"
                  checked={filters.features.includes('garden')}
                  onChange={() => handleFeatureToggle('garden')}
                />
                <span>Jardín</span>
              </label>
              <label className="property-filters__checkbox">
                <input
                  type="checkbox"
                  checked={filters.features.includes('pool')}
                  onChange={() => handleFeatureToggle('pool')}
                />
                <span>Piscina</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* BOTÓN LIMPIAR */}
      <button
        className="property-filters__clear"
        onClick={onClearFilters}
      >
        Limpiar filtros
      </button>
    </div>
  );
};

export default PropertyFilters;
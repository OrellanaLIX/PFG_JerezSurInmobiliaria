// src/pages/Inmuebles.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/inmuebles/PropertyCard';
import PropertyFilters from '../components/inmuebles/PropertyFilters';
import '../styles/Inmuebles.scss';

export type Property = {
  id: number;
  title: string;
  location: string;
  zone: string;
  price: number;
  type: 'Venta' | 'Alquiler';
  propertyType: 'Piso' | 'Casa' | 'Ático' | 'Dúplex' | 'Local' | 'Parcela';
  image: string;
  images?: string[];
  beds: number;
  baths: number;
  area: number;
  slug: string;
  featured?: boolean;
  description?: string;
  yearBuilt?: number;
  floor?: string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  energyRating?: string;
};

export type FilterOptions = {
  operation: 'all' | 'Venta' | 'Alquiler';
  propertyType: string;
  zone: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minArea: string;
  maxArea: string;
  features: string[];
};

// DATOS MOCK (en producción vendrán de tu API)
const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Piso luminoso en zona centro',
    location: 'Centro, Jerez de la Frontera',
    zone: 'Centro',
    price: 185000,
    type: 'Venta',
    propertyType: 'Piso',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    beds: 3,
    baths: 2,
    area: 108,
    slug: 'piso-luminoso-zona-centro',
    featured: true,
    description: 'Precioso piso en pleno centro de Jerez, totalmente reformado y listo para entrar a vivir.',
    yearBuilt: 1985,
    floor: '3º',
    hasElevator: true,
    hasParking: false,
    energyRating: 'D'
  },
  {
    id: 2,
    title: 'Casa familiar con patio',
    location: 'Zona Sur, Jerez de la Frontera',
    zone: 'Sur',
    price: 249000,
    type: 'Venta',
    propertyType: 'Casa',
    image: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
    beds: 4,
    baths: 2,
    area: 164,
    slug: 'casa-familiar-con-patio',
    featured: true,
    hasGarden: true,
    hasParking: true,
    energyRating: 'E'
  },
  {
    id: 3,
    title: 'Ático con terraza',
    location: 'Norte, Jerez de la Frontera',
    zone: 'Norte',
    price: 950,
    type: 'Alquiler',
    propertyType: 'Ático',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    beds: 2,
    baths: 1,
    area: 92,
    slug: 'atico-con-terraza',
    hasElevator: true,
    energyRating: 'C'
  },
  {
    id: 4,
    title: 'Piso reformado cerca Universidad',
    location: 'Zona Este, Jerez de la Frontera',
    zone: 'Este',
    price: 165000,
    type: 'Venta',
    propertyType: 'Piso',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    beds: 3,
    baths: 1,
    area: 95,
    slug: 'piso-reformado-universidad',
    hasElevator: false,
    floor: '1º',
    energyRating: 'E'
  },
  {
    id: 5,
    title: 'Chalet independiente con piscina',
    location: 'Zona Oeste, Jerez de la Frontera',
    zone: 'Oeste',
    price: 425000,
    type: 'Venta',
    propertyType: 'Casa',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    beds: 5,
    baths: 3,
    area: 280,
    slug: 'chalet-independiente-piscina',
    featured: true,
    hasGarden: true,
    hasPool: true,
    hasParking: true,
    energyRating: 'B'
  },
  {
    id: 6,
    title: 'Dúplex moderno zona nueva',
    location: 'Norte, Jerez de la Frontera',
    zone: 'Norte',
    price: 215000,
    type: 'Venta',
    propertyType: 'Dúplex',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    beds: 3,
    baths: 2,
    area: 125,
    slug: 'duplex-moderno-zona-nueva',
    hasElevator: true,
    hasParking: true,
    energyRating: 'A'
  },
  {
    id: 7,
    title: 'Apartamento económico',
    location: 'Sur, Jerez de la Frontera',
    zone: 'Sur',
    price: 650,
    type: 'Alquiler',
    propertyType: 'Piso',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    beds: 2,
    baths: 1,
    area: 68,
    slug: 'apartamento-economico',
    floor: '2º',
    hasElevator: true,
    energyRating: 'D'
  },
  {
    id: 8,
    title: 'Local comercial en calle principal',
    location: 'Centro, Jerez de la Frontera',
    zone: 'Centro',
    price: 1200,
    type: 'Alquiler',
    propertyType: 'Local',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    beds: 0,
    baths: 1,
    area: 85,
    slug: 'local-comercial-calle-principal',
    energyRating: 'E'
  },
];

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'area-desc';

const Inmuebles = () => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [filters, setFilters] = useState<FilterOptions>({
    operation: 'all',
    propertyType: '',
    zone: '',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    minBaths: '',
    minArea: '',
    maxArea: '',
    features: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros
  useEffect(() => {
    let result = [...properties];

    // Filtro de operación
    if (filters.operation !== 'all') {
      result = result.filter(p => p.type === filters.operation);
    }

    // Filtro de tipo de propiedad
    if (filters.propertyType) {
      result = result.filter(p => p.propertyType === filters.propertyType);
    }

    // Filtro de zona
    if (filters.zone) {
      result = result.filter(p => p.zone === filters.zone);
    }

    // Filtro de precio
    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }

    // Filtro de habitaciones
    if (filters.minBeds) {
      result = result.filter(p => p.beds >= Number(filters.minBeds));
    }

    // Filtro de baños
    if (filters.minBaths) {
      result = result.filter(p => p.baths >= Number(filters.minBaths));
    }

    // Filtro de superficie
    if (filters.minArea) {
      result = result.filter(p => p.area >= Number(filters.minArea));
    }
    if (filters.maxArea) {
      result = result.filter(p => p.area <= Number(filters.maxArea));
    }

    // Filtro de características
    if (filters.features.length > 0) {
      result = result.filter(p => {
        return filters.features.every(feature => {
          switch (feature) {
            case 'elevator': return p.hasElevator;
            case 'parking': return p.hasParking;
            case 'garden': return p.hasGarden;
            case 'pool': return p.hasPool;
            default: return true;
          }
        });
      });
    }

    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'area-desc':
        result.sort((a, b) => b.area - a.area);
        break;
      default:
        result.sort((a, b) => b.id - a.id);
    }

    setFilteredProperties(result);
  }, [properties, filters, sortBy]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      operation: 'all',
      propertyType: '',
      zone: '',
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      minBaths: '',
      minArea: '',
      maxArea: '',
      features: [],
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (value === 'all' || value === '') return false;
    return true;
  }).length;

  return (
    <main className="inmuebles">

      {/* BARRA DE HERRAMIENTAS */}
      <section className="section inmuebles-toolbar">
        <div className="inmuebles-toolbar__container">
          <div className="inmuebles-toolbar__left">
            <button
              className={`inmuebles-toolbar__filter-toggle ${showFilters ? 'inmuebles-toolbar__filter-toggle--active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filtros
              {activeFiltersCount > 0 && (
                <span className="inmuebles-toolbar__filter-badge">{activeFiltersCount}</span>
              )}
            </button>

            <div className="inmuebles-toolbar__results">
              <strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}
            </div>
          </div>

          <div className="inmuebles-toolbar__right">
            <div className="inmuebles-toolbar__sort">
              <label htmlFor="sort">Ordenar por:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="recent">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="area-desc">Superficie: mayor a menor</option>
              </select>
            </div>

            <div className="inmuebles-toolbar__view">
              <button
                className={`inmuebles-toolbar__view-btn ${viewMode === 'grid' ? 'inmuebles-toolbar__view-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Vista en cuadrícula"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                className={`inmuebles-toolbar__view-btn ${viewMode === 'list' ? 'inmuebles-toolbar__view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="Vista en lista"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="section inmuebles-content">
        <div className="inmuebles-container">
          {/* SIDEBAR FILTROS */}
          <aside className={`inmuebles-filters ${showFilters ? 'inmuebles-filters--visible' : ''}`}>
            <div className="inmuebles-filters__header">
              <h2>Filtros</h2>
              <button
                className="inmuebles-filters__close"
                onClick={() => setShowFilters(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <PropertyFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* GRID DE PROPIEDADES */}
          <div className="inmuebles-main">
            {filteredProperties.length > 0 ? (
              <div className={`inmuebles-grid inmuebles-grid--${viewMode}`}>
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="inmuebles-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No se encontraron inmuebles</h3>
                <p>Intenta ajustar los filtros para ver más resultados</p>
                <button className="btn btn--primary" onClick={handleClearFilters}>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--alt inmuebles-cta">
        <div className="inmuebles-cta__content">
          <h2>¿No encuentras lo que buscas?</h2>
          <p>Contáctanos y te ayudaremos a encontrar el inmueble perfecto para ti.</p>
          <div className="inmuebles-cta__actions">
            <Link to="/contacto" className="btn btn--primary">
              Contactar
            </Link>
            <Link to="/propietarios" className="btn btn--outline">
              Vender mi inmueble
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Inmuebles;
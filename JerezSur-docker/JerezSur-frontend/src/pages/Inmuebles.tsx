// src/pages/Inmuebles.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/inmuebles/PropertyCard';
import PropertyFilters from '../components/inmuebles/PropertyFilters';
import '../styles/Inmuebles.scss';

// ==========================================
// TIPOS DEL FRONTEND
// ==========================================
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

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'area-desc';

// ==========================================
// TIPOS DEL BACKEND (según tu entidad real)
// ==========================================
type ImagenBackend = {
  id?: number;
  url?: string;
  urlImagen?: string;
  principal?: boolean;
  orden?: number;
};

type InmuebleBackend = {
  id: number;
  referencia: string;
  titulo: string;
  descripcion?: string;
  precio: number;

  operacion?: 'VENTA' | 'ALQUILER' | 'AMBOS';
  estado?: 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO';

  caracteristicasExtra?: Record<string, string>;

  superficieUtil?: number;
  mConstruidos?: number;
  habitaciones?: number;
  banos?: number;

  direccion: string;
  codigoPostal: string;
  ciudad: string;

  comunidad?: number;
  tieneDerrama?: boolean;
  valorDerrama?: number;
  ibi?: number;

  refCatastral?: string;
  urlNotaSimple?: string;
  urlCertificadoEnergetico?: string;
  urlPlanoInmueble?: string;

  imagenes?: ImagenBackend[];

  fechaRegistro?: string;
  fechaUltimaActualizacion?: string;
};

// ==========================================
// CONFIG
// ==========================================
const API_BASE = '/api';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

// ==========================================
// HELPERS DE MAPEO
// ==========================================
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const parseBoolFromExtra = (v?: string): boolean => {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return ['true', '1', 'si', 'sí', 'yes', 'y', 'x'].includes(s);
};

// Operación: VENTA / ALQUILER / AMBOS → Venta / Alquiler
const mapTipoOperacion = (raw?: string): 'Venta' | 'Alquiler' => {
  if (raw === 'ALQUILER') return 'Alquiler';
  return 'Venta'; // VENTA y AMBOS muestran "Venta" por defecto
};

// Lee el "tipo" desde caracteristicasExtra (no existe como campo en la entidad)
const mapTipoInmueble = (extras?: Record<string, string>): Property['propertyType'] => {
  if (!extras) return 'Piso';
  const valor = (extras['TIPO'] || extras['tipo'] || extras['Tipo'] || '').toUpperCase();
  if (valor.includes('CASA')) return 'Casa';
  if (valor.includes('ATICO') || valor.includes('ÁTICO')) return 'Ático';
  if (valor.includes('DUPLEX') || valor.includes('DÚPLEX')) return 'Dúplex';
  if (valor.includes('LOCAL')) return 'Local';
  if (valor.includes('PARCELA')) return 'Parcela';
  return 'Piso';
};

// Extrae URL de una Imagen del backend
const getImageUrl = (img?: ImagenBackend): string | undefined => {
  if (!img) return undefined;
  return img.url || img.urlImagen;
};

// Convierte una lista de Imagen del backend a string[]
const mapImagenes = (imgs?: ImagenBackend[]): string[] => {
  if (!imgs || imgs.length === 0) return [];

  // Ordenar: la principal primero, luego por "orden"
  const sorted = [...imgs].sort((a, b) => {
    if (a.principal && !b.principal) return -1;
    if (!a.principal && b.principal) return 1;
    return (a.orden ?? 0) - (b.orden ?? 0);
  });

  return sorted.map(getImageUrl).filter((u): u is string => !!u);
};

const mapInmuebleToProperty = (item: InmuebleBackend): Property => {
  const extras = item.caracteristicasExtra || {};
  const imagenes = mapImagenes(item.imagenes);

  return {
    id: item.id,
    title: item.titulo || item.referencia || `Inmueble #${item.id}`,
    location: `${item.direccion}, ${item.ciudad}`,
    zone: item.ciudad,
    price: item.precio ?? 0,
    type: mapTipoOperacion(item.operacion),
    propertyType: mapTipoInmueble(extras),
    image: imagenes[0] || DEFAULT_IMAGE,
    images: imagenes,
    beds: item.habitaciones ?? 0,
    baths: item.banos ?? 0,
    area: item.superficieUtil ?? 0,
    slug: slugify(item.referencia || item.titulo),
    featured: parseBoolFromExtra(extras['DESTACADO'] || extras['Destacado']),
    description: item.descripcion,
    yearBuilt: extras['AÑO'] ? Number(extras['AÑO']) : undefined,
    floor: extras['PLANTA'] || extras['Planta'],
    hasElevator: parseBoolFromExtra(extras['ASCENSOR'] || extras['Ascensor']),
    hasParking: parseBoolFromExtra(
      extras['PARKING'] || extras['GARAJE'] || extras['Garaje'] || extras['APARCAMIENTO']
    ),
    hasGarden: parseBoolFromExtra(extras['JARDIN'] || extras['JARDÍN'] || extras['Jardín']),
    hasPool: parseBoolFromExtra(extras['PISCINA'] || extras['Piscina']),
    energyRating:
      extras['CERTIFICADO_ENERGETICO'] ||
      extras['CERTIFICADO'] ||
      extras['Certificado'] ||
      undefined,
  };
};

// ==========================================
// COMPONENT
// ==========================================
const Inmuebles = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

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

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.operation !== 'all' ? 1 : 0) +
      (filters.propertyType ? 1 : 0) +
      (filters.zone ? 1 : 0) +
      (filters.minPrice ? 1 : 0) +
      (filters.maxPrice ? 1 : 0) +
      (filters.minBeds ? 1 : 0) +
      (filters.minBaths ? 1 : 0) +
      (filters.minArea ? 1 : 0) +
      (filters.maxArea ? 1 : 0) +
      (filters.features?.length ? 1 : 0)
    );
  }, [filters]);

  // ==========================================
  // CARGA DESDE BACKEND
  // ==========================================
  useEffect(() => {
    const controller = new AbortController();

    const fetchInmuebles = async () => {
      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('accessToken') ||
          '';

        const params = new URLSearchParams();

        // Operación
        if (filters.operation === 'Venta') params.set('operacion', 'VENTA');
        else if (filters.operation === 'Alquiler') params.set('operacion', 'ALQUILER');

        // Estado por defecto
        params.set('estado', 'DISPONIBLE');

        // Precio y Características
        if (filters.minPrice) params.set('precioMin', filters.minPrice);
        if (filters.maxPrice) params.set('precioMax', filters.maxPrice);
        if (filters.minBeds) params.set('habitaciones', filters.minBeds);
        if (filters.minBaths) params.set('banos', filters.minBaths);
        if (filters.minArea) params.set('superficieMin', filters.minArea);
        if (filters.zone) params.set('ciudad', filters.zone);

        // Paginación
        params.set('page', '0');
        params.set('size', '100');

        // Ordenación
        let sortByField = 'id';
        let sortDir: 'asc' | 'desc' = 'desc';

        if (sortBy === 'recent') {
          sortByField = 'id';
          sortDir = 'desc';
        } else if (sortBy === 'price-asc') {
          sortByField = 'precio';
          sortDir = 'asc';
        } else if (sortBy === 'price-desc') {
          sortByField = 'precio';
          sortDir = 'desc';
        } else if (sortBy === 'area-desc') {
          sortByField = 'superficieUtil';
          sortDir = 'desc';
        }

        params.set('sortBy', sortByField);
        params.set('sortDir', sortDir);

        const response = await fetch(`${API_BASE}/inmuebles?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} al cargar inmuebles`);
        }

        const json = await response.json();
        const content: InmuebleBackend[] = json?.content ?? [];
        const mapped = content.map(mapInmuebleToProperty);
        setProperties(mapped);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInmuebles();
    return () => controller.abort();

    // SOLUCIÓN AQUÍ: Escuchamos propiedades primitivas exactas. 
    // Esto evita que si cambia otra propiedad no usada por el backend, se reinicie el efecto.
  }, [
    filters.operation,
    filters.minPrice,
    filters.maxPrice,
    filters.minBeds,
    filters.minBaths,
    filters.minArea,
    filters.zone,
    sortBy
  ]);

  // ==========================================
  // FILTRADO COMPLEMENTARIO EN CLIENTE
  // ==========================================
  useEffect(() => {
    let result = [...properties];

    // propertyType (no lo filtra el backend porque está en caracteristicasExtra)
    if (filters.propertyType) {
      result = result.filter((p) => p.propertyType === filters.propertyType);
    }

    // maxArea (no soportada en backend)
    if (filters.maxArea) {
      const maxA = Number(filters.maxArea);
      if (!Number.isNaN(maxA)) result = result.filter((p) => p.area <= maxA);
    }

    // features (en caracteristicasExtra)
    if (filters.features.length > 0) {
      result = result.filter((p) =>
        filters.features.every((feature) => {
          switch (feature) {
            case 'elevator': return !!p.hasElevator;
            case 'parking': return !!p.hasParking;
            case 'garden': return !!p.hasGarden;
            case 'pool': return !!p.hasPool;
            default: return true;
          }
        })
      );
    }

    setFilteredProperties(result);
  }, [properties, filters]);

  const handleFilterChange = (newFilters: FilterOptions) => setFilters(newFilters);

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

  return (
    <main className="inmuebles">
      {/* BARRA DE HERRAMIENTAS */}
      <section className="inmuebles-toolbar">
        <div className="inmuebles-toolbar__container">
          <div className="inmuebles-toolbar__left">
            <button
              className={`inmuebles-toolbar__filter-toggle ${showFilters ? 'inmuebles-toolbar__filter-toggle--active' : ''
                }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filtros
              {activeFiltersCount > 0 && (
                <span className="inmuebles-toolbar__filter-badge">{activeFiltersCount}</span>
              )}
            </button>

            <div className="inmuebles-toolbar__results">
              {loading ? (
                <span className="inmuebles-toolbar__loading-text">Cargando propiedades...</span>
              ) : (
                <>
                  <strong>{filteredProperties.length}</strong>{' '}
                  {filteredProperties.length === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}
                </>
              )}
            </div>
          </div>

          <div className="inmuebles-toolbar__right">
            <div className="inmuebles-toolbar__sort">
              <label htmlFor="sort">Ordenar por:</label>
              <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                <option value="recent">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="area-desc">Superficie: mayor a menor</option>
              </select>
            </div>

            <div className="inmuebles-toolbar__view">
              <button
                className={`inmuebles-toolbar__view-btn ${viewMode === 'grid' ? 'inmuebles-toolbar__view-btn--active' : ''
                  }`}
                onClick={() => setViewMode('grid')}
                aria-label="Vista en cuadrícula"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>

              <button
                className={`inmuebles-toolbar__view-btn ${viewMode === 'list' ? 'inmuebles-toolbar__view-btn--active' : ''
                  }`}
                onClick={() => setViewMode('list')}
                aria-label="Vista en lista"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

      {/* CONTENIDO PRINCIPAL Y REJILLA */}
      <section className="inmuebles-content">
        <div className="inmuebles-container">

          {/* PANEL LATERAL DE FILTROS */}
          <aside className={`inmuebles-filters ${showFilters ? 'inmuebles-filters--visible' : ''}`}>
            <div className="inmuebles-filters__header">
              <h2>Filtros avanzados</h2>
              <button className="inmuebles-filters__close" onClick={() => setShowFilters(false)}>
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

          {/* CONTENEDOR DE TARJETAS / ESTADOS */}
          <div className="inmuebles-main">
            {error ? (
              <div className="inmuebles-empty inmuebles-empty--error">
                <div className="inmuebles-empty__icon-wrapper">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error al cargar inmuebles</h3>
                <p>{error}</p>
                <button className="btn btn--primary" onClick={() => window.location.reload()}>
                  <i className="fas fa-sync-alt"></i> Reintentar
                </button>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className={`inmuebles-grid inmuebles-grid--${viewMode}`}>
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="inmuebles-empty">
                <div className="inmuebles-empty__icon-wrapper">
                  <i className="fas fa-folder-open"></i>
                </div>
                <h3>No se encontraron inmuebles</h3>
                <p>{loading ? 'Buscando en la base de datos...' : 'Intenta ajustar o limpiar los filtros para ver más resultados.'}</p>
                {!loading && (
                  <button className="btn btn--primary" onClick={handleClearFilters}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN CTA FINAL (DISEÑO PREMIUM DEL HOME CONTINUO) */}
      <section className="inmuebles-cta">
        <div className="inmuebles-cta__container">
          <div className="inmuebles-cta__content">
            <div className="inmuebles-cta__text">
              <h2>¿No encuentras lo que buscas?</h2>
              <p>Contáctanos directamente; nuestro equipo se encargará de buscar el inmueble perfecto a la medida de tus necesidades.</p>
            </div>
            <div className="inmuebles-cta__actions">
              <Link to="/contacto" className="btn btn--primary">
                Contactar ahora
              </Link>
              <Link to="/propietarios" className="btn btn--outline white">
                Vender mi inmueble
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Inmuebles;
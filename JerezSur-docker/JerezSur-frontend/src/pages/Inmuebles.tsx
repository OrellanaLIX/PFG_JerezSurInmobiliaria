// src/pages/Inmuebles.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/inmuebles/PropertyCard';
import PropertyCardSkeleton from '../components/inmuebles/PropertyCardSkeleton';
import PropertyFilters from '../components/inmuebles/PropertyFilters';
import '../styles/Inmuebles.scss';
import { useSEO } from '../hooks/useSEO';

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
// TIPO DEL BACKEND — InmuebleListadoDTO
// ==========================================
// Tipo del InmuebleListadoDTO que devuelve el backend
type InmuebleBackend = {
  id: number;
  referencia: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  operacion?: 'VENTA' | 'ALQUILER' | 'CUALQUIERA';
  estado?: 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO' | 'RETIRADO';
  tipo?: string;    // PISO / CASA / CHALET / ATICO / LOCAL_COMERCIAL…
  superficieUtil?: number;
  mConstruidos?: number;
  habitaciones?: number;
  banos?: number;
  ciudad: string;
  zona?: string;
  imagenPortadaUrl?: string | null;
  destacado?: boolean;
  // Características booleanas (extraídas del mapa de extras en el backend)
  tieneAscensor?: boolean;
  tieneGaraje?:   boolean;
  tieneJardin?:   boolean;
  tienePiscina?:  boolean;
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

// El backend ahora devuelve el tipo como string (PISO, CASA, CHALET…)
const mapTipoInmueble = (tipoRaw?: string): Property['propertyType'] => {
  if (!tipoRaw) return 'Piso';
  const t = tipoRaw.toUpperCase();
  if (t.includes('CASA')) return 'Casa';
  if (t.includes('ATICO') || t.includes('ÁTICO')) return 'Ático';
  if (t.includes('DUPLEX') || t.includes('DÚPLEX')) return 'Dúplex';
  if (t.includes('LOCAL')) return 'Local';
  if (t.includes('PARCELA') || t.includes('TERRENO') || t.includes('FINCA')) return 'Parcela';
  return 'Piso';
};

// Convierte el DTO del backend al tipo Property que usa PropertyCard
const mapInmuebleToProperty = (item: InmuebleBackend): Property => ({
  id:           item.id,
  title:        item.titulo || item.referencia || `Inmueble #${item.id}`,
  location:     item.zona ? `${item.zona}, ${item.ciudad}` : item.ciudad,
  zone:         item.zona || item.ciudad,
  price:        item.precio ?? 0,
  type:         mapTipoOperacion(item.operacion),
  propertyType: mapTipoInmueble(item.tipo),
  image:        item.imagenPortadaUrl ?? '',
  images:       item.imagenPortadaUrl ? [item.imagenPortadaUrl] : [],
  beds:         item.habitaciones ?? 0,
  baths:        item.banos ?? 0,
  area:         item.superficieUtil ?? 0,
  slug:         slugify(item.referencia || item.titulo),
  featured:     item.destacado ?? false,
  description:  item.descripcion,
  // Las características booleanas vienen directamente del backend
  hasElevator: item.tieneAscensor ?? false,
  hasParking:  item.tieneGaraje   ?? false,
  hasGarden:   item.tieneJardin   ?? false,
  hasPool:     item.tienePiscina  ?? false,
});

// ==========================================
// COMPONENT
// ==========================================
const operacionToFilter = (op?: string | null): FilterOptions['operation'] => {
  if (op === 'VENTA')    return 'Venta';
  if (op === 'ALQUILER') return 'Alquiler';
  return 'all';
};

const Inmuebles = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useSEO({
    title: 'Inmuebles en Jerez de la Frontera',
    description: 'Busca pisos, casas, chalets y locales en venta y alquiler en Jerez de la Frontera. Filtros avanzados por precio, zona, habitaciones y más.',
    canonical: window.location.origin + '/inmuebles',
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  // Inicializa filtros leyendo directamente de window.location.search para evitar
  // problemas de timing de React Router cuando se navega desde el buscador de Home.
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      operation: operacionToFilter(p.get('operacion')),
      propertyType: '',
      zone: p.get('zona') ?? '',
      minPrice: '',
      maxPrice: p.get('precioMax') ?? '',
      minBeds: p.get('habitaciones') ?? '',
      minBaths: '',
      minArea: '',
      maxArea: p.get('superficieMax') ?? '',
      features: [],
    };
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

        // Operación (Venta / Alquiler)
        if (filters.operation === 'Venta')    params.set('operacion', 'VENTA');
        else if (filters.operation === 'Alquiler') params.set('operacion', 'ALQUILER');

        // Solo inmuebles disponibles
        params.set('estado', 'DISPONIBLE');

        // Tipo de inmueble — se envía directamente al backend como enum
        if (filters.propertyType) {
          const tipoMap: Record<string, string> = {
            'Piso':    'PISO',
            'Casa':    'CASA',
            'Ático':   'ATICO',
            'Dúplex':  'DUPLEX',
            'Local':   'LOCAL_COMERCIAL',
            'Parcela': 'TERRENO',
          };
          const tipoBackend = tipoMap[filters.propertyType];
          if (tipoBackend) params.set('tipo', tipoBackend);
        }

        // Precio
        if (filters.minPrice) params.set('precioMin', filters.minPrice);
        if (filters.maxPrice) params.set('precioMax', filters.maxPrice);

        // Habitaciones y baños
        if (filters.minBeds)  params.set('habitaciones', filters.minBeds);
        if (filters.minBaths) params.set('banos', filters.minBaths);

        // Superficie
        if (filters.minArea) params.set('superficieMin', filters.minArea);
        if (filters.maxArea) params.set('superficieMax', filters.maxArea);

        // Zona — filtra por el campo `zona` del inmueble (Chapín, Centro, MOPU…)
        if (filters.zone) params.set('zona', filters.zone);

        // Paginación — 200 resultados para una inmobiliaria local es más que suficiente
        params.set('page', '0');
        params.set('size', '200');

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
  // Filtrado client-side solo para características que no se pueden manejar en el backend
  // (operación, tipo, precio, habitaciones, baños, superficie, zona → backend)
  useEffect(() => {
    let result = [...properties];

    // Características especiales (ascensor, garaje, jardín, piscina)
    // Ya vienen como booleanos desde el backend, solo filtramos aquí
    if (filters.features.length > 0) {
      result = result.filter((p) =>
        filters.features.every((feature) => {
          switch (feature) {
            case 'elevator': return !!p.hasElevator;
            case 'parking':  return !!p.hasParking;
            case 'garden':   return !!p.hasGarden;
            case 'pool':     return !!p.hasPool;
            default: return true;
          }
        })
      );
    }

    setFilteredProperties(result);
  }, [properties, filters]);

  // Sincroniza los filtros activos en la URL para que los enlaces sean compartibles
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.operation === 'Venta')    params.set('operacion', 'VENTA');
    if (filters.operation === 'Alquiler') params.set('operacion', 'ALQUILER');
    if (filters.zone)     params.set('zona', filters.zone);
    if (filters.maxPrice) params.set('precioMax', filters.maxPrice);
    if (filters.minPrice) params.set('precioMin', filters.minPrice);
    if (filters.minBeds)  params.set('habitaciones', filters.minBeds);
    if (filters.maxArea)  params.set('superficieMax', filters.maxArea);
    setSearchParams(params, { replace: true });
  }, [
    filters.operation, filters.zone, filters.maxPrice,
    filters.minPrice, filters.minBeds, filters.maxArea,
  ]);

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
      {/* HERO COMPACTO */}
      <section className="inmuebles-hero" aria-label="Catálogo de inmuebles">
        <div className="inmuebles-hero__content">
          <span className="inmuebles-hero__eyebrow">Catálogo de propiedades</span>
          <h1 className="inmuebles-hero__titulo">Inmuebles en Jerez de la Frontera</h1>
          <p className="inmuebles-hero__subtitulo">Pisos, casas, chalets y locales en venta y alquiler</p>
        </div>
      </section>

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
            {loading ? (
              // Skeleton: muestra 6 tarjetas animadas mientras se cargan los datos reales
              <div className={`inmuebles-grid inmuebles-grid--${viewMode}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : error ? (
              <div className="inmuebles-empty inmuebles-empty--error">
                <div className="inmuebles-empty__icon-wrapper">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3>Error al cargar inmuebles</h3>
                <p>{error}</p>
                <button className="btn btn--primary" onClick={() => window.location.reload()}>
                  Reintentar
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
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3>No se encontraron inmuebles</h3>
                <p>Intenta ajustar o limpiar los filtros para ver más resultados.</p>
                <button className="btn btn--primary" onClick={handleClearFilters}>
                  Limpiar filtros
                </button>
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

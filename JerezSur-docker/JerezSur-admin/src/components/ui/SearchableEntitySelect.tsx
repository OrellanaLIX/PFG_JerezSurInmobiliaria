// Componente de selección de entidad con búsqueda en tiempo real.
// Reemplaza los inputs de ID numérico por una lista buscable que carga datos del backend.
// Se usa en formularios del admin donde hay que seleccionar un inmueble, usuario, etc.
import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import api from '../../services/api';
import './SearchableEntitySelect.scss';

interface Option {
  id: number;
  label: string;        // Texto principal (título, nombre...)
  sublabel?: string;    // Texto secundario (precio, email...)
  badge?: string;       // Etiqueta de estado (DISPONIBLE, VENTA...)
  badgeColor?: string;  // Color del badge (green, blue, gray...)
  imageUrl?: string;    // Imagen en miniatura (para inmuebles)
}

interface SearchableEntitySelectProps {
  label: string;
  placeholder?: string;
  // Endpoint del backend al que se llama para buscar (ej: '/inmuebles')
  endpoint: string;
  // Función que convierte cada elemento de la respuesta en una Option
  mapOption: (item: any) => Option;
  // ID del registro seleccionado actualmente (null = ninguno)
  value: number | null;
  onChange: (id: number | null, option: Option | null) => void;
  // Parámetros extra de la query (ej: { estado: 'DISPONIBLE' })
  queryParams?: Record<string, string>;
  required?: boolean;
  disabled?: boolean;
  // Texto de ayuda que aparece bajo el campo
  helpText?: string;
}

const SearchableEntitySelect = ({
  label,
  placeholder = 'Escribe para buscar...',
  endpoint,
  mapOption,
  value,
  onChange,
  queryParams = {},
  required = false,
  disabled = false,
  helpText,
}: SearchableEntitySelectProps) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs para props inestables: evitan que search se recree en cada render del padre
  const queryParamsRef = useRef(queryParams);
  queryParamsRef.current = queryParams;
  const mapOptionRef = useRef(mapOption);
  mapOptionRef.current = mapOption;

  // search solo depende de endpoint (string estable); queryParams y mapOption se leen via ref
  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...queryParamsRef.current,
        size: '10',
        page: '0',
        ...(q ? { tit: q } : {}),
      });
      const { data } = await api.get(`${endpoint}?${params}`);
      const items: any[] = data?.content ?? (Array.isArray(data) ? data : []);
      setOptions(items.map(mapOptionRef.current));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Carga inmediata al abrir el dropdown (sin debounce para no bloquear la apertura)
  useEffect(() => {
    if (!open) return;
    search(query);
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounce solo al cambiar el texto de búsqueda (no al abrir)
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Cierra el dropdown si se hace clic fuera del componente
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt: Option) => {
    setSelected(opt);
    onChange(opt.id, opt);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null, null);
    setQuery('');
  };

  const badgeStyle = (color?: string): CSSProperties => {
    const map: Record<string, { bg: string; color: string }> = {
      green: { bg: 'rgba(46,155,77,0.12)', color: '#1e7a3a' },
      blue: { bg: 'rgba(0,67,156,0.10)', color: '#00439c' },
      orange: { bg: 'rgba(230,167,0,0.12)', color: '#b07f00' },
      red: { bg: 'rgba(217,83,79,0.12)', color: '#a32522' },
      gray: { bg: 'rgba(107,114,128,0.10)', color: '#6b7280' },
    };
    const s = map[color || 'gray'] ?? map.gray;
    return { background: s.bg, color: s.color };
  };

  return (
    <div className={`ses ${disabled ? 'ses--disabled' : ''}`} ref={containerRef}>
      <label className="ses__label">
        {label}{required && <span className="ses__required"> *</span>}
      </label>

      {/* 1. Registro seleccionado actualmente */}
      {selected || value ? (
        <div className="ses__selected">
          {selected?.imageUrl && (
            <img src={selected.imageUrl} alt="" className="ses__selected-img" loading="lazy" />
          )}
          <div className="ses__selected-info">
            <span className="ses__selected-label">{selected?.label ?? `ID ${value}`}</span>
            {selected?.sublabel && <span className="ses__selected-sub">{selected.sublabel}</span>}
          </div>
          {selected?.badge && (
            <span className="ses__badge" style={badgeStyle(selected.badgeColor)}>
              {selected.badge}
            </span>
          )}
          {!disabled && (
            <button type="button" className="ses__clear" onClick={handleClear} aria-label="Quitar selección">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        // MODIFICACIÓN AQUÍ: Solo mostramos el botón estático si el buscador NO está abierto
        !open && (
          <button
            type="button"
            className="ses__trigger"
            onClick={() => !disabled && setOpen(true)}
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>{placeholder}</span>
          </button>
        )
      )}

      {/* Dropdown de búsqueda */}
      {open && (
        <div className="ses__dropdown">
          <div className="ses__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ses__search-icon">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="ses__search-input"
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button type="button" className="ses__search-clear" onClick={() => setQuery('')}>✕</button>
            )}
          </div>

          <div className="ses__results">
            {loading && (
              <div className="ses__state">
                <div className="ses__spinner" />
                <span>Buscando...</span>
              </div>
            )}
            {!loading && options.length === 0 && (
              <div className="ses__state ses__state--empty">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Sin resultados para <strong>"{query || 'todo'}"</strong></span>
              </div>
            )}
            {!loading && options.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`ses__option ${value === opt.id ? 'ses__option--selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt.imageUrl && (
                  <img src={opt.imageUrl} alt="" className="ses__option-img" loading="lazy" />
                )}
                <div className="ses__option-info">
                  <span className="ses__option-label">{opt.label}</span>
                  {opt.sublabel && <span className="ses__option-sub">{opt.sublabel}</span>}
                </div>
                {opt.badge && (
                  <span className="ses__badge" style={badgeStyle(opt.badgeColor)}>
                    {opt.badge}
                  </span>
                )}
                <span className="ses__option-id">#{opt.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {helpText && <p className="ses__help">{helpText}</p>}
    </div>
  );
};

export default SearchableEntitySelect;
import { useState, useEffect } from 'react';
import SearchableEntitySelect from './SearchableEntitySelect';

interface Props {
  propietarios: Record<string, number>;
  onChange: (p: Record<string, number>) => void;
}

const mapVendedorOption = (v: any) => ({
  id: v.id as number,
  label: v.usuario
    ? `${v.usuario.nombre ?? ''} ${v.usuario.apellidos ?? ''}`.trim()
    : `Vendedor #${v.id}`,
  sublabel: v.observaciones ?? undefined,
});

const PropietariosEditor = ({ propietarios, onChange }: Props) => {
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [selectorKey, setSelectorKey] = useState(0);

  // Carga los nombres de vendedores ya asignados (solo cuando el componente monta)
  useEffect(() => {
    const ids = Object.keys(propietarios);
    if (ids.length === 0) return;

    const token = localStorage.getItem('accessToken') ?? '';
    ids.forEach(id => {
      fetch(`/api/vendedores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(v => {
          if (!v) return;
          const nombre = v.usuario
            ? `${v.usuario.nombre ?? ''} ${v.usuario.apellidos ?? ''}`.trim()
            : `Propietario #${id}`;
          setNombres(prev => ({ ...prev, [id]: nombre }));
        })
        .catch(() => {});
    });
  }, []);

  const suma = Object.values(propietarios).reduce((a, b) => a + b, 0);

  return (
    <div>
      {Object.keys(propietarios).length === 0 ? (
        <div className="info-box" style={{ marginBottom: '1rem' }}>
          Sin propietarios asignados. Usa el buscador para añadir.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          {Object.entries(propietarios).map(([idStr, pct]) => {
            const nombre = nombres[idStr] ?? `Propietario #${idStr}`;
            return (
              <div key={idStr} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.65rem 0.9rem', borderRadius: '6px',
                backgroundColor: '#f1f7fd', border: '1px solid #b6d4fe',
              }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{nombre}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#495057' }}>%</span>
                  <input
                    type="number" min={0} max={100}
                    style={{ width: '70px', textAlign: 'right' }}
                    value={pct ?? ''}
                    onChange={e => onChange({ ...propietarios, [idStr]: Number(e.target.value) })}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...propietarios };
                      delete next[idStr];
                      onChange(next);
                    }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '1.1rem', flexShrink: 0 }}
                    title="Quitar propietario"
                  >✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        backgroundColor: '#e9ecef', padding: '0.65rem 1rem', borderRadius: '6px',
        display: 'flex', justifyContent: 'space-between', fontWeight: '600',
        marginBottom: '1rem', fontSize: '0.9rem',
      }}>
        <span>Total asignado:</span>
        <span style={{ color: suma === 100 ? '#198754' : '#dc3545' }}>{suma}% / 100%</span>
      </div>

      <SearchableEntitySelect
        key={selectorKey}
        label="Añadir propietario"
        placeholder="Buscar vendedor por nombre..."
        endpoint="/vendedores"
        mapOption={mapVendedorOption}
        value={null}
        onChange={(id, opt) => {
          if (!id || !opt) return;
          const idStr = String(id);
          if (idStr in propietarios) return;
          onChange({ ...propietarios, [idStr]: 0 });
          setNombres(prev => ({ ...prev, [idStr]: opt.label }));
          setSelectorKey(k => k + 1);
        }}
      />
    </div>
  );
};

export default PropietariosEditor;

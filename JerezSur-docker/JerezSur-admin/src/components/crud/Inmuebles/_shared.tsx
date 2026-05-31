// Fila de archivo con estado actual + opción de reemplazar
interface ArchivoFilaProps {
    label: string;
    urlActual?: string | null;
    archivoNuevo: File | null;
    inputRef: React.RefObject<HTMLInputElement | null>; editMode: boolean;
    accept: string;
    onChange: (f: File | null) => void;
}

export const ArchivoFila = ({ label, urlActual, archivoNuevo, inputRef, editMode, accept, onChange }: ArchivoFilaProps) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0', gap: '1rem' }}>
        <span style={{ fontWeight: '500', minWidth: '200px' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            {archivoNuevo ? (
                <span style={{ color: '#198754', fontSize: '0.9rem' }}>✅ {archivoNuevo.name}</span>
            ) : urlActual ? (
                <a href={urlActual} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem' }}>📥 Ver archivo actual</a>
            ) : (
                <span style={{ color: '#adb5bd', fontSize: '0.85rem' }}>Sin archivo</span>
            )}
            {editMode && (
                <>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => inputRef.current?.click()}>
                        {urlActual || archivoNuevo ? '🔄 Reemplazar' : '⬆️ Subir'}
                    </button>
                    {archivoNuevo && (
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange(null)}>✕</button>
                    )}
                    <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
                        onChange={e => onChange(e.target.files?.[0] || null)} />
                </>
            )}
        </div>
    </div>
);

// Uploader para el formulario de alta (siempre en modo edición)
interface ArchivoUploaderProps {
    label: string;
    accept: string;
    archivo?: File;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (f: File | undefined) => void;
}

export const ArchivoUploader = ({ label, accept, archivo, inputRef, onChange }: ArchivoUploaderProps) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0', gap: '1rem' }}>
        <span style={{ fontWeight: '500', minWidth: '200px' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            {archivo
                ? <span style={{ color: '#198754', fontSize: '0.9rem' }}>✅ {archivo.name}</span>
                : <span style={{ color: '#adb5bd', fontSize: '0.85rem' }}>Sin archivo</span>}
            <button type="button" className="btn btn-sm btn-outline" onClick={() => inputRef.current?.click()}>
                {archivo ? '🔄 Cambiar' : '⬆️ Subir'}
            </button>
            {archivo && <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange(undefined)}>✕</button>}
            <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
                onChange={e => onChange(e.target.files?.[0])} />
        </div>
    </div>
);

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="form-field">
        <label className="form-field__label">{label}</label>
        {children}
    </div>
);

export const Badge = ({ text, color }: { text: string; color: 'blue' | 'green' | 'amber' | 'gray' | 'red' }) => (
    <span className={`badge badge--${color}`}>{text}</span>
);
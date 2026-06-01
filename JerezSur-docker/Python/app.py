# Microservicio de estadísticas en Python/Flask
#
# Este servicio se encarga de generar los gráficos del dashboard de administración.
# Está separado del backend principal (Spring Boot) porque Java no tiene buenas
# librerías para gráficos científicos y Python sí: matplotlib y seaborn son el estándar.
#
# Cómo funciona:
#   1. El backend Spring Boot recoge los datos de la base de datos
#   2. Los envía a este servicio mediante una petición POST con un JSON
#   3. Python genera el gráfico con matplotlib y lo devuelve como imagen en base64
#   4. Spring Boot reenvía la imagen al frontend, que la muestra con <img src="data:image/png;base64,...">
#
# Corre en el puerto 5000 dentro de Docker (no expuesto al exterior, solo red interna).
# Nginx lo expone en /grafico/ para el panel de admin.

from flask import Flask, request, jsonify
import matplotlib
matplotlib.use('Agg')  # 'Agg' es el backend sin pantalla, obligatorio en servidor sin GUI
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np
import io, base64

app = Flask(__name__)

# ── Paleta de colores corporativa ────────────────────────────────────────────
# Los colores están sacados del manual de identidad visual de JerezSur:
# azul (#00439c) y verde (#4a9e2f) son los colores del logo
C = {
    'primary':  '#00439c',  # azul corporativo
    'green':    '#4a9e2f',  # verde corporativo
    'amber':    '#d97706',  # naranja/ámbar para advertencias
    'red':      '#c0392b',  # rojo para errores o urgencias
    'bg':       '#ffffff',
    'text':     '#1e293b',
    'soft':     '#64748b',
    'muted':    '#94a3b8',
    'border':   '#e2e8f0',
    'grid':     '#f1f5f9',
}

# Configuración global de matplotlib: afecta a todos los gráficos que generemos
# DejaVu Sans es la fuente que viene incluida con matplotlib (no hay que instalarla)
plt.rcParams.update({
    'font.family':       'DejaVu Sans',
    'font.size':         10,
    'figure.facecolor':  C['bg'],
    'axes.facecolor':    C['bg'],
    'axes.grid':         True,          # rejilla suave de fondo
    'grid.color':        C['grid'],
    'grid.linewidth':    0.7,
    'axes.spines.top':   False,         # quitamos el borde superior (más limpio)
    'axes.spines.right': False,         # y el derecho también
    'axes.edgecolor':    C['border'],
    'xtick.color':       C['soft'],
    'ytick.color':       C['soft'],
    'text.color':        C['text'],
})


def _b64(fig):
    """
    Convierte una figura de matplotlib a una cadena base64 para mandarla como JSON.

    El flujo es:
      1. Guardamos la figura en un buffer de memoria (BytesIO) en lugar de en disco
      2. Leemos los bytes del buffer y los codificamos en base64
      3. El resultado es un string que el frontend puede usar directamente:
         <img src="data:image/png;base64,AQUI_VA_EL_STRING">
      4. Cerramos la figura para liberar memoria (importante en un servidor)

    dpi=160 da buena resolución sin que el archivo sea demasiado grande.
    bbox_inches='tight' recorta los márgenes extra alrededor del gráfico.
    """
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=160, bbox_inches='tight',
                facecolor=C['bg'], edgecolor='none')
    buf.seek(0)  # volvemos al inicio del buffer para poder leerlo
    enc = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)  # liberamos la memoria de la figura
    return enc


# ═══════════════════════════════════════════════════════════════════════
# FUNCIONES GENERADORAS DE GRÁFICOS
# Separadas de las rutas Flask para poder llamarlas directamente desde /panel
# y así generar los 4 gráficos sin hacer peticiones HTTP anidadas
# ═══════════════════════════════════════════════════════════════════════

def _gen_kpis(d):
    kpis = [
        ('Inmuebles activos', d.get('inmuebles', 0),  d.get('tendencia_inmuebles', []),  C['primary'], '🏠'),
        ('Nuevos clientes',   d.get('clientes', 0),   d.get('tendencia_clientes', []),   C['green'],   '👥'),
        ('Citas próximas',    d.get('visitas', 0),    d.get('tendencia_visitas', []),    C['amber'],   '📅'),
        ('Contratos activos', d.get('contratos', 0),  d.get('tendencia_contratos', []), C['red'],     '📋'),
    ]

    fig, axes = plt.subplots(1, 4, figsize=(14, 3.4))
    fig.patch.set_facecolor(C['bg'])

    for ax, (label, valor, trend, color, icon) in zip(axes, kpis):
        ax.set_facecolor(C['bg'])
        ax.axis('off')

        # Card outline
        card = FancyBboxPatch((0.04, 0.06), 0.92, 0.88,
                              boxstyle='round,pad=0.02',
                              linewidth=1.1, edgecolor=C['border'],
                              facecolor='white', transform=ax.transAxes, zorder=0)
        ax.add_patch(card)
        # Accent bar at top
        acc = FancyBboxPatch((0.04, 0.88), 0.92, 0.055,
                             boxstyle='round,pad=0.01',
                             linewidth=0, facecolor=color,
                             transform=ax.transAxes, zorder=1)
        ax.add_patch(acc)

        ax.text(0.14, 0.72, icon, ha='center', va='center',
                fontsize=22, transform=ax.transAxes)
        ax.text(0.62, 0.72, str(valor), ha='center', va='center',
                fontsize=30, fontweight='bold', color=color,
                transform=ax.transAxes)
        ax.text(0.5, 0.40, label, ha='center', va='center',
                fontsize=9.5, color=C['soft'], transform=ax.transAxes)

        if len(trend) > 1:
            ins = ax.inset_axes([0.08, 0.10, 0.84, 0.22])
            xs = list(range(len(trend)))
            ins.plot(xs, trend, color=color, linewidth=2, solid_capstyle='round')
            ins.fill_between(xs, trend, alpha=0.12, color=color)
            ins.axis('off')

    plt.tight_layout(pad=0.5)
    return _b64(fig)


def _gen_barras(d):
    meses     = d.get('meses',      ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'])
    ventas    = d.get('ventas',     [3, 5, 4, 7, 6, 8])
    alquileres = d.get('alquileres', [2, 3, 5, 4, 6, 5])

    x = np.arange(len(meses))
    w = 0.38

    fig, ax = plt.subplots(figsize=(11, 4))

    b1 = ax.bar(x - w/2, ventas,     w, label='Ventas',
                color=C['primary'], alpha=0.88, linewidth=0, zorder=3)
    b2 = ax.bar(x + w/2, alquileres, w, label='Alquileres',
                color=C['green'],   alpha=0.88, linewidth=0, zorder=3)

    for bar in list(b1) + list(b2):
        h = bar.get_height()
        if h > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, h + 0.08,
                    str(int(h)), ha='center', va='bottom',
                    fontsize=8.5, fontweight='600', color=C['text'])

    ax.set_xticks(x)
    ax.set_xticklabels(meses, fontsize=10)
    ax.set_ylabel('Operaciones', fontsize=10, color=C['soft'])
    ax.yaxis.set_tick_params(labelsize=9)
    ax.spines['left'].set_visible(False)
    ax.tick_params(left=False)
    ax.set_axisbelow(True)
    ax.set_title('Operaciones por mes', fontsize=12, fontweight='bold',
                 color=C['text'], pad=12, loc='left')
    leg = ax.legend(frameon=True, framealpha=1, edgecolor=C['border'],
                    fontsize=9)
    leg.get_frame().set_linewidth(0.8)

    plt.tight_layout()
    return _b64(fig)


def _gen_dona(d):
    cats   = ['Interesados', 'Vendedores', 'Ambos', 'Sin perfil']
    vals   = [d.get('interesados', 0), d.get('vendedores', 0),
              d.get('ambos', 0),       d.get('sin_rol', 0)]
    colors = [C['primary'], C['green'], C['amber'], C['muted']]
    total  = sum(vals) or 1

    fig, ax = plt.subplots(figsize=(6, 5))

    # Filter out 0-value slices
    filtered = [(v, c, l) for v, c, l in zip(vals, colors, cats) if v > 0]
    if not filtered:
        filtered = [(1, C['muted'], 'Sin datos')]
    fv, fc, fl = zip(*filtered)

    wedges, _, autotexts = ax.pie(
        fv, colors=fc, autopct='%1.0f%%',
        pctdistance=0.82, startangle=90,
        wedgeprops=dict(width=0.52, edgecolor='white', linewidth=2.5),
    )
    for at in autotexts:
        at.set_fontsize(8.5)
        at.set_color('white')
        at.set_fontweight('bold')

    ax.text(0, 0.06, str(total), ha='center', va='center',
            fontsize=22, fontweight='bold', color=C['text'])
    ax.text(0, -0.24, 'clientes', ha='center', va='center',
            fontsize=9, color=C['soft'])

    patches = [mpatches.Patch(color=c, label=l)
               for c, l in zip(fc, fl)]
    ax.legend(handles=patches, loc='lower center',
              bbox_to_anchor=(0.5, -0.13), ncol=2, frameon=False, fontsize=9)
    ax.set_title('Distribución de clientes', fontsize=12, fontweight='bold',
                 color=C['text'], pad=6)

    plt.tight_layout()
    return _b64(fig)


def _gen_evolucion(d):
    meses    = d.get('meses',     ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'])
    registros = d.get('registros', [5, 9, 12, 8, 15, 20])

    fig, ax = plt.subplots(figsize=(11, 3.8))

    xs = list(range(len(meses)))
    ax.plot(xs, registros, color=C['primary'], linewidth=2.5,
            marker='o', markersize=7,
            markerfacecolor='white', markeredgewidth=2.5,
            markeredgecolor=C['primary'],
            solid_capstyle='round', zorder=4)
    ax.fill_between(xs, registros, alpha=0.08, color=C['primary'])

    if registros:
        mx_i = registros.index(max(registros))
        ax.annotate(f'Máx: {max(registros)}',
                    xy=(mx_i, max(registros)),
                    xytext=(mx_i + 0.3, max(registros) + max(1, max(registros)*0.08)),
                    fontsize=8.5, color=C['primary'], fontweight='bold',
                    arrowprops=dict(arrowstyle='->', color=C['primary'], lw=1.2))

    ax.set_xticks(xs)
    ax.set_xticklabels(meses, fontsize=10)
    ax.set_ylabel('Registros', fontsize=10, color=C['soft'])
    ax.yaxis.set_tick_params(labelsize=9)
    ax.spines['left'].set_visible(False)
    ax.tick_params(left=False)
    ax.set_axisbelow(True)
    ax.set_title('Evolución de registros', fontsize=12, fontweight='bold',
                 color=C['text'], pad=12, loc='left')

    plt.tight_layout()
    return _b64(fig)


# ═══════════════════════════════════════════════════════════════════════
# RUTAS FLASK
# ═══════════════════════════════════════════════════════════════════════

@app.route('/grafico/kpis', methods=['POST'])
def route_kpis():
    return jsonify({'imagen': _gen_kpis(request.json or {}), 'tipo': 'kpis'})

@app.route('/grafico/barras-mensuales', methods=['POST'])
def route_barras():
    return jsonify({'imagen': _gen_barras(request.json or {}), 'tipo': 'barras'})

@app.route('/grafico/distribucion-clientes', methods=['POST'])
def route_dona():
    return jsonify({'imagen': _gen_dona(request.json or {}), 'tipo': 'dona'})

@app.route('/grafico/evolucion', methods=['POST'])
def route_evolucion():
    return jsonify({'imagen': _gen_evolucion(request.json or {}), 'tipo': 'evolucion'})

@app.route('/grafico/panel', methods=['POST'])
def route_panel():
    """Devuelve los 4 gráficos de una sola llamada."""
    d = request.json or {}
    return jsonify({
        'kpis':      _gen_kpis(d),
        'barras':    _gen_barras(d),
        'dona':      _gen_dona(d),
        'evolucion': _gen_evolucion(d),
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

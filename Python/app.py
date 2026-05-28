from flask import Flask, request, jsonify
import matplotlib
matplotlib.use('Agg')  # Sin interfaz gráfica, obligatorio en servidor
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import numpy as np
import io
import base64

app = Flask(__name__)

# Paleta coherente con tu web
COLORES = {
    'azul':    '#185FA5',
    'verde':   '#3B6D11',
    'amber':   '#854F0B',
    'coral':   '#993C1D',
    'fondo':   '#ffffff',
    'texto':   '#2C2C2A',
    'grid':    '#e8e6df',
}

def figura_a_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                facecolor=COLORES['fondo'])
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_base64

# ── 1. KPI CARDS con minigráficos de tendencia ──────────────────────
@app.route('/grafico/kpis', methods=['POST'])
def grafico_kpis():
    datos = request.json
    # Espera: { "inmuebles": 42, "clientes": 18, "visitas": 7, "contratos": 3,
    #           "tendencia_inmuebles": [30,33,38,40,42],
    #           "tendencia_clientes":  [10,12,14,16,18] }

    kpis = [
        ('Inmuebles activos', datos.get('inmuebles', 0), datos.get('tendencia_inmuebles', []), COLORES['azul']),
        ('Clientes nuevos',   datos.get('clientes', 0),  datos.get('tendencia_clientes', []),  COLORES['verde']),
        ('Visitas',           datos.get('visitas', 0),   datos.get('tendencia_visitas', []),   COLORES['amber']),
        ('Contratos',         datos.get('contratos', 0), datos.get('tendencia_contratos', []), COLORES['coral']),
    ]

    fig, axes = plt.subplots(1, 4, figsize=(12, 2.8))
    fig.patch.set_facecolor(COLORES['fondo'])

    for ax, (label, valor, tendencia, color) in zip(axes, kpis):
        ax.set_facecolor(COLORES['fondo'])
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')

        # Número grande
        ax.text(0.5, 0.72, str(valor), ha='center', va='center',
                fontsize=32, fontweight='bold', color=color,
                transform=ax.transAxes)

        # Etiqueta
        ax.text(0.5, 0.45, label, ha='center', va='center',
                fontsize=10, color=COLORES['texto'],
                transform=ax.transAxes)

        # Minigráfico de tendencia si hay datos
        if tendencia and len(tendencia) > 1:
            inset = ax.inset_axes([0.1, 0.0, 0.8, 0.3])
            inset.plot(tendencia, color=color, linewidth=1.5, alpha=0.8)
            inset.fill_between(range(len(tendencia)), tendencia,
                               alpha=0.15, color=color)
            inset.axis('off')

        # Borde superior coloreado
        line = plt.Line2D([0.1, 0.9], [0.95, 0.95],
                  transform=ax.transAxes,
                  color=color, linewidth=3,
                  solid_capstyle='round')
        ax.add_line(line)

    plt.tight_layout(pad=1.0)
    return jsonify({'imagen': figura_a_base64(fig), 'tipo': 'kpis'})


# ── 2. BARRAS — inmuebles por tipo de operación por mes ─────────────
@app.route('/grafico/barras-mensuales', methods=['POST'])
def grafico_barras():
    datos = request.json
    # Espera: { "meses": ["Ene","Feb",...], "ventas": [3,5,...], "alquileres": [2,4,...] }

    meses     = datos.get('meses', ['Ene','Feb','Mar','Abr','May','Jun'])
    ventas    = datos.get('ventas',    [3, 5, 4, 7, 6, 8])
    alquileres = datos.get('alquileres', [2, 3, 5, 4, 6, 5])

    x = np.arange(len(meses))
    ancho = 0.35

    fig, ax = plt.subplots(figsize=(10, 4))
    fig.patch.set_facecolor(COLORES['fondo'])
    ax.set_facecolor(COLORES['fondo'])

    b1 = ax.bar(x - ancho/2, ventas,    ancho, label='Ventas',    color=COLORES['azul'],  alpha=0.85)
    b2 = ax.bar(x + ancho/2, alquileres, ancho, label='Alquileres', color=COLORES['verde'], alpha=0.85)

    # Valores encima de cada barra
    for bar in list(b1) + list(b2):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                str(int(height)), ha='center', va='bottom', fontsize=9,
                color=COLORES['texto'])

    ax.set_xticks(x)
    ax.set_xticklabels(meses, fontsize=10, color=COLORES['texto'])
    ax.set_ylabel('Operaciones', fontsize=10, color=COLORES['texto'])
    ax.tick_params(colors=COLORES['texto'])
    ax.yaxis.grid(True, color=COLORES['grid'], linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORES['grid'])
    ax.spines['bottom'].set_color(COLORES['grid'])
    ax.legend(framealpha=0, fontsize=10)

    plt.tight_layout()
    return jsonify({'imagen': figura_a_base64(fig), 'tipo': 'barras'})


# ── 3. DONA — distribución de clientes por rol ──────────────────────
@app.route('/grafico/distribucion-clientes', methods=['POST'])
def grafico_dona():
    datos = request.json
    # Espera: { "interesados": 45, "vendedores": 20, "ambos": 12, "sin_rol": 8 }

    categorias = ['Interesados', 'Vendedores', 'Ambos', 'Sin rol']
    valores    = [
        datos.get('interesados', 45),
        datos.get('vendedores', 20),
        datos.get('ambos', 12),
        datos.get('sin_rol', 8),
    ]
    colores = [COLORES['azul'], COLORES['verde'], COLORES['amber'], '#B4B2A9']

    fig, ax = plt.subplots(figsize=(6, 4))
    fig.patch.set_facecolor(COLORES['fondo'])
    ax.set_facecolor(COLORES['fondo'])

    wedges, texts, autotexts = ax.pie(
        valores,
        labels=None,
        colors=colores,
        autopct='%1.0f%%',
        pctdistance=0.75,
        startangle=90,
        wedgeprops=dict(width=0.5),  # esto lo convierte en dona
    )

    for at in autotexts:
        at.set_fontsize(9)
        at.set_color('white')
        at.set_fontweight('bold')

    # Leyenda a la derecha
    patches = [mpatches.Patch(color=c, label=l)
               for c, l in zip(colores, categorias)]
    ax.legend(handles=patches, loc='center left', bbox_to_anchor=(1, 0.5),
              framealpha=0, fontsize=10)

    ax.set_title('Distribución de clientes', fontsize=12,
                 color=COLORES['texto'], pad=12)

    plt.tight_layout()
    return jsonify({'imagen': figura_a_base64(fig), 'tipo': 'dona'})


# ── 4. LÍNEA — evolución de registros en el tiempo ──────────────────
@app.route('/grafico/evolucion', methods=['POST'])
def grafico_evolucion():
    datos = request.json
    # Espera: { "meses": [...], "registros": [...] }

    meses     = datos.get('meses', ['Ene','Feb','Mar','Abr','May','Jun'])
    registros = datos.get('registros', [5, 9, 12, 8, 15, 20])

    fig, ax = plt.subplots(figsize=(10, 3.5))
    fig.patch.set_facecolor(COLORES['fondo'])
    ax.set_facecolor(COLORES['fondo'])

    ax.plot(meses, registros, color=COLORES['azul'], linewidth=2.5,
            marker='o', markersize=6, markerfacecolor='white',
            markeredgewidth=2, markeredgecolor=COLORES['azul'])
    ax.fill_between(meses, registros, alpha=0.1, color=COLORES['azul'])

    ax.set_ylabel('Registros nuevos', fontsize=10, color=COLORES['texto'])
    ax.tick_params(colors=COLORES['texto'], labelsize=10)
    ax.yaxis.grid(True, color=COLORES['grid'], linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORES['grid'])
    ax.spines['bottom'].set_color(COLORES['grid'])

    plt.tight_layout()
    return jsonify({'imagen': figura_a_base64(fig), 'tipo': 'evolucion'})


if __name__ == '__main__':
    app.run(port=5000, debug=True)
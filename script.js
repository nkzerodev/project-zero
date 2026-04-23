// --- 1. CONFIGURACIÓN DE SUPABASE ---
// Sustituye estos valores con los de tu proyecto en Project Settings > API
const SUPABASE_URL = "https://rixlhagxpkvquccnnggg.supabase.co";
const SUPABASE_KEY = "sb_publishable_UAxtakd3FI6tN0zC9z2tDw_cMRE6o0G";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variable global para almacenar los juegos cargados
let juegosDB = [];

const grid = document.getElementById('games-grid');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('gameModal');

// --- 2. CARGAR DATOS DESDE SUPABASE ---
async function cargarJuegosDesdeBD() {
    try {
        const { data, error } = await _supabase
            .from('Games') // Asegúrate que el nombre en Supabase sea exactamente 'Games'
            .select('*');

        if (error) throw error;

        // Mapeamos los datos de la base de datos a nuestro formato de JavaScript
        juegosDB = data.map(j => {
            // Manejamos la info_tecnica (que es un JSON en Supabase)
            // Si Supabase devuelve un objeto lo usamos, si es string lo parseamos
            let info = j.info_tecnica;
            if (typeof info === 'string') {
                try { info = JSON.parse(info); } catch (e) { info = {}; }
            }

            return {
                id: j.id,
                titulo: j.name,         // Columna 'name' en tu tabla
                imagen: j.imagen_url,   // Columna 'imagen_url'
                descripcion: j.description,
                peso: info?.peso || "N/A",
                anio: info?.anio || "N/A",
                categoria: j.categoria,
                id_telegram: j.id_telegram
            };
        });

        // Primera renderización con los datos reales
        renderizarJuegos(juegosDB);

    } catch (error) {
        console.error("Error cargando la base de datos:", error.message);
    }
}

// --- 3. RENDERIZAR TARJETAS EN EL HTML ---
function renderizarJuegos(juegos) {
    grid.innerHTML = '';
    
    if (juegos.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">No se encontraron juegos.</p>';
        return;
    }

    juegos.forEach(juego => {
        const card = document.createElement('div');
        card.className = 'game-card glass-effect';
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${juego.imagen}" alt="${juego.titulo}">
            </div>
            <div class="card-info">
                <h3>${juego.titulo}</h3>
                <div class="tech-stats">
                    <span><i class="fa-regular fa-calendar"></i> ${juego.anio}</span>
                    <span><i class="fa-solid fa-hard-drive"></i> ${juego.peso}</span>
                </div>
                <div class="card-actions">
                    <button class="glass-btn" onclick="abrirModal(${juego.id})">
                        <i class="fa-solid fa-circle-info"></i> Detalles
                    </button>
                    <button class="glass-btn btn-share" title="Copiar enlace" onclick="compartirJuego(${juego.id})">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- 4. FUNCIONALIDAD DE BÚSQUEDA ---
searchInput.addEventListener('keyup', (e) => {
    const textoBusqueda = e.target.value.toLowerCase();
    const juegosFiltrados = juegosDB.filter(juego => 
        juego.titulo.toLowerCase().includes(textoBusqueda)
    );
    renderizarJuegos(juegosFiltrados);
});

// --- 5. VENTANA MODAL (DETALLES) ---
function abrirModal(id) {
    const juego = juegosDB.find(j => j.id === id);
    if (!juego) return;

    document.getElementById('modalImg').src = juego.imagen;
    document.getElementById('modalTitle').innerText = juego.titulo;
    document.getElementById('modalYear').innerHTML = `<i class="fa-regular fa-calendar"></i> ${juego.anio}`;
    document.getElementById('modalSize').innerHTML = `<i class="fa-solid fa-hard-drive"></i> ${juego.peso}`;
    document.getElementById('modalCategory').innerHTML = `<i class="fa-solid fa-gamepad"></i> ${juego.categoria}`;
    document.getElementById('modalDesc').innerText = juego.descripcion;
    
    // Configura el enlace a tu bot de Telegram
    // Cambia 'TuNombreDeBot' por el nombre real de tu bot
    document.getElementById('modalDownload').href = `https://t.me/TuNombreDeBot?start=${juego.id_telegram}`;

    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

// Cerrar modal al hacer clic fuera del contenido
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// --- 6. COMPARTIR JUEGO ---
function compartirJuego(id) {
    const link = `${window.location.origin}${window.location.pathname}?juego=${id}`;
    
    navigator.clipboard.writeText(link).then(() => {
        alert("¡Enlace del juego copiado al portapapeles!");
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

// --- INICIO DE LA APLICACIÓN ---
cargarJuegosDesdeBD();
const SUPABASE_URL = "https://rixlhagxpkvquccnnggg.supabase.co";
const SUPABASE_KEY = "sb_publishable_UAxtakd3FI6tN0zC9z2tDw_cMRE6o0G";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');

// 1. Función de Login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Error: " + error.message);
    } else {
        mostrarPanel();
    }
}

function mostrarPanel() {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
}

async function logout() {
    await _supabase.auth.signOut();
    location.reload();
}

// 2. Enviar Juego a Supabase
document.getElementById('game-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const info_tecnica = {
        anio: document.getElementById('anio').value,
        peso: document.getElementById('peso').value
    };

    const nuevoJuego = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        imagen_url: document.getElementById('imagen_url').value,
        id_telegram: document.getElementById('id_telegram').value,
        categoria: document.getElementById('categoria').value,
        info_tecnica: info_tecnica // Supabase lo guarda como JSON automáticamente
    };

    const { error } = await _supabase.from('Games').insert([nuevoJuego]);

    if (error) {
        alert("Error al subir: " + error.message);
    } else {
        alert("¡Juego subido con éxito a Project-Zero!");
        document.getElementById('game-form').reset();
    }
});
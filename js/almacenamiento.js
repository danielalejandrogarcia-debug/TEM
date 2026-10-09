/* ============================================================
   almacenamiento.js: guarda y lee datos en el navegador (localStorage)
   Hace de "base de datos" del proyecto. Los datos quedan solo en
   este navegador y este computador.
   ============================================================ */

const CLAVE_USUARIOS = 'tem_usuarios';
const CLAVE_SESION = 'tem_sesion';
const CLAVE_TEMA = 'tem_tema';
const PREFIJO_FIESTAS = 'tem_fiestas_';

function leerDatos(clave, valorPorDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : valorPorDefecto;
  } catch (error) {
    return valorPorDefecto;
  }
}

function guardarDatos(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    return false;
  }
}

function borrarDatos(clave) {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    /* sin almacenamiento disponible: no hay nada que borrar */
  }
}

/* ---------- Fiestas de cada usuario ---------- */
function leerFiestas(claveUsuario) {
  return leerDatos(PREFIJO_FIESTAS + claveUsuario, []);
}

function guardarFiestas(claveUsuario, fiestas) {
  return guardarDatos(PREFIJO_FIESTAS + claveUsuario, fiestas);
}

/* ---------- Tema claro u oscuro ---------- */
function leerTema() {
  return leerDatos(CLAVE_TEMA, 'oscuro');
}

function guardarTema(tema) {
  guardarDatos(CLAVE_TEMA, tema);
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
}

/* ============================================================
   autenticacion.js: crear cuenta, iniciar y cerrar sesión
   Es un login simple para fines académicos: las cuentas viven en
   localStorage y la contraseña se guarda como huella (hash), no en
   texto plano. No reemplaza a un sistema de seguridad real.
   Requiere almacenamiento.js cargado antes.
   ============================================================ */

/* Respaldo simple por si el navegador no ofrece crypto.subtle */
function huellaSimple(texto) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

async function crearHuella(texto) {
  if (window.crypto && window.crypto.subtle) {
    const datos = new TextEncoder().encode(texto);
    const buffer = await window.crypto.subtle.digest('SHA-256', datos);
    return Array.from(new Uint8Array(buffer)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }
  return 'simple-' + huellaSimple(texto);
}

function obtenerSesion() {
  const sesion = leerDatos(CLAVE_SESION, null);
  return sesion && sesion.clave ? sesion : null;
}

function establecerSesion(nombre, clave) {
  guardarDatos(CLAVE_SESION, { usuario: nombre, clave: clave });
}

function cerrarSesion() {
  borrarDatos(CLAVE_SESION);
}

async function crearCuenta(usuario, contrasena) {
  const nombre = usuario.trim();
  const clave = nombre.toLowerCase();
  const usuarios = leerDatos(CLAVE_USUARIOS, {});
  if (usuarios[clave]) {
    return { ok: false, mensaje: 'Ese usuario ya existe. Elige otro o inicia sesión.' };
  }
  usuarios[clave] = { nombre: nombre, huella: await crearHuella(clave + ':' + contrasena) };
  if (!guardarDatos(CLAVE_USUARIOS, usuarios)) {
    return { ok: false, mensaje: 'No se pudo guardar la cuenta. Revisa que el navegador permita guardar datos del sitio.' };
  }
  establecerSesion(nombre, clave);
  return { ok: true };
}

async function iniciarSesion(usuario, contrasena) {
  const clave = usuario.trim().toLowerCase();
  const usuarios = leerDatos(CLAVE_USUARIOS, {});
  const cuenta = usuarios[clave];
  const huella = await crearHuella(clave + ':' + contrasena);
  if (!cuenta || cuenta.huella !== huella) {
    return { ok: false, mensaje: 'Usuario o contraseña incorrectos. Revisa los datos o crea una cuenta.' };
  }
  establecerSesion(cuenta.nombre, clave);
  return { ok: true };
}

/* ============================================================
   calculo.js: lógica de negocio de TEM (sin nada de interfaz)
   Reglas del taller "Fiestas y Eventos Tarragona".
   Se puede probar por separado (ver carpeta pruebas/).
   ============================================================ */

const RANGOS_HORAS = ['1 a 3 h', '4 a 6 h', 'Más de 6 h'];

/* Valor que se cobra por cada invitado (aplica a todos los asistentes) */
function valorPorInvitado(invitados) {
  if (invitados <= 100) return 8000;
  if (invitados <= 500) return 6000;
  return 4000;
}

/* Cuota adicional según la duración de la fiesta */
function cuotaPorHoras(horas) {
  if (horas <= 3) return 100000;
  if (horas <= 6) return 200000;
  return 300000;
}

/* Rango de horas al que pertenece la fiesta */
function rangoDeHoras(horas) {
  if (horas <= 3) return RANGOS_HORAS[0];
  if (horas <= 6) return RANGOS_HORAS[1];
  return RANGOS_HORAS[2];
}

/* Monto = invitados x valor por invitado + cuota por horas */
function calcularMonto(invitados, horas) {
  return invitados * valorPorInvitado(invitados) + cuotaPorHoras(horas);
}

/* Desglose para mostrar el cobro paso a paso */
function desgloseCobro(invitados, horas) {
  const valor = valorPorInvitado(invitados);
  const subtotal = invitados * valor;
  const cuota = cuotaPorHoras(horas);
  return { valor, subtotal, cuota, rango: rangoDeHoras(horas), total: subtotal + cuota };
}

/* Consolidado del mes: totales y fiestas por rango de horas */
function calcularResumen(fiestas) {
  const porRango = { [RANGOS_HORAS[0]]: 0, [RANGOS_HORAS[1]]: 0, [RANGOS_HORAS[2]]: 0 };
  let invitados = 0;
  let horas = 0;
  let total = 0;
  fiestas.forEach(function (f) {
    invitados += f.invitados;
    horas += f.horas;
    total += calcularMonto(f.invitados, f.horas);
    porRango[rangoDeHoras(f.horas)] += 1;
  });
  return { fiestas: fiestas.length, invitados: invitados, horas: horas, total: total, porRango: porRango };
}

/* Formato de pesos colombianos: 1100000 -> $1.100.000 */
function formatearPesos(valor) {
  return '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ---------- Validaciones: devuelven el mensaje de error o '' si está bien ---------- */
function validarCedula(texto) {
  const t = String(texto).trim();
  return /^\d{6,10}$/.test(t) ? '' : 'Escribe la cédula solo con números, entre 6 y 10 dígitos.';
}

function validarInvitados(texto) {
  const t = String(texto).trim();
  if (!/^\d+$/.test(t) || Number(t) < 1) return 'Escribe la cantidad de invitados como número entero, mayor o igual a 1.';
  if (Number(t) > 100000) return 'La cantidad de invitados no puede superar 100.000.';
  return '';
}

function validarHoras(texto) {
  const t = String(texto).trim();
  if (!/^\d+$/.test(t) || Number(t) < 1 || Number(t) > 24) return 'Escribe las horas completas, de 1 a 24.';
  return '';
}

/* Permite usar este archivo en las pruebas con Node */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RANGOS_HORAS, valorPorInvitado, cuotaPorHoras, rangoDeHoras, calcularMonto, desgloseCobro,
    calcularResumen, formatearPesos, validarCedula, validarInvitados, validarHoras
  };
}

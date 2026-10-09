/* ============================================================
   login.js: pantalla de ingreso (index.html)
   Requiere almacenamiento.js y autenticacion.js cargados antes.
   ============================================================ */
(function () {
  aplicarTema(leerTema());

  /* Si ya hay una sesión abierta, pasa directo al panel */
  if (obtenerSesion()) {
    window.location.replace('panel.html');
    return;
  }

  const $ = function (id) { return document.getElementById(id); };
  const pestanas = document.querySelectorAll('[data-pestana]');
  const formularioIngreso = $('formulario-ingreso');
  const formularioCrear = $('formulario-crear');

  function ponerError(idError, idCampo, mensaje) {
    $(idError).textContent = mensaje;
    if (idCampo) $(idCampo).setAttribute('aria-invalid', mensaje ? 'true' : 'false');
  }

  function limpiarErrores() {
    ['error-ingreso', 'error-crear-usuario', 'error-crear-contrasena', 'error-crear-repetir'].forEach(function (id) {
      $(id).textContent = '';
    });
    document.querySelectorAll('input').forEach(function (i) { i.setAttribute('aria-invalid', 'false'); });
  }

  function mostrarPestana(nombre) {
    pestanas.forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.pestana === nombre));
    });
    formularioIngreso.hidden = nombre !== 'ingreso';
    formularioCrear.hidden = nombre !== 'crear';
    limpiarErrores();
    (nombre === 'ingreso' ? $('ingreso-usuario') : $('crear-usuario')).focus();
  }

  pestanas.forEach(function (b) {
    b.addEventListener('click', function () { mostrarPestana(b.dataset.pestana); });
  });

  /* Mostrar u ocultar la contraseña del formulario activo */
  document.querySelectorAll('[data-mostrar]').forEach(function (casilla) {
    casilla.addEventListener('change', function () {
      casilla.dataset.mostrar.split(',').forEach(function (id) {
        $(id).type = casilla.checked ? 'text' : 'password';
      });
    });
  });

  formularioIngreso.addEventListener('submit', async function (e) {
    e.preventDefault();
    limpiarErrores();
    const usuario = $('ingreso-usuario').value;
    const contrasena = $('ingreso-contrasena').value;
    if (!usuario.trim() || !contrasena) {
      ponerError('error-ingreso', null, 'Escribe tu usuario y tu contraseña.');
      return;
    }
    const resultado = await iniciarSesion(usuario, contrasena);
    if (!resultado.ok) {
      ponerError('error-ingreso', null, resultado.mensaje);
      return;
    }
    window.location.href = 'panel.html';
  });

  formularioCrear.addEventListener('submit', async function (e) {
    e.preventDefault();
    limpiarErrores();
    const usuario = $('crear-usuario').value.trim();
    const contrasena = $('crear-contrasena').value;
    const repetir = $('crear-repetir').value;
    let hayError = false;

    if (!/^[A-Za-z0-9_]{3,20}$/.test(usuario)) {
      ponerError('error-crear-usuario', 'crear-usuario', 'Usa de 3 a 20 caracteres: letras, números o guion bajo.');
      hayError = true;
    }
    if (contrasena.length < 4) {
      ponerError('error-crear-contrasena', 'crear-contrasena', 'La contraseña debe tener al menos 4 caracteres.');
      hayError = true;
    }
    if (repetir !== contrasena) {
      ponerError('error-crear-repetir', 'crear-repetir', 'Las contraseñas no coinciden.');
      hayError = true;
    }
    if (hayError) return;

    const resultado = await crearCuenta(usuario, contrasena);
    if (!resultado.ok) {
      ponerError('error-crear-usuario', 'crear-usuario', resultado.mensaje);
      return;
    }
    window.location.href = 'panel.html';
  });
})();

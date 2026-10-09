
(function () {
  aplicarTema(leerTema());

  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.replace('index.html');
    return;
  }

  const $ = function (id) { return document.getElementById(id); };
  let fiestas = leerFiestas(sesion.clave);
  let temporizadorAviso = null;

  /* ---------- Encabezado: usuario, tema y cierre de sesión ---------- */
  $('nombre-usuario').textContent = sesion.usuario;

  function actualizarTextoTema() {
    const esOscuro = document.documentElement.getAttribute('data-tema') !== 'claro';
    $('boton-tema').textContent = esOscuro ? 'Tema claro' : 'Tema oscuro';
  }
  actualizarTextoTema();

  $('boton-tema').addEventListener('click', function () {
    const nuevo = document.documentElement.getAttribute('data-tema') === 'claro' ? 'oscuro' : 'claro';
    aplicarTema(nuevo);
    guardarTema(nuevo);
    actualizarTextoTema();
  });

  $('boton-salir').addEventListener('click', function () {
    cerrarSesion();
    window.location.href = 'index.html';
  });

  /* ---------- Navegación entre pantallas ---------- */
  const VISTAS = { registrar: 'vista-registrar', fiestas: 'vista-fiestas', resumen: 'vista-resumen' };

  function mostrarVista(nombre) {
    if (!VISTAS[nombre]) nombre = 'registrar';
    Object.keys(VISTAS).forEach(function (clave) {
      $(VISTAS[clave]).hidden = clave !== nombre;
    });
    document.querySelectorAll('[data-vista]').forEach(function (boton) {
      if (boton.dataset.vista === nombre) {
        boton.setAttribute('aria-current', 'page');
      } else {
        boton.removeAttribute('aria-current');
      }
    });
    if (window.location.hash !== '#' + nombre) {
      history.replaceState(null, '', '#' + nombre);
    }
    if (nombre === 'fiestas') dibujarLista();
    if (nombre === 'resumen') dibujarResumen();
  }

  document.querySelectorAll('[data-vista]').forEach(function (boton) {
    boton.addEventListener('click', function () { mostrarVista(boton.dataset.vista); });
  });
  document.querySelectorAll('[data-ir]').forEach(function (boton) {
    boton.addEventListener('click', function () { mostrarVista(boton.dataset.ir); });
  });

  /* ---------- Pantalla 1: formulario y cobro en tiempo real ---------- */
  const campoCedula = $('campo-cedula');
  const campoInvitados = $('campo-invitados');
  const campoHoras = $('campo-horas');

  function ponerError(campo, mensaje) {
    $('error-' + campo.id.replace('campo-', '')).textContent = mensaje;
    campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
  }

  function dibujarCobro() {
    const textoInv = campoInvitados.value;
    const textoHor = campoHoras.value;
    const invitadosOk = textoInv.trim() !== '' && validarInvitados(textoInv) === '';
    const horasOk = textoHor.trim() !== '' && validarHoras(textoHor) === '';
    const n = Number(textoInv);
    const h = Number(textoHor);

    if (invitadosOk) {
      const valor = valorPorInvitado(n);
      $('cobro-valor').textContent = formatearPesos(valor);
      $('cobro-valor-detalle').textContent = n + (n === 1 ? ' invitado' : ' invitados');
      $('cobro-subtotal').textContent = formatearPesos(n * valor);
      $('cobro-subtotal-detalle').textContent = n + ' × ' + formatearPesos(valor);
    } else {
      $('cobro-valor').textContent = '—';
      $('cobro-valor-detalle').textContent = 'Escribe los invitados';
      $('cobro-subtotal').textContent = '—';
      $('cobro-subtotal-detalle').textContent = 'invitados × valor';
    }

    if (horasOk) {
      $('cobro-cuota').textContent = formatearPesos(cuotaPorHoras(h));
      $('cobro-cuota-detalle').textContent = h + (h === 1 ? ' hora' : ' horas') + ' · ' + rangoDeHoras(h);
    } else {
      $('cobro-cuota').textContent = '—';
      $('cobro-cuota-detalle').textContent = 'Escribe las horas';
    }

    $('cobro-total').textContent = invitadosOk && horasOk ? formatearPesos(calcularMonto(n, h)) : '$0';
  }

  campoInvitados.addEventListener('input', dibujarCobro);
  campoHoras.addEventListener('input', dibujarCobro);

  /* El mensaje de error desaparece apenas la persona corrige el campo */
  [campoCedula, campoInvitados, campoHoras].forEach(function (campo) {
    campo.addEventListener('input', function () { ponerError(campo, ''); });
  });

  function mostrarAviso(texto) {
    const aviso = $('aviso-registro');
    aviso.textContent = texto;
    aviso.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { aviso.hidden = true; }, 6000);
  }

  function limpiarFormulario() {
    $('formulario-fiesta').reset();
    [campoCedula, campoInvitados, campoHoras].forEach(function (c) { ponerError(c, ''); });
    dibujarCobro();
  }

  $('boton-limpiar').addEventListener('click', function () {
    limpiarFormulario();
    $('aviso-registro').hidden = true;
    campoCedula.focus();
  });

  $('formulario-fiesta').addEventListener('submit', function (e) {
    e.preventDefault();
    const errores = [
      [campoCedula, validarCedula(campoCedula.value)],
      [campoInvitados, validarInvitados(campoInvitados.value)],
      [campoHoras, validarHoras(campoHoras.value)]
    ];
    errores.forEach(function (par) { ponerError(par[0], par[1]); });
    const primero = errores.find(function (par) { return par[1] !== ''; });
    if (primero) {
      $('aviso-registro').hidden = true;
      primero[0].focus();
      return;
    }

    const fiesta = {
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      cedula: campoCedula.value.trim(),
      invitados: Number(campoInvitados.value),
      horas: Number(campoHoras.value),
      fecha: new Date().toISOString()
    };
    fiestas.push(fiesta);
    if (!guardarFiestas(sesion.clave, fiestas)) {
      mostrarAviso('La fiesta se agregó, pero el navegador no permitió guardarla para la próxima vez.');
    } else {
      mostrarAviso('Fiesta agregada. Total a cancelar: ' + formatearPesos(calcularMonto(fiesta.invitados, fiesta.horas)));
    }
    limpiarFormulario();
    campoCedula.focus();
  });

  /* ---------- Pantalla 2: fiestas del mes ---------- */
  function guardarCambios() {
    guardarFiestas(sesion.clave, fiestas);
    dibujarLista();
  }

  function crearCelda(texto, clase) {
    const td = document.createElement('td');
    td.textContent = texto;
    if (clase) td.className = clase;
    return td;
  }

  function dibujarLista() {
    const cuerpo = $('cuerpo-tabla');
    cuerpo.replaceChildren();
    fiestas.forEach(function (f) {
      const fila = document.createElement('tr');
      fila.appendChild(crearCelda(f.cedula));
      fila.appendChild(crearCelda(f.invitados));
      fila.appendChild(crearCelda(f.horas));

      const celdaRango = document.createElement('td');
      const etiqueta = document.createElement('span');
      etiqueta.className = 'etiqueta-rango';
      etiqueta.textContent = rangoDeHoras(f.horas);
      celdaRango.appendChild(etiqueta);
      fila.appendChild(celdaRango);

      fila.appendChild(crearCelda(formatearPesos(calcularMonto(f.invitados, f.horas)), 'monto'));

      const celdaAccion = document.createElement('td');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'boton boton-peligro boton-chico';
      boton.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#i-papelera"/></svg><span>Eliminar</span>';
      boton.setAttribute('aria-label', 'Eliminar la fiesta de la cédula ' + f.cedula);
      let esperando = null;
      boton.addEventListener('click', function () {
        if (esperando) {
          clearTimeout(esperando);
          fiestas = fiestas.filter(function (x) { return x.id !== f.id; });
          guardarCambios();
          return;
        }
        boton.querySelector('span').textContent = 'Confirmar';
        boton.classList.add('boton-peligro-activo');
        esperando = setTimeout(function () {
          esperando = null;
          boton.querySelector('span').textContent = 'Eliminar';
          boton.classList.remove('boton-peligro-activo');
        }, 3000);
      });
      celdaAccion.appendChild(boton);
      fila.appendChild(celdaAccion);
      cuerpo.appendChild(fila);
    });

    const cantidad = fiestas.length;
    $('contador-fiestas').textContent = cantidad + (cantidad === 1 ? ' fiesta registrada' : ' fiestas registradas');
    $('caja-tabla').hidden = cantidad === 0;
    $('lista-vacia').hidden = cantidad !== 0;
    $('boton-vaciar').hidden = cantidad === 0;
  }

  let esperandoVaciar = null;
  $('boton-vaciar').addEventListener('click', function () {
    const boton = $('boton-vaciar');
    if (esperandoVaciar) {
      clearTimeout(esperandoVaciar);
      esperandoVaciar = null;
      fiestas = [];
      boton.textContent = 'Vaciar lista';
      guardarCambios();
      return;
    }
    boton.textContent = 'Confirmar: se borrarán todas';
    esperandoVaciar = setTimeout(function () {
      esperandoVaciar = null;
      boton.textContent = 'Vaciar lista';
    }, 3000);
  });

  $('boton-ejemplos').addEventListener('click', function () {
    const ejemplos = [
      { cedula: '1144098765', invitados: 80, horas: 3 },
      { cedula: '31987654', invitados: 250, horas: 5 },
      { cedula: '66845210', invitados: 620, horas: 8 }
    ];
    ejemplos.forEach(function (e, i) {
      fiestas.push({ id: Date.now() + '-ej' + i, cedula: e.cedula, invitados: e.invitados, horas: e.horas, fecha: new Date().toISOString() });
    });
    guardarCambios();
  });

  /* ---------- Pantalla 3: resumen del mes ---------- */
  function textoLectura(resumen) {
    if (resumen.fiestas === 0) {
      return { titulo: 'Aún no hay fiestas este mes.', detalle: 'Cuando registres fiestas, aquí verás cómo se reparten por rango de horas.', ancho: [] };
    }
    const maximo = Math.max.apply(null, RANGOS_HORAS.map(function (r) { return resumen.porRango[r]; }));
    const lideres = RANGOS_HORAS.filter(function (r) { return resumen.porRango[r] === maximo; });
    const porcentaje = Math.round((maximo / resumen.fiestas) * 1000) / 10;
    const porcentajeTexto = String(porcentaje).replace('.', ',');
    let titulo;
    if (lideres.length === RANGOS_HORAS.length) {
      titulo = 'Los tres rangos tienen la misma cantidad de fiestas.';
    } else if (lideres.length === 1) {
      titulo = 'El rango de ' + lideres[0] + ' concentra la mayoría de las fiestas.';
    } else {
      titulo = 'Hay empate entre los rangos ' + lideres.join(' y ') + '.';
    }
    const detalle = lideres.length === RANGOS_HORAS.length
      ? 'Cada rango representa ' + maximo + ' de las ' + resumen.fiestas + ' fiestas registradas, equivalente al ' + porcentajeTexto + '%.'
      : 'Ese rango tiene ' + maximo + ' de las ' + resumen.fiestas + ' fiestas registradas, equivalente al ' + porcentajeTexto + '%.';
    return {
      titulo: titulo,
      detalle: detalle,
      ancho: RANGOS_HORAS.map(function (r) { return resumen.porRango[r] === maximo ? 1 : 0.35; })
    };
  }

  function dibujarResumen() {
    const resumen = calcularResumen(fiestas);
    $('cifra-fiestas').textContent = resumen.fiestas;
    $('cifra-invitados').textContent = resumen.invitados.toLocaleString('es-CO');
    $('cifra-horas').textContent = resumen.horas.toLocaleString('es-CO');
    $('cifra-total').textContent = formatearPesos(resumen.total);
    $('grafico-subtitulo').textContent = 'Distribución de ' + (resumen.fiestas === 1 ? 'la fiesta' : 'las ' + resumen.fiestas + ' fiestas') + ' del mes';

    const maximo = Math.max(1, Math.max.apply(null, RANGOS_HORAS.map(function (r) { return resumen.porRango[r]; })));
    const grafico = $('grafico-barras');
    grafico.replaceChildren();
    RANGOS_HORAS.forEach(function (rango) {
      const valor = resumen.porRango[rango];
      const columna = document.createElement('div');
      columna.className = 'columna-barra';
      const area = document.createElement('div');
      area.className = 'area-barra';
      const numero = document.createElement('span');
      numero.className = 'valor-barra';
      numero.textContent = valor;
      const barra = document.createElement('div');
      barra.className = 'barra';
      barra.style.height = (valor === 0 ? 4 : Math.max(12, Math.round((valor / maximo) * 170))) + 'px';
      const etiqueta = document.createElement('span');
      etiqueta.className = 'nombre-barra';
      etiqueta.textContent = rango;
      area.appendChild(numero);
      area.appendChild(barra);
      columna.appendChild(area);
      columna.appendChild(etiqueta);
      grafico.appendChild(columna);
    });
    grafico.setAttribute('aria-label', 'Fiestas por rango de horas: ' + RANGOS_HORAS.map(function (r) { return r + ' = ' + resumen.porRango[r]; }).join(', '));

    const lectura = textoLectura(resumen);
    $('lectura-titulo').textContent = lectura.titulo;
    $('lectura-detalle').textContent = lectura.detalle;
    document.querySelectorAll('#lectura-barras span').forEach(function (s, i) {
      s.style.opacity = lectura.ancho[i] === undefined ? 0.35 : lectura.ancho[i];
    });
  }

  /* ---------- Inicio ---------- */
  dibujarCobro();
  dibujarLista();
  dibujarResumen();
  mostrarVista(window.location.hash.replace('#', ''));
  window.addEventListener('hashchange', function () {
    mostrarVista(window.location.hash.replace('#', ''));
  });
})();

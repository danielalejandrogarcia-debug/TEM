# Tarragona Eventos Manager (TEM)

Aplicación web para registrar las fiestas de la compañía Tarragona, calcular el monto a cobrar por cada una y consultar el resumen del mes.

Proyecto de la asignatura **Diseño de Interfaces de Usuario** (Universidad del Valle).
Autor: Daniel Alejandro García Chamorro.

## Qué hace

- **Login simple:** crear cuenta e iniciar sesión con usuario y contraseña.
- **Registrar fiesta:** cédula, invitados y horas, con validación y cobro calculado mientras se escribe.
- **Fiestas del mes:** tabla con el rango de horas y el monto de cada fiesta, con opción de eliminar.
- **Resumen:** total de fiestas, invitados, horas y monto, más las fiestas por rango de horas.
- **Tema oscuro y claro**, diseño adaptable a celular.

### Reglas de cobro

| Invitados | Valor por invitado | Horas | Cuota adicional |
|---|---|---|---|
| 1 a 100 | $8.000 | 1 a 3 | $100.000 |
| 101 a 500 | $6.000 | 4 a 6 | $200.000 |
| Más de 500 | $4.000 | Más de 6 | $300.000 |

`Monto = invitados × valor por invitado + cuota por horas`

## Tecnologías

HTML, CSS y JavaScript (sin frameworks), `localStorage` como almacenamiento, Google Fonts, Git, GitHub y GitHub Pages.

## Estructura del proyecto

```
tarragona-eventos-manager/
├── index.html              Pantalla de ingreso (iniciar sesión / crear cuenta)
├── panel.html              Panel con las 3 pantallas
├── css/
│   ├── estilos.css         Variables de color, tipografía y componentes comunes
│   ├── login.css           Estilos del ingreso
│   └── panel.css           Estilos del panel
├── js/
│   ├── calculo.js          Reglas de cobro, validaciones y resumen (lógica pura)
│   ├── almacenamiento.js   Lectura y escritura en localStorage
│   ├── autenticacion.js    Crear cuenta, iniciar y cerrar sesión
│   ├── login.js            Comportamiento de index.html
│   └── panel.js            Comportamiento de panel.html
├── pruebas/
│   ├── casos.js            Casos de prueba (Tabla 2 del informe)
│   ├── pruebas.js          Pruebas con Node.js
│   └── pruebas.html        Las mismas pruebas, en el navegador
├── assets/
│   └── favicon.svg
└── .vscode/extensions.json Recomienda la extensión Live Server
```

## Cómo abrirlo en Visual Studio Code

1. Abre VS Code, elige **Archivo → Abrir carpeta** y selecciona `tarragona-eventos-manager`.
2. Instala la extensión **Live Server** (VS Code la sugiere al abrir la carpeta).
3. Clic derecho sobre `index.html` → **Open with Live Server**.

También funciona abriendo `index.html` con doble clic en el navegador.

## Cómo subirlo a GitHub

1. Crea una cuenta en <https://github.com> si no tienes.
2. Crea un repositorio nuevo, **público**, llamado `tarragona-eventos-manager` (sin README ni .gitignore, porque ya vienen en el proyecto).
3. Abre la terminal en la carpeta del proyecto (en VS Code: **Terminal → Nueva terminal**) y ejecuta, cambiando `TU-USUARIO`:

```bash
git init
git add .
git commit -m "Primera versión de Tarragona Eventos Manager"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tarragona-eventos-manager.git
git push -u origin main
```

Si no quieres usar la terminal, en la página del repositorio puedes elegir **Add file → Upload files** y arrastrar el contenido de la carpeta (que `index.html` quede en la raíz).



## Datos y límites conocidos

- Las cuentas y las fiestas se guardan en `localStorage`: solo existen en el navegador y el computador donde se crearon. Si se borran los datos del sitio, se pierden.
- El login es académico. La contraseña se guarda como huella (hash), pero no reemplaza un sistema de seguridad real con servidor.
- Cada usuario ve solo sus propias fiestas.
- Todas las fiestas registradas se consideran del mes en curso. Un cierre de mes queda como mejora futura.

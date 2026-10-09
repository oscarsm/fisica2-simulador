# Simulador interactivo de Física 2

Aplicación web educativa para explorar fenómenos eléctricos y magnéticos
mediante controles interactivos, fórmulas, visualizaciones en Canvas 2D y
animaciones en tiempo real.

La aplicación funciona como una SPA (Single Page Application): los módulos se
abren dentro de la misma página y la navegación se mantiene en un panel
lateral.

## Estado actual

### Unidades disponibles

- **Unidad 1 · Campo eléctrico**
  - Visualizador de cargas puntuales.
  - Calculadora de potencial eléctrico.
  - Simulador de trayectoria de una partícula cargada.
- **Unidad 2 · Capacitores**
  - Simulador de capacitores y dieléctricos.
  - Calculadora de energía almacenada.

Las cuatro unidades están habilitadas en el menú actual. Los módulos se
renderizan dinámicamente desde `js/ui/menu.js`.

## Funcionalidades principales

- Panel lateral tipo administrador.
- Navegación por unidades y módulos sin abandonar la página.
- Indicador visual del módulo activo.
- Tema claro y oscuro.
- Diseño responsive para escritorio, tabletas y móviles.
- Visualizaciones interactivas en Canvas 2D.
- Arrastre de cargas con mouse o pantalla táctil.
- Hasta 10 cargas en configuraciones predefinidas o manuales.
- Selector de planos `XY`, `XZ` y `YZ` para el potencial eléctrico.
- Trayectorias animadas de electrones, protones y cargas personalizadas.
- Simulación dinámica de capacitancia, carga y energía.
- Animaciones de corriente, campo magnético y fuerza de Lorentz.
- Fórmulas visibles junto a cada módulo.
- Botón **Ejecutar pruebas** en el panel lateral.
- Modal de validación con ejecución manual mediante **Iniciar prueba**.

## Fórmulas principales

El simulador utiliza, entre otras, las siguientes relaciones:

```text
E = k · |q| / r²
V = k · q / r
C = κ · ε₀ · A / d
Q = C · V
U = ½ · C · V²
R_total = R₁ + R₂
I = V / R
B = μ₀ · I / (2πr)
F = q · (E + v × B)
```

## Estructura del proyecto

```text
fisica/
├── index.html
├── pruebas.html
├── docs-inicio.png
├── docs-cargas.png
├── css/
│   └── estilos.css
└── js/
    ├── app.js
    ├── ui/
    │   └── menu.js
    ├── fisica/
    │   ├── calculos.js
    │   ├── constantes.js
    │   ├── vector.js
    │   ├── campoElectrico.js
    │   ├── potencial.js
    │   ├── trayectoria.js
    │   ├── capacitores.js
    │   └── energia.js
    └── tests/
        └── validacion.js
```

### Archivos principales

- `index.html`: entrada de la aplicación y estructura del panel.
- `css/estilos.css`: estilos globales, tema, responsive, modal y controles.
- `js/ui/menu.js`: configuración de unidades, navegación, renderizado, eventos,
  Canvas, animaciones y modal de pruebas.
- `js/fisica/calculos.js`: funciones puras reutilizables para capacitancia,
  energía.
- `js/tests/validacion.js`: pruebas básicas ejecutables en el navegador.
- `pruebas.html`: página independiente de validación.
- `js/app.js`: código legado de una versión anterior; la entrada actual carga
  `js/ui/menu.js`.

## Cómo ejecutar

### Opción 1: abrir directamente

Abre `index.html` en un navegador moderno.

### Opción 2: Live Server

1. Abre la carpeta del proyecto en VS Code.
2. Instala o utiliza la extensión Live Server.
3. Haz clic derecho sobre `index.html`.
4. Selecciona **Open with Live Server**.

Usar un servidor local es recomendable para evitar restricciones del navegador
al cargar módulos ES6 desde archivos locales.

## Cómo ejecutar las pruebas

### Desde el simulador

1. Abre `index.html`.
2. Haz clic en **Ejecutar pruebas** en el panel lateral.
3. Se abrirá el modal de validación.
4. Pulsa **Iniciar prueba**.
5. Revisa el resultado de cada algoritmo.

Las pruebas no se ejecutan automáticamente al abrir el modal.

### Desde la página independiente

Abre `pruebas.html`. Esta página valida:

- Capacitancia de aire.
- Energía almacenada.
- Corriente en resistencias en serie.
- Ley de Ohm.

El resultado esperado es:

```text
Todas las pruebas pasaron.
```

## Tecnologías

- HTML5.
- CSS3.
- JavaScript ES Modules.
- Canvas 2D.
- `requestAnimationFrame`.
- Pointer Events para interacción con mouse y táctil.
- Tabler Icons mediante CDN.
- Microsoft Word para generar el manual `.docx`.

El proyecto no utiliza backend ni proceso de compilación obligatorio. Los
cálculos principales se implementan con JavaScript nativo y funciones puras.

## Validaciones realizadas

- Sintaxis de los módulos JavaScript.
- Diagnósticos sin errores en los archivos principales.
- Pruebas numéricas de capacitancia, energía y corriente.
- Carga de la SPA en navegador.
- Apertura y cierre del modal de pruebas.
- Ejecución manual de las cuatro validaciones.
- Interacción con cargas y controles.
- Responsive en escritorio y móvil.


## Licencia y uso académico

Proyecto desarrollado con fines educativos para el curso de Física 2. Antes de
publicarlo fuera del entorno académico, se deben añadir los datos de autoría,
institución, licencia y las atribuciones correspondientes de recursos
externos.

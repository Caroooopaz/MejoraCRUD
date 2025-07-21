🚀 Aplicación de Gestión de Usuarios
Esta es una aplicación web sencilla para gestionar usuarios, con capacidades CRUD (Crear, Leer, Actualizar, Eliminar), integración con una API externa para auto-rellenar datos, filtrado, y mejoras estéticas. Utiliza json-server como backend de API REST simulado.

✨ Características
Gestión CRUD de Usuarios:

Crear: Agrega nuevos usuarios con nombre completo, email, teléfono y foto de perfil.

Leer: Visualiza todos los usuarios en tarjetas atractivas.

Actualizar: Edita la información de usuarios existentes a través de un modal.

Eliminar: Elimina usuarios con una confirmación modal.

Integración con RandomUser API: Auto-rellena el formulario con datos de usuarios generados aleatoriamente.

Filtrado de Usuarios: Busca usuarios por nombre o email en tiempo real.

Contador de Usuarios: Muestra el número total de usuarios listados.

Sistema de Favoritos:

Marca usuarios como favoritos con un botón de estrella.

Las tarjetas de usuarios favoritos tienen un estilo visual distintivo.

Un badge en la barra de navegación muestra el número de usuarios favoritos.

Notificaciones Toast: Mensajes informativos y de éxito/error que aparecen en la esquina superior derecha.

Mejoras Estéticas:

Diseño moderno con cards para cada usuario.

Sombras y bordes redondeados para un aspecto más pulcro.

Efectos visuales (hover) en las tarjetas para una mejor experiencia de usuario.

Tooltips informativos en los botones.

Backend Sencillo con json-server: Persistencia de datos local utilizando un archivo db.json.

🛠️ Tecnologías Utilizadas
HTML5: Estructura de la aplicación.

CSS3: Estilos personalizados.

Bootstrap 5.3: Framework CSS para el diseño responsivo y componentes UI.

JavaScript ES6+: Lógica de la aplicación.

Font Awesome: Iconos.

json-server: API REST simulada para persistencia de datos local.

RandomUser API: Para generar datos aleatorios de usuarios.

🚀 Cómo Empezar
Sigue estos pasos para poner en marcha la aplicación en tu entorno local.

Prerequisitos
Necesitarás tener Node.js instalado en tu sistema.

Instalación
Clona o descarga el repositorio:

Bash

git clone <URL_DEL_REPOSITORIO>
cd <nombre_de_tu_carpeta>
Instala json-server globalmente (si no lo tienes):

Bash

npm install -g json-server
Crea el archivo db.json:
En la raíz de tu proyecto, crea un archivo llamado db.json con el siguiente contenido inicial:

JSON

{
  "users": []
}
Este archivo contendrá los datos de tus usuarios.

Ejecución
Inicia json-server:
Abre tu terminal en la raíz del proyecto y ejecuta:

Bash

json-server --watch db.json --port 3000
Esto iniciará el servidor API en http://localhost:3000. Mantén esta terminal abierta.

Abre el archivo index.html:
Simplemente abre el archivo index.html en tu navegador web preferido (Chrome, Firefox, etc.). No necesitas un servidor web para la parte del frontend, ya que JavaScript se encargará de las peticiones a json-server.

Ahora deberías ver la aplicación cargada en tu navegador y podrás empezar a gestionar usuarios.

📂 Estructura del Proyecto
.
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── scripts.js
│       ├── filter.js
│       └── api.js
└── db.json
index.html: Estructura principal de la aplicación.

assets/css/style.css: Estilos personalizados de la aplicación.

assets/js/scripts.js: Lógica principal de la aplicación (CRUD, manejo de eventos, renderizado).

assets/js/filter.js: Lógica para el filtrado de usuarios.

assets/js/api.js: Funciones para interactuar con APIs externas (RandomUser API).

db.json: Base de datos simulada para json-server.
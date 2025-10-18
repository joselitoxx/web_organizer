# Mi Organizador Personal

Un proyecto web estático para organizar todos los aspectos de tu vida personal conectado a Google Sheets.

## 🎯 Características

- **Diseño Moderno**: Estética minimalista con colores pastel verde-azulado
- **Integración con Google Sheets**: Datos dinámicos mediante API OAuth 2.0
- **Responsive**: Adaptado para móviles, tablets y escritorio
- **6 Secciones Principales**:
  - 🍎 **Alimentación**: Plan semanal y lista de supermercado
  - 💪 **Gym**: Ejercicios caseros y de gimnasio
  - 🎓 **Magíster**: Seguimiento de clases académicas
  - 💼 **Trabajo**: Proyectos de optimizador y backend
  - 🏠 **Hogar**: Tareas domésticas organizadas
  - 🏃 **Ejercicios**: Base de datos de ejercicios

## 📂 Estructura del Proyecto

```
/mi-proyecto-organizador
│
├── index.html                # Página principal
│
├── /pages
│   ├── plan-alimentacion.html
│   ├── plan-gym.html
│   ├── magister.html
│   ├── trabajo.html
│   ├── hogar.html
│   └── app-ejercicios.html
│
├── /css
│   └── style.css             # Estilos principales
│
├── /js
│   ├── sheets.js             # Integración Google Sheets API
│   └── ui.js                 # Funciones de renderizado
│
├── /assets
│   └── (iconos e imágenes)
│
└── README.md                 # Este archivo
```

## 🚀 Configuración Inicial

### 1. Configurar Google Sheets API

Para conectar con Google Sheets, necesitas configurar las credenciales:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**
4. Crea credenciales (OAuth 2.0 Client ID)
5. Configura el dominio autorizado

### 2. Actualizar Configuración

Edita el archivo `js/sheets.js` y reemplaza:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    CLIENT_ID: 'TU_CLIENT_ID_AQUI',
    API_KEY: 'TU_API_KEY_AQUI',
    // ... resto de la configuración
};
```

### 3. Estructura de Google Sheets

Crea un Google Sheet con las siguientes pestañas:

#### Pestaña "Comidas" (A1:D8)
| Día | Desayuno | Almuerzo | Cena |
|-----|----------|----------|------|
| Lunes | Avena con frutas | Ensalada mixta | Pollo con verduras |
| ... | ... | ... | ... |

#### Pestaña "Supermercado" (A1:C20)
| Producto | Cantidad | Estado |
|----------|----------|--------|
| Manzanas | 2 kg | Pendiente |
| ... | ... | ... |

#### Pestaña "Caseros" (A1:E20)
| Ejercicio | Series | Repeticiones | Tiempo | Estado |
|-----------|--------|--------------|--------|--------|
| Flexiones | 3 | 15 | 5 min | Completado |
| ... | ... | ... | ... | ... |

#### Pestaña "Gimnasio" (A1:F25)
| Ejercicio | Grupo Muscular | Series | Repeticiones | Peso | Estado |
|-----------|----------------|--------|--------------|------|--------|
| Press banca | Pecho | 4 | 12 | 60 kg | Completado |
| ... | ... | ... | ... | ... | ... |

#### Pestaña "Clases" (A1:D50)
| Número | Tema | Fecha | Estado |
|--------|------|-------|--------|
| 1 | Introducción | 15/01/2024 | completado |
| ... | ... | ... | ... |

#### Pestaña "Trabajo" (A1:D50)
| Proyecto | Subtarea | Prioridad | Estado |
|----------|----------|-----------|--------|
| Optimizador de mezclas | Algoritmo base | Alta | completado |
| ... | ... | ... | ... |

#### Pestaña "Hogar" (A1:D30)
| Tarea | Habitación | Frecuencia | Estado |
|-------|------------|------------|--------|
| Hacer la cama | Dormitorio | Diaria | completado |
| ... | ... | ... | ... |

#### Pestaña "Ejercicios" (A1:F100)
| Ejercicio | Grupo Muscular | Nivel | Equipamiento | Descripción | Favorito |
|-----------|----------------|-------|--------------|-------------|----------|
| Push-ups | Pecho | Principiante | Sin equipo | Flexiones tradicionales | Sí |
| ... | ... | ... | ... | ... | ... |

## 🎨 Personalización de Estilos

El archivo `css/style.css` contiene todas las variables de color principales:

```css
/* Colores principales */
:root {
    --primary-color: #7fb3d3;      /* Azul-verde principal */
    --background-color: #d1e4e1;    /* Fondo pastel */
    --text-color: #2c3e50;         /* Texto oscuro */
    --white: #ffffff;               /* Fondo de tarjetas */
    --success: #28a745;             /* Verde de éxito */
    --warning: #fd7e14;             /* Naranja advertencia */
    --danger: #dc3545;              /* Rojo de error */
}
```

## 🔧 Funcionalidades Principales

### Renderizado Dinámico
- **`renderTable()`**: Crea tablas interactivas con datos
- **`renderChecklist()`**: Lista de tareas con checkboxes
- **`renderProgress()`**: Barras de progreso animadas

### Integración Google Sheets
- **`getSheetData()`**: Obtiene datos de una hoja específica
- **`updateSheetData()`**: Actualiza datos en Google Sheets
- **`appendSheetData()`**: Agrega nuevas filas

### Filtros y Búsqueda
- Filtros por estado, categoría, fecha
- Búsqueda en tiempo real
- Ordenamiento de columnas

## 🌐 Modo de Desarrollo

Si no tienes Google Sheets configurado, el proyecto funciona con datos de ejemplo (mock data) para que puedas probar todas las funcionalidades.

## 📱 Responsive Design

El proyecto está optimizado para:
- **Desktop**: Experiencia completa con todas las funcionalidades
- **Tablet**: Layout adaptado con navegación optimizada
- **Mobile**: Interfaz simplificada para uso en móviles

## 🚀 Despliegue

### Hosting Local
```bash
# Servidor Python simple
python -m http.server 8000

# O con Node.js
npx http-server
```

### Hosting Web
El proyecto es completamente estático y puede desplegarse en:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## 🔐 Seguridad

- Las credenciales de Google Sheets están en el cliente
- Usa HTTPS en producción
- Configura correctamente los dominios autorizados en Google Cloud Console

## 📈 Próximas Funcionalidades

- [ ] Notificaciones push
- [ ] Sincronización offline
- [ ] Exportación a PDF
- [ ] Temas personalizables
- [ ] Backup automático

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles específicos

---

**¡Disfruta organizando tu vida de manera más eficiente!** 🎉
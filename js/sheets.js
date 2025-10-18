// Google Sheets API integration with OAuth 2.0
// This file handles all communication with Google Sheets

// Configuration - Solo OAuth 2.0 necesario
const GOOGLE_SHEETS_CONFIG = {
    CLIENT_ID: "937193043607-jim1l9c9lnlkf1i7dmnpluasan17hpc0.apps.googleusercontent.com", // Tu Client ID de OAuth
    PROJECT_ID: "my-organizer-1",      // Tu Project ID
    DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
    // Agrega tu Sheet ID aquí cuando lo tengas
    SHEET_ID: '14PmXfPdQLGN2en01i9S36fQQGLxMgLpPvcpE34Qp6es'
};

// Export config globally
window.GOOGLE_SHEETS_CONFIG = GOOGLE_SHEETS_CONFIG;

// Global variables
let gapi;
let tokenClient;
let gapiInited = false;
let gisInited = false;
let isSignedIn = false;

/**
 * Load Google API script dynamically
 */
function loadGapiClient() {
    return new Promise((resolve, reject) => {
        if (window.gapi) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            gapi = window.gapi;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Initialize the Google Sheets API
 */
async function initializeGoogleSheetsAPI() {
    try {
        console.log('Initializing Google Sheets API...');
        
        // Load the Google APIs
        await loadGapiClient();
        
        // Initialize gapi
        await new Promise((resolve) => {
            gapi.load('client', resolve);
        });
        
        // Initialize the client
        await gapi.client.init({
              // Solo necesitamos OAuth 2.0 para leer y escribir
            discoveryDocs: [GOOGLE_SHEETS_CONFIG.DISCOVERY_DOC]
        });
        
        // Inicializar GIS
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_SHEETS_CONFIG.CLIENT_ID,
            scope: GOOGLE_SHEETS_CONFIG.SCOPES,
            callback: (tokenResponse) => {
                // Token recibido, guardar en localStorage con expiración (1 hora)
                isSignedIn = true;
                localStorage.setItem('google_token', tokenResponse.access_token);
                localStorage.setItem('google_token_exp', (Date.now() + 3600 * 1000).toString());
                gapi.client.setToken({access_token: tokenResponse.access_token});
                showMessage('Conectado a Google Sheets correctamente', 'success');
            }
        });
        gisInited = true;

        // Si hay token guardado, usarlo
        const savedToken = localStorage.getItem('google_token');
        if (savedToken) {
            gapi.client.setToken({access_token: savedToken});
            isSignedIn = true;
            showMessage('Sesión restaurada con Google Sheets', 'info');
        }

        gapiInited = true;
        console.log('Google Sheets API y GIS inicializados correctamente');
        return true;
    } catch (error) {
        console.error('Error inicializando Google Sheets API y GIS:', error);
        return false;
    }
}

/**
 * Sign in to Google account
 */
async function signInToGoogle() {
    try {
        if (!gapiInited || !gisInited) {
            await initializeGoogleSheetsAPI();
        }
        
        // Verifica si el token existe y no ha expirado
        const savedToken = localStorage.getItem('google_token');
        const exp = localStorage.getItem('google_token_exp');
        if (savedToken && exp && Date.now() < parseInt(exp)) {
            gapi.client.setToken({access_token: savedToken});
            isSignedIn = true;
            return true;
        }
        // Si no hay token válido, solicita login (sin prompt si posible)
        tokenClient.requestAccessToken({prompt: ''});
        
        return true;
    } catch (error) {
        console.error('Error signing in to Google:', error);
        showMessage('Error al conectar con Google Sheets', 'error');
        return false;
    }
}

/**
 * Sign out from Google account
 */
async function signOutFromGoogle() {
    try {
        // No se requiere acción para cerrar sesión en GIS
        isSignedIn = false;
        console.log('Successfully signed out from Google');
        showMessage('Desconectado de Google Sheets', 'success');
        
        return true;
    } catch (error) {
        console.error('Error signing out from Google:', error);
        return false;
    }
}

/**
 * Get data from a Google Sheet
 * @param {string} sheetId - The ID of the Google Sheet
 * @param {string} range - The range to fetch (e.g., 'Sheet1!A1:D10')
 * @returns {Promise<Array>} - Array of rows with cell values
 */
async function getSheetData(sheetId, range) {
    try {
        if (!isSignedIn) {
            await signInToGoogle();
        }
        
        // Make the API call
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range
        });
        
        const values = response.result.values || [];
        console.log(`Retrieved ${values.length} rows from ${range}`);
        
        return values;
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        
        // Return mock data if API fails (for development purposes)
        return getMockData(range);
    }
}

/**
 * Update data in a Google Sheet
 * @param {string} sheetId - The ID of the Google Sheet
 * @param {string} range - The range to update
 * @param {Array} values - 2D array of values to update
 * @returns {Promise<boolean>} - Success status
 */
async function updateSheetData(sheetId, range, values) {
    try {
        // Ensure we're signed in
        if (!isSignedIn) {
            const signedIn = await signInToGoogle();
            if (!signedIn) {
                throw new Error('Failed to sign in to Google Sheets');
            }
        }
        
        // Make the API call
        const response = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values
            }
        });
        
        console.log(`Updated ${response.result.updatedCells} cells in ${range}`);
        return true;
    } catch (error) {
        console.error('Error updating sheet data:', error);
        return false;
    }
}

/**
 * Append data to a Google Sheet
 * @param {string} sheetId - The ID of the Google Sheet
 * @param {string} range - The range to append to
 * @param {Array} values - 2D array of values to append
 * @returns {Promise<boolean>} - Success status
 */
async function appendSheetData(sheetId, range, values) {
    try {
        // Ensure we're signed in
        if (!isSignedIn) {
            const signedIn = await signInToGoogle();
            if (!signedIn) {
                throw new Error('Failed to sign in to Google Sheets');
            }
        }
        
        // Make the API call
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values
            }
        });
        
        console.log(`Appended ${values.length} rows to ${range}`);
        return true;
    } catch (error) {
        console.error('Error appending sheet data:', error);
        return false;
    }
}

/**
 * Get mock data for development purposes
 * @param {string} range - The range being requested
 * @returns {Array} - Mock data array
 */
function getMockData(range) {
    console.log('Using mock data for range:', range);
    
    // Mock data based on range patterns
    if (range.includes('Comidas')) {
        return [
            ['Día', 'Desayuno', 'Almuerzo', 'Cena'],
            ['Lunes', 'Avena con frutas', 'Ensalada mixta', 'Pollo con verduras'],
            ['Martes', 'Tostadas integrales', 'Sopa de lentejas', 'Salmón al horno'],
            ['Miércoles', 'Yogur con granola', 'Quinoa con vegetales', 'Pasta integral'],
            ['Jueves', 'Smoothie verde', 'Ensalada César', 'Pescado a la plancha'],
            ['Viernes', 'Huevos revueltos', 'Arroz con pollo', 'Verduras al vapor'],
            ['Sábado', 'Pancakes integrales', 'Pizza casera', 'Sopa de verduras'],
            ['Domingo', 'Fruta fresca', 'Parrillada', 'Ensalada ligera']
        ];
    }
    
    if (range.includes('Supermercado')) {
        return [
            ['Producto', 'Cantidad', 'Estado'],
            ['Manzanas', '2 kg', 'Pendiente'],
            ['Leche', '1 litro', 'Comprado'],
            ['Pan integral', '2 unidades', 'Pendiente'],
            ['Pollo', '1 kg', 'Pendiente'],
            ['Arroz', '500g', 'Comprado'],
            ['Tomates', '1 kg', 'Pendiente'],
            ['Yogur natural', '6 unidades', 'Comprado'],
            ['Aceite de oliva', '1 botella', 'Pendiente']
        ];
    }
    
    if (range.includes('Caseros')) {
        return [
            ['Ejercicio', 'Series', 'Repeticiones', 'Tiempo', 'Estado'],
            ['Flexiones', '3', '15', '5 min', 'Completado'],
            ['Sentadillas', '3', '20', '5 min', 'Pendiente'],
            ['Plancha', '3', '30 seg', '3 min', 'Completado'],
            ['Burpees', '2', '10', '4 min', 'Pendiente'],
            ['Abdominales', '3', '25', '6 min', 'Completado']
        ];
    }
    
    if (range.includes('Gimnasio')) {
        return [
            ['Ejercicio', 'Grupo Muscular', 'Series', 'Repeticiones', 'Peso', 'Estado'],
            ['Press banca', 'Pecho', '4', '12', '60 kg', 'Completado'],
            ['Peso muerto', 'Espalda', '4', '8', '80 kg', 'Pendiente'],
            ['Sentadilla', 'Piernas', '4', '15', '70 kg', 'Completado'],
            ['Press militar', 'Hombros', '3', '12', '40 kg', 'Pendiente'],
            ['Curl bíceps', 'Brazos', '3', '15', '15 kg', 'Completado']
        ];
    }
    
    if (range.includes('Clases')) {
        return [
            ['Número', 'Tema', 'Fecha', 'Estado'],
            ['1', 'Introducción a la investigación', '15/01/2024', 'completado'],
            ['2', 'Metodología cuantitativa', '22/01/2024', 'completado'],
            ['3', 'Metodología cualitativa', '29/01/2024', 'pendiente'],
            ['4', 'Análisis estadístico', '05/02/2024', 'pendiente'],
            ['5', 'Redacción académica', '12/02/2024', 'pendiente']
        ];
    }
    
    if (range.includes('Trabajo')) {
        return [
            ['Proyecto', 'Subtarea', 'Prioridad', 'Estado'],
            ['Optimizador de mezclas', 'Algoritmo base', 'Alta', 'completado'],
            ['Optimizador de mezclas', 'Interfaz usuario', 'Media', 'en progreso'],
            ['Optimizador de mezclas', 'Tests unitarios', 'Alta', 'pendiente'],
            ['Mapa y Backend', 'API REST', 'Alta', 'completado'],
            ['Mapa y Backend', 'Base de datos', 'Alta', 'en progreso'],
            ['Mapa y Backend', 'Frontend mapa', 'Media', 'pendiente']
        ];
    }
    
    if (range.includes('Hogar')) {
        return [
            ['Tarea', 'Habitación', 'Frecuencia', 'Estado'],
            ['Hacer la cama', 'Dormitorio', 'Diaria', 'completado'],
            ['Lavar platos', 'Cocina', 'Diaria', 'pendiente'],
            ['Aspirar', 'Sala', 'Semanal', 'pendiente'],
            ['Limpiar baño', 'Baño', 'Semanal', 'completado'],
            ['Lavar ropa', 'Lavandería', 'Semanal', 'pendiente'],
            ['Regar plantas', 'Balcón', 'Diaria', 'completado']
        ];
    }
    
    if (range.includes('Ejercicios')) {
        return [
            ['Ejercicio', 'Grupo Muscular', 'Nivel', 'Equipamiento', 'Descripción', 'Favorito'],
            ['Push-ups', 'Pecho', 'Principiante', 'Sin equipo', 'Flexiones tradicionales', 'Sí'],
            ['Pull-ups', 'Espalda', 'Intermedio', 'Barra', 'Dominadas en barra fija', 'No'],
            ['Squats', 'Piernas', 'Principiante', 'Sin equipo', 'Sentadillas básicas', 'Sí'],
            ['Deadlift', 'Espalda', 'Avanzado', 'Barra', 'Peso muerto con barra', 'No'],
            ['Plank', 'Core', 'Principiante', 'Sin equipo', 'Plancha abdominal', 'Sí'],
            ['Bicep Curls', 'Brazos', 'Principiante', 'Mancuernas', 'Curl de bíceps', 'No']
        ];
    }
    
    // Default mock data
    return [
        ['Columna 1', 'Columna 2', 'Columna 3'],
        ['Dato 1', 'Dato 2', 'Dato 3'],
        ['Dato 4', 'Dato 5', 'Dato 6']
    ];
}

/**
 * Check if user is signed in to Google Sheets
 * @returns {boolean} - Sign in status
 */
function isUserSignedIn() {
    return isSignedIn;
}

/**
 * Get the current user's email
 * @returns {string} - User email or empty string
 */
function getCurrentUserEmail() {
    if (isSignedIn && authInstance) {
        const user = authInstance.currentUser.get();
        return user.getBasicProfile().getEmail();
    }
    return '';
}

/**
 * Show a message to the user
 * @param {string} message - The message to show
 * @param {string} type - Message type ('success', 'error', 'info')
 */
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // Add to page
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(messageEl, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sheets.js loaded - Google Sheets integration ready');
    
    // Try to initialize the API (will use mock data if fails)
    initializeGoogleSheetsAPI().catch(error => {
        console.log('Google Sheets API not available, using mock data');
    });
});

// Export functions for global access
window.getSheetData = getSheetData;
window.updateSheetData = updateSheetData;
window.appendSheetData = appendSheetData;
window.signInToGoogle = signInToGoogle;
window.signOutFromGoogle = signOutFromGoogle;
window.isUserSignedIn = isUserSignedIn;
window.getCurrentUserEmail = getCurrentUserEmail;

/**
 * Update a single cell in Google Sheets
 * @param {string} sheetId - The ID of the Google Sheet
 * @param {string} cellRange - The A1 notation of the cell (e.g., 'Supermercado!C2')
 * @param {string|number} value - The value to set
 * @returns {Promise<boolean>} - Success status
 */
async function updateSheetCell(sheetId, cellRange, value) {
    try {
        // Verificar que gapi esté disponible
        if (!window.gapi || !window.gapi.client) {
            console.error('gapi.client no disponible');
            return false;
        }
        
        // Verificar autenticación
        if (!isSignedIn) {
            const signedIn = await signInToGoogle();
            if (!signedIn) {
                throw new Error('Failed to sign in to Google Sheets');
            }
        }
        
        const response = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: cellRange,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[value]]
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error actualizando:', cellRange, error.message);
        return false;
    }
}

window.updateSheetCell = updateSheetCell;
/**
 * List available sheet/tab names in the Google Sheet
 * @param {string} sheetId - The ID of the Google Sheet
 * @returns {Promise<Array>} - Array of sheet/tab names
 */
async function listSheetTabs(sheetId) {
    try {
        if (!isSignedIn) {
            await signInToGoogle();
        }
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: sheetId
        });
        const sheets = response.result.sheets || [];
        const tabNames = sheets.map(s => s.properties.title);
        console.log('Sheet tabs:', tabNames);
        showMessage('Pestañas disponibles: ' + tabNames.join(', '), 'info');
        return tabNames;
    } catch (error) {
        console.error('Error listing sheet tabs:', error);
        showMessage('No se pudieron obtener las pestañas del Sheet', 'error');
        return [];
    }
}

window.listSheetTabs = listSheetTabs;
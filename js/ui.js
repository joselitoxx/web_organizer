// UI.js - Dynamic rendering functions for tables, checklists, and progress bars
// This file contains all the UI rendering logic for the web organizer

/**
 * Render a data table in the specified container
 * @param {Array} data - 2D array with headers in first row
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Rendering options
 */
function renderTable(data, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    // Clear container
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="message">No hay datos para mostrar</div>';
        return;
    }

    // Extract options
    const {
        headers = data[0],
        className = 'data-table',
        actionColumn = -1,
        actionCallback = null,
        showRowNumbers = false
    } = options;

    // Create table structure
    const table = document.createElement('table');
    table.className = className;

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    if (showRowNumbers) {
        const numberHeader = document.createElement('th');
        numberHeader.textContent = '#';
        headerRow.appendChild(numberHeader);
    }

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    if (actionColumn >= 0) {
        const actionHeader = document.createElement('th');
        actionHeader.textContent = 'Acción';
        headerRow.appendChild(actionHeader);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    const rows = data.slice(1); // Skip header row

    rows.forEach((rowData, index) => {
        const row = document.createElement('tr');

        if (showRowNumbers) {
            const numberCell = document.createElement('td');
            numberCell.textContent = index + 1;
            row.appendChild(numberCell);
        }

        rowData.forEach((cellData, cellIndex) => {
            const cell = document.createElement('td');
            cell.textContent = cellData || '';
            
            // Add special styling for status columns
            if (cellData) {
                const lowerCaseData = cellData.toString().toLowerCase();
                if (lowerCaseData === 'completado' || lowerCaseData === 'comprado') {
                    cell.style.color = '#28a745';
                    cell.style.fontWeight = 'bold';
                } else if (lowerCaseData === 'pendiente') {
                    cell.style.color = '#dc3545';
                    cell.style.fontWeight = 'bold';
                } else if (lowerCaseData === 'en progreso') {
                    cell.style.color = '#fd7e14';
                    cell.style.fontWeight = 'bold';
                }
            }
            
            row.appendChild(cell);
        });

        // Add action button if specified
        if (actionColumn >= 0 && actionCallback) {
            const actionCell = document.createElement('td');
            const actionButton = document.createElement('button');
            actionButton.textContent = getActionButtonText(rowData[actionColumn]);
            actionButton.className = 'btn btn-small';
            actionButton.onclick = () => actionCallback(index, rowData);
            actionCell.appendChild(actionButton);
            row.appendChild(actionCell);
        }

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    // Add slide-in animation
    table.classList.add('slide-in');
}

/**
 * Render a checklist in the specified container
 * @param {Array} data - 2D array with headers in first row
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Rendering options
 */
function renderChecklist(data, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    // Clear container
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="message">No hay elementos para mostrar</div>';
        return;
    }

    // Extract options
    const {
        headers = data[0],
        checkboxColumn = -1,
        showHeaders = true,
        asTable = false
    } = options;

    // Si se solicita modo tabla
    if (asTable) {
        renderChecklistAsTable(data, container, headers, checkboxColumn);
        return;
    }

    // Create checklist container (modo original)
    const checklist = document.createElement('div');
    checklist.className = 'checklist';

    // Show headers if requested
    if (showHeaders && headers) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'checklist-header';
        headerDiv.innerHTML = headers.map(h => `<strong>${h}</strong>`).join(' | ');
        checklist.appendChild(headerDiv);
    }

    // Create checklist items
    const items = data.slice(1); // Skip header row
    
    items.forEach((itemData, index) => {
        const item = document.createElement('div');
        item.className = 'checklist-item';

        // Determine if item is completed
        const isCompleted = checkboxColumn >= 0 && 
            (itemData[checkboxColumn]?.toString().toLowerCase() === 'completado' ||
             itemData[checkboxColumn]?.toString().toLowerCase() === 'comprado');

        if (isCompleted) {
            item.classList.add('completed');
        }

        // Add checkbox if specified
        if (checkboxColumn >= 0) {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox-${index}`;
            checkbox.checked = isCompleted;
            checkbox.addEventListener('change', () => {
                toggleChecklistItem(index, itemData, checkboxColumn);
                item.classList.toggle('completed');
            });
            
            const label = document.createElement('label');
            label.htmlFor = `checkbox-${index}`;
            
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            item.appendChild(checkboxWrapper);
        }

        // Add item content
        const content = document.createElement('div');
        content.className = 'checklist-content';
        
        // Producto (columna 0) - destacado
        if (itemData[0]) {
            const productName = document.createElement('div');
            productName.className = 'product-name';
            productName.textContent = itemData[0];
            content.appendChild(productName);
        }
        
        // Cantidad (columna 1)
        if (itemData[1]) {
            const quantity = document.createElement('div');
            quantity.className = 'product-quantity';
            quantity.innerHTML = `<span class="label">Cantidad:</span> ${itemData[1]}`;
            content.appendChild(quantity);
        }
        
        // Estado (columna 2) - ya está en el checkbox, pero podemos mostrar como badge
        if (itemData[2]) {
            const status = document.createElement('div');
            status.className = `product-status status-${itemData[2].toLowerCase()}`;
            status.textContent = itemData[2];
            content.appendChild(status);
        }
        
        // Categoría (columna 3) - opcional
        if (itemData[3]) {
            const category = document.createElement('div');
            category.className = 'product-category';
            category.innerHTML = `<span class="icon">🏷️</span> ${itemData[3]}`;
            content.appendChild(category);
        }
        
        // Fecha_ok (columna 4) - si existe
        if (itemData[4]) {
            const date = document.createElement('div');
            date.className = 'product-date';
            date.innerHTML = `<span class="icon">📅</span> ${itemData[4]}`;
            content.appendChild(date);
        }

        item.appendChild(content);
        checklist.appendChild(item);
    });

    container.appendChild(checklist);

    // Add slide-in animation
    checklist.classList.add('slide-in');
}

/**
 * Render checklist as a table
 * @param {Array} data - 2D array with headers in first row
 * @param {HTMLElement} container - Container element
 * @param {Array} headers - Headers array
 * @param {number} checkboxColumn - Column containing checkbox/status
 */
function renderChecklistAsTable(data, container, headers, checkboxColumn) {
    // Limpiar el contenedor antes de renderizar
    container.innerHTML = '';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'checklist-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Add checkbox column header
    const checkboxTh = document.createElement('th');
    checkboxTh.className = 'checkbox-column';
    checkboxTh.textContent = '✓';
    headerRow.appendChild(checkboxTh);
    
    // Add other headers (skip Estado column)
    headers.forEach((header, index) => {
        if (index !== checkboxColumn) {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        }
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    const items = data.slice(1); // Skip header row
    
    // Separar items en completados y pendientes
    const pendingItems = [];
    const completedItems = [];
    
    items.forEach((itemData, index) => {
        const isCompleted = checkboxColumn >= 0 && 
            (itemData[checkboxColumn]?.toString().toLowerCase() === 'completado' ||
             itemData[checkboxColumn]?.toString().toLowerCase() === 'comprado');
        
        if (isCompleted) {
            completedItems.push({ itemData, index });
        } else {
            pendingItems.push({ itemData, index });
        }
    });
    
    // Renderizar primero los pendientes, luego los completados
    const sortedItems = [...pendingItems, ...completedItems];
    
    sortedItems.forEach(({ itemData, index }) => {
        const row = document.createElement('tr');
        
        // Determine if item is completed
        const isCompleted = checkboxColumn >= 0 && 
            (itemData[checkboxColumn]?.toString().toLowerCase() === 'completado' ||
             itemData[checkboxColumn]?.toString().toLowerCase() === 'comprado');
        
        if (isCompleted) {
            row.classList.add('completed');
            row.style.textDecoration = 'line-through';
        }
        
        // Add checkbox cell
        const checkboxTd = document.createElement('td');
        checkboxTd.className = 'checkbox-cell';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', async () => {
            // Deshabilitar el checkbox mientras se actualiza
            checkbox.disabled = true;
            
            // Agregar clase de carga a la fila
            row.classList.add('updating');
            
            // Crear y mostrar spinner
            const spinner = document.createElement('div');
            spinner.className = 'table-spinner';
            spinner.innerHTML = '<div class="spinner-small"></div>';
            checkboxTd.appendChild(spinner);
            
            // Actualizar en Google Sheets
            await toggleChecklistItem(index, itemData, checkboxColumn);
            
            // Remover spinner
            spinner.remove();
            
            // Esperar un poco para que se complete la actualización
            setTimeout(() => {
                // Recargar solo si el contenedor aún existe
                if (container && container.parentElement) {
                    const newData = [data[0], ...items];
                    renderChecklistAsTable(newData, container, headers, checkboxColumn);
                }
            }, 300);
        });
        
        checkboxTd.appendChild(checkbox);
        row.appendChild(checkboxTd);
        
        // Add data cells - Solo Producto (col 0) y Cantidad (col 1)
        // Omitimos Estado (col 2), Categoría (col 3) y Fecha (col 4)
        const columnsToShow = [0, 1]; // Solo Producto y Cantidad
        
        columnsToShow.forEach((cellIndex) => {
            const cellData = itemData[cellIndex];
            const td = document.createElement('td');
            
            // Add data-label for mobile view
            if (headers[cellIndex]) {
                td.setAttribute('data-label', headers[cellIndex] + ':');
            }
            
            if (isCompleted) {
                td.style.textDecoration = 'line-through';
            }
            
            // Formateo especial para ciertas columnas
            if (cellIndex === 0) {
                // Producto - negrita
                td.className = 'product-name-cell';
                td.textContent = cellData || '';
            } else {
                td.textContent = cellData || '';
            }
            
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add slide-in animation
    table.classList.add('slide-in');
}

/**
 * Render a progress bar in the specified container
 * @param {Array} data - Array of progress data
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Rendering options
 */
function renderProgress(data, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    // Extract options
    const {
        title = 'Progreso',
        showPercentage = true,
        showStats = true,
        animated = true
    } = options;

    // Calculate progress
    const progress = calculateProgressFromData(data);

    // Clear container
    container.innerHTML = '';

    // Create progress container
    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress-section';

    // Add title
    if (title) {
        const titleDiv = document.createElement('h3');
        titleDiv.textContent = title;
        progressDiv.appendChild(titleDiv);
    }

    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = '0%';
    
    if (showPercentage) {
        progressBar.textContent = `${progress.percentage}%`;
    }

    progressContainer.appendChild(progressBar);
    progressDiv.appendChild(progressContainer);

    // Add statistics
    if (showStats) {
        const stats = document.createElement('div');
        stats.className = 'progress-stats';
        stats.innerHTML = `
            <span class="stat">✅ ${progress.completed} completadas</span>
            <span class="stat">⏳ ${progress.pending} pendientes</span>
            <span class="stat">📊 Total: ${progress.total}</span>
        `;
        progressDiv.appendChild(stats);
    }

    container.appendChild(progressDiv);

    // Animate progress bar
    if (animated) {
        setTimeout(() => {
            progressBar.style.width = `${progress.percentage}%`;
        }, 100);
    } else {
        progressBar.style.width = `${progress.percentage}%`;
    }

    // Add slide-in animation
    progressDiv.classList.add('slide-in');
}

/**
 * Calculate progress from data array
 * @param {Array} data - Data array to analyze
 * @returns {Object} - Progress statistics
 */
function calculateProgressFromData(data) {
    if (!data || data.length <= 1) {
        return { completed: 0, pending: 0, total: 0, percentage: 0 };
    }

    const items = data.slice(1); // Skip header
    let completed = 0;
    let pending = 0;

    items.forEach(item => {
        // Look for status in last column by default
        const status = item[item.length - 1]?.toString().toLowerCase();
        if (status === 'completado' || status === 'comprado' || status === 'hecho') {
            completed++;
        } else {
            pending++;
        }
    });

    const total = completed + pending;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, pending, total, percentage };
}

/**
 * Get appropriate action button text based on status
 * @param {string} status - Current status
 * @returns {string} - Button text
 */
function getActionButtonText(status) {
    if (!status) return 'Actualizar';
    
    const lowerStatus = status.toString().toLowerCase();
    
    if (lowerStatus === 'completado' || lowerStatus === 'comprado') {
        return '↺ Revertir';
    } else if (lowerStatus === 'pendiente') {
        return '✓ Completar';
    } else if (lowerStatus === 'en progreso') {
        return '✓ Finalizar';
    }
    
    return 'Cambiar';
}

/**
 * Toggle checklist item status
 * @param {number} index - Item index
 * @param {Array} itemData - Item data array
 * @param {number} statusColumn - Column containing status
 */
async function toggleChecklistItem(index, itemData, statusColumn) {
    const currentStatus = itemData[statusColumn]?.toString().toLowerCase();
    let newStatus;
    if (currentStatus === 'completado' || currentStatus === 'comprado') {
        newStatus = 'pendiente';
    } else {
        newStatus = 'completado';
    }
    
    console.log(`${itemData[0]}: ${currentStatus} → ${newStatus}`);
    itemData[statusColumn] = newStatus;

    // Actualiza el dato en Google Sheets
    let sheetName = window.currentChecklistSheetName || 'Supermercado';
    if (typeof window.getCurrentSheetName === 'function') {
        sheetName = window.getCurrentSheetName() || sheetName;
    }
    
    // Usar el índice original si está disponible, sino usar el índice actual
    const realIndex = itemData._originalIndex !== undefined ? itemData._originalIndex : index;
    const cellColumn = String.fromCharCode(65 + statusColumn); // 0->A, 1->B, etc.
    const cellRange = `${sheetName}!${cellColumn}${realIndex + 1}`; // +1 porque Google Sheets usa índices 1-based
    
    if (window.updateSheetCell) {
        // Preparar las promesas de actualización
        const updates = [];
        
        // Actualizar el estado
        updates.push(window.updateSheetCell(GOOGLE_SHEETS_CONFIG.SHEET_ID, cellRange, newStatus));
        
        // Si se completó, actualizar también la columna Fecha_ok (columna E = índice 4)
        if (newStatus === 'completado' || newStatus === 'comprado') {
            const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const fechaColumn = 'E'; // Columna de Fecha_ok
            const fechaRange = `${sheetName}!${fechaColumn}${realIndex + 1}`;
            
            updates.push(window.updateSheetCell(GOOGLE_SHEETS_CONFIG.SHEET_ID, fechaRange, fechaActual));
            itemData[4] = fechaActual; // Actualizar en el array local también
        } else {
            // Si se marca como pendiente, limpiar la fecha
            const fechaColumn = 'E';
            const fechaRange = `${sheetName}!${fechaColumn}${realIndex + 1}`;
            
            updates.push(window.updateSheetCell(GOOGLE_SHEETS_CONFIG.SHEET_ID, fechaRange, ''));
            itemData[4] = ''; // Limpiar en el array local también
        }
        
        // Ejecutar todas las actualizaciones en paralelo
        const results = await Promise.all(updates);
        
        // Verificar si todas fueron exitosas
        return results.every(result => result === true);
    } else {
        console.warn('updateSheetCell no está disponible');
        return false;
    }
}

/**
 * Create a loading spinner
 * @param {string} message - Loading message
 * @returns {HTMLElement} - Loading element
 */
function createLoadingSpinner(message = 'Cargando...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="spinner"></div>
        <span>${message}</span>
    `;
    return loadingDiv;
}

/**
 * Show loading state in container
 * @param {string} containerId - Container ID
 * @param {string} message - Loading message
 */
function showLoading(containerId, message = 'Cargando...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        container.appendChild(createLoadingSpinner(message));
    }
}

/**
 * Hide loading state and show error
 * @param {string} containerId - Container ID
 * @param {string} errorMessage - Error message
 */
function showError(containerId, errorMessage = 'Error al cargar los datos') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="message error">${errorMessage}</div>`;
    }
}

/**
 * Create a statistics card
 * @param {Object} options - Card options
 * @returns {HTMLElement} - Card element
 */
function createStatsCard(options = {}) {
    const {
        icon = '📊',
        title = 'Estadística',
        description = '',
        value = '0',
        onClick = null
    } = options;

    const card = document.createElement('div');
    card.className = 'summary-card';
    
    if (onClick) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', onClick);
    }

    card.innerHTML = `
        <div class="card-icon">${icon}</div>
        <div class="card-content">
            <h3 class="card-title">${title}</h3>
            <p class="card-description">${description}</p>
            <div class="card-stats">
                <span class="stat">${value}</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Update existing statistics cards
 * @param {Object} stats - Statistics object
 */
function updateStatsCards(stats) {
    Object.keys(stats).forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            element.textContent = stats[statId];
        }
    });
}

/**
 * Filter table rows based on column value
 * @param {string} tableId - Table container ID
 * @param {number} columnIndex - Column index to filter
 * @param {string} filterValue - Value to filter by
 */
function filterTableRows(tableId, columnIndex, filterValue) {
    const container = document.getElementById(tableId);
    const table = container?.querySelector('table');
    
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cell = row.cells[columnIndex];
        if (cell) {
            const cellValue = cell.textContent.toLowerCase();
            const shouldShow = filterValue === 'all' || 
                              cellValue.includes(filterValue.toLowerCase());
            row.style.display = shouldShow ? '' : 'none';
        }
    });
}

/**
 * Search in table content
 * @param {string} tableId - Table container ID
 * @param {string} searchTerm - Search term
 */
function searchInTable(tableId, searchTerm) {
    const container = document.getElementById(tableId);
    const table = container?.querySelector('table');
    
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        const shouldShow = !term || rowText.includes(term);
        row.style.display = shouldShow ? '' : 'none';
    });
}

/**
 * Sort table by column
 * @param {string} tableId - Table container ID
 * @param {number} columnIndex - Column index to sort by
 * @param {boolean} ascending - Sort order
 */
function sortTableByColumn(tableId, columnIndex, ascending = true) {
    const container = document.getElementById(tableId);
    const table = container?.querySelector('table tbody');
    
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex]?.textContent || '';
        const bValue = b.cells[columnIndex]?.textContent || '';
        
        if (ascending) {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });

    // Re-append sorted rows
    rows.forEach(row => table.appendChild(row));
}

/**
 * Export table data to CSV
 * @param {string} tableId - Table container ID
 * @param {string} filename - Export filename
 */
function exportTableToCSV(tableId, filename = 'data.csv') {
    const container = document.getElementById(tableId);
    const table = container?.querySelector('table');
    
    if (!table) {
        console.error('Table not found for export');
        return;
    }

    const rows = table.querySelectorAll('tr');
    const csvContent = Array.from(rows).map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => `"${cell.textContent}"`).join(',');
    }).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Make functions globally available
window.renderTable = renderTable;
window.renderChecklist = renderChecklist;
window.renderProgress = renderProgress;
window.showLoading = showLoading;
window.showError = showError;
window.createStatsCard = createStatsCard;
window.updateStatsCards = updateStatsCards;
window.filterTableRows = filterTableRows;
window.searchInTable = searchInTable;
window.sortTableByColumn = sortTableByColumn;
window.exportTableToCSV = exportTableToCSV;

console.log('UI.js loaded - Rendering functions available');
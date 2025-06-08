// ============================================
// DATOS SIMULADOS PARA LAS 4 MÁQUINAS
// ============================================
const machineData = {
    1: {
        name: 'MÁQUINA 1',
        rpm: 1250,
        uptime: '8.5h',
        remaining: '2.3h',
        downtime: '0.2h',
        status: 'Operando Normalmente',
        statusClass: 'status-running'
    },
    2: {
        name: 'MÁQUINA 2',
        rpm: 980,
        uptime: '6.2h',
        remaining: '3.8h',
        downtime: '1.1h',
        status: 'Mantenimiento Programado',
        statusClass: 'status-warning'
    },
    3: {
        name: 'MÁQUINA 3',
        rpm: 1450,
        uptime: '12.1h',
        remaining: '1.2h',
        downtime: '0.0h',
        status: 'Alto Rendimiento',
        statusClass: 'status-running'
    },
    4: {
        name: 'MÁQUINA 4',
        rpm: 0,
        uptime: '0.0h',
        remaining: '8.5h',
        downtime: '4.2h',
        status: 'Fuera de Servicio',
        statusClass: 'status-stopped'
    }
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentMachine = 1;
let productionChart;
let updateInterval;
let chartData = { // Objeto para almacenar los datos del gráfico
    labels: [],
    data: []
};
let ctx; // Variable global para el contexto del canvas

// ============================================
// CREACIÓN DE DATOS INICIALES
// ============================================
function createInitialChartData() {
    const now = new Date();

    // Generar datos simulados para las últimas 20 mediciones
    for (let i = 19; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5000); // Cada 5 segundos
        chartData.labels.unshift(time.toLocaleTimeString());
        const value = generateDataValue('rpm', currentMachine, 0);
        chartData.data.unshift(Math.max(0, value));
    }
}

// ============================================
// CREACIÓN DEL GRÁFICO
// ============================================
function createChart() {
    const canvas = document.getElementById('productionChart');

    if (!canvas) {
        console.error('No se encontró el elemento canvas para el gráfico');
        return;
    }

    ctx = canvas.getContext('2d'); // Inicializar el contexto del canvas

    productionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'RPM',
                data: chartData.data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            animation: { duration: 0 },
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ecf0f1'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ecf0f1'
                    }
                }
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        }
    });

    console.log('Gráfico inicializado correctamente');
}

// ============================================
// ACTUALIZACIÓN DE LOS DATOS DEL GRÁFICO
// ============================================
function updateChartData(option) {
    if (!productionChart) {
        console.error('El gráfico no está inicializado');
        return;
    }

    const now = new Date();
    const colors = getChartColors(option);

    // Verificar si la cola está llena y eliminar el valor más antiguo
    const maxLength = 20;
    if (chartData.labels.length >= maxLength) {
        chartData.labels.shift();
        chartData.data.shift();
    }

    const newTime = now.toLocaleTimeString();
    chartData.labels.push(newTime);

    const newValue = generateDataValue(option, currentMachine, 0);
    chartData.data.push(Math.max(0, newValue));

    // Actualizar los datos del gráfico en lugar de re-crearlo
    productionChart.data.labels = chartData.labels;
    productionChart.data.datasets[0].data = chartData.data;
    productionChart.update();

    console.log(`Datos del gráfico actualizados para opción: ${option}`);
}

// ============================================
// INICIALIZACIÓN DEL DASHBOARD
// ============================================
$(document).ready(function () {
    console.log('Inicializando Dashboard de Producción...');

    // Inicializar componentes
    createInitialChartData();
    createChart();
    updateDashboard();
    startRealTimeUpdates();

    // Configurar event listeners
    setupEventListeners();

    console.log('Dashboard inicializado correctamente');
});

// ============================================
// CONFIGURACIÓN DE EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Manejo de selección de máquina
    $('.machine-btn').click(function () {
        const selectedMachine = $(this).data('machine');
        selectMachine(selectedMachine);
    });

    // Manejo de opciones de gráfico
    $('.option-btn').click(function () {
        const selectedOption = $(this).data('option');
        selectChartOption(selectedOption);
    });
}

// ============================================
// SELECCIÓN DE MÁQUINA
// ============================================
function selectMachine(machineId) {
    // Actualizar botones
    $('.machine-btn').removeClass('active');
    $(`.machine-btn[data-machine="${machineId}"]`).addClass('active');

    // Actualizar máquina actual
    currentMachine = machineId;

    // Actualizar dashboard
    updateDashboard();

    console.log(`Máquina ${machineId} seleccionada`);
}

// ============================================
// SELECCIÓN DE OPCIÓN DE GRÁFICO
// ============================================
function selectChartOption(option) {
    // Actualizar botones
    $('.option-btn').removeClass('active');
    $(`.option-btn[data-option="${option}"]`).addClass('active');

    // Actualizar datos del gráfico
    updateChartData(option); // Actualizar los datos del gráfico
    //showChart(option);

    console.log(`Opción de gráfico "${option}" seleccionada`);
}

// ============================================
// ACTUALIZACIÓN DEL DASHBOARD
// ============================================
function updateDashboard() {
    const data = machineData[currentMachine];

    if (!data) {
        console.error(`No se encontraron datos para la máquina ${currentMachine}`);
        return;
    }

    // Actualizar información de la máquina
    $('#currentMachineName').text(data.name);
    $('#machineStatus').text(data.status);

    // Actualizar indicador de estado
    $('.machine-status .status-indicator')
        .removeClass('status-running status-warning status-stopped')
        .addClass(data.statusClass);

    // Actualizar métricas
    $('#rpmValue').text(data.rpm.toLocaleString());
    $('#uptimeValue').text(data.uptime);
    $('#remainingValue').text(data.remaining);
    $('#downtimeValue').text(data.downtime);

    // Actualizar gráfico con la opción activa
    const activeOption = $('.option-btn.active').data('option') || 'rpm';
    updateChartData(activeOption); // Actualizar los datos del gráfico
    //showChart(activeOption);

    console.log(`Dashboard actualizado para ${data.name}`);
}

// ============================================
// GENERACIÓN DE DATOS SIMULADOS
// ============================================
function generateDataValue(option, machineId, timeIndex) {
    const machineInfo = machineData[machineId];
    const baseValue = machineInfo.rpm;

    // Si la máquina está parada, algunos valores son 0
    if (machineInfo.statusClass === 'status-stopped' && (option === 'rpm' || option === 'production')) {
        return 0;
    }

    let value;
    const randomVariation = (Math.random() - 0.5) * 0.1; // ±10% de variación

    switch (option) {
        case 'rpm':
            value = baseValue + (Math.random() - 0.5) * 100;
            break;
        case 'temperature':
            value = 75 + (Math.random() - 0.5) * 20;
            break;
        case 'pressure':
            value = 45 + (Math.random() - 0.5) * 10;
            break;
        case 'efficiency':
            const baseEfficiency = machineInfo.statusClass === 'status-running' ? 85 :
                machineInfo.statusClass === 'status-warning' ? 60 : 0;
            value = baseEfficiency + (Math.random() - 0.5) * 15;
            break;
        case 'production':
            const baseProduction = baseValue > 0 ? 150 : 0;
            value = baseProduction + (Math.random() - 0.5) * 50;
            break;
        default:
            value = baseValue + (Math.random() - 0.5) * 100;
    }

    return value;
}

// ============================================
// CONFIGURACIÓN DE COLORES PARA EL GRÁFICO
// ============================================
function getChartColors(option) {
    const colorMap = {
        rpm: { border: '#3498db', background: 'rgba(52, 152, 219, 0.1)' },
        temperature: { border: '#e74c3c', background: 'rgba(231, 76, 60, 0.1)' },
        pressure: { border: '#f39c12', background: 'rgba(243, 156, 18, 0.1)' },
        efficiency: { border: '#27ae60', background: 'rgba(39, 174, 96, 0.1)' },
        production: { border: '#9b59b6', background: 'rgba(155, 89, 182, 0.1)' }
    };

    return colorMap[option] || colorMap.rpm;
}

// ============================================
// ETIQUETAS PARA EL GRÁFICO
// ============================================
function getChartLabel(option) {
    const labelMap = {
        rpm: 'RPM',
        temperature: 'Temperatura (°C)',
        pressure: 'Presión (Bar)',
        efficiency: 'Eficiencia (%)',
        production: 'Producción (Unidades/min)'
    };

    return labelMap[option] || 'RPM';
}

// ============================================
// ACTUALIZACIONES EN TIEMPO REAL
// ============================================
function startRealTimeUpdates() {
    // Actualizar datos cada 5 segundos
    updateInterval = setInterval(function () {
        updateRealTimeData();
    }, 5000);

    console.log('Actualizaciones en tiempo real iniciadas');
}

function stopRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('Actualizaciones en tiempo real detenidas');
    }
}

function updateRealTimeData() {
    // Simular cambios en los datos
    const data = machineData[currentMachine];

    if (!data) return;

    // Simular pequeñas variaciones en RPM
    if (data.rpm > 0) {
        const variation = (Math.random() - 0.5) * 50;
        const newRpm = Math.max(0, data.rpm + variation);
        data.rpm = Math.round(newRpm);
        $('#rpmValue').text(data.rpm.toLocaleString());
    }

    // Actualizar gráfico con nuevo punto de datos
    const activeOption = $('.option-btn.active').data('option') || 'rpm';
    updateChartData(activeOption);
    showChart(activeOption);

    console.log(`Datos actualizados para ${data.name}`);
}

// ============================================
// GESTIÓN DE ERRORES
// ============================================
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('Error en el dashboard:', {
        message: msg,
        source: url,
        line: lineNo,
        column: columnNo,
        error: error
    });
    return false;
};

// ============================================
// LIMPIEZA AL CERRAR LA PÁGINA
// ============================================
$(window).on('beforeunload', function () {
    stopRealTimeUpdates();

    if (productionChart) {
        productionChart.destroy();
    }
});
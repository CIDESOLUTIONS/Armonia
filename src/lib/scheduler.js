/**
 * Módulo de programación de tareas
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('./logging/server-logger');
const logger = new ServerLogger('Scheduler');

// Almacén de tareas programadas
const scheduledTasks = new Map();

/**
 * Programa una tarea para ejecución periódica
 * @param {string} taskId - Identificador único de la tarea
 * @param {Function} taskFn - Función a ejecutar
 * @param {number} intervalMs - Intervalo en milisegundos
 * @param {Object} options - Opciones adicionales
 * @returns {string} - ID de la tarea programada
 */
function scheduleTask(taskId, taskFn, intervalMs, options = {}) {
  try {
    // Cancelar tarea existente con el mismo ID si existe
    if (scheduledTasks.has(taskId)) {
      cancelTask(taskId);
    }
    
    const { immediate = false, maxExecutions = null } = options;
    let executionCount = 0;
    
    logger.info(`Programando tarea "${taskId}" cada ${intervalMs}ms`);
    
    // Ejecutar inmediatamente si se solicita
    if (immediate) {
      try {
        taskFn();
        executionCount++;
      } catch (error) {
        logger.error(`Error en ejecución inmediata de tarea "${taskId}": ${error.message}`);
      }
    }
    
    // Programar ejecuciones periódicas
    const intervalId = setInterval(() => {
      try {
        taskFn();
        executionCount++;
        
        // Verificar si se alcanzó el límite de ejecuciones
        if (maxExecutions !== null && executionCount >= maxExecutions) {
          cancelTask(taskId);
          logger.info(`Tarea "${taskId}" completada después de ${maxExecutions} ejecuciones`);
        }
      } catch (error) {
        logger.error(`Error en ejecución de tarea "${taskId}": ${error.message}`);
      }
    }, intervalMs);
    
    // Almacenar información de la tarea
    scheduledTasks.set(taskId, {
      id: taskId,
      intervalId,
      intervalMs,
      createdAt: new Date(),
      lastExecuted: immediate ? new Date() : null,
      executionCount,
      maxExecutions
    });
    
    return taskId;
  } catch (error) {
    logger.error(`Error al programar tarea "${taskId}": ${error.message}`);
    throw error;
  }
}

/**
 * Cancela una tarea programada
 * @param {string} taskId - Identificador de la tarea
 * @returns {boolean} - Éxito de la operación
 */
function cancelTask(taskId) {
  try {
    if (!scheduledTasks.has(taskId)) {
      logger.warn(`Intento de cancelar tarea inexistente: "${taskId}"`);
      return false;
    }
    
    const task = scheduledTasks.get(taskId);
    clearInterval(task.intervalId);
    scheduledTasks.delete(taskId);
    
    logger.info(`Tarea "${taskId}" cancelada`);
    return true;
  } catch (error) {
    logger.error(`Error al cancelar tarea "${taskId}": ${error.message}`);
    return false;
  }
}

/**
 * Obtiene información de una tarea programada
 * @param {string} taskId - Identificador de la tarea
 * @returns {Object|null} - Información de la tarea o null si no existe
 */
function getTaskInfo(taskId) {
  if (!scheduledTasks.has(taskId)) {
    return null;
  }
  
  const task = scheduledTasks.get(taskId);
  return {
    ...task,
    isActive: true
  };
}

/**
 * Obtiene lista de todas las tareas programadas
 * @returns {Array} - Lista de tareas
 */
function getAllTasks() {
  const tasks = [];
  scheduledTasks.forEach(task => {
    tasks.push({
      ...task,
      isActive: true
    });
  });
  
  return tasks;
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  scheduleTask,
  cancelTask,
  getTaskInfo,
  getAllTasks
};

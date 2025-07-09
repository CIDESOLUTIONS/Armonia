
import { ServerLogger } from './logging/server-logger'; // Asumiendo que existe

const logger = new ServerLogger('Scheduler');

interface ScheduledTask {
    id: string;
    intervalId: NodeJS.Timeout;
    intervalMs: number;
    createdAt: Date;
    lastExecuted: Date | null;
    executionCount: number;
    maxExecutions: number | null;
}

const scheduledTasks: Map<string, ScheduledTask> = new Map();

interface ScheduleOptions {
    immediate?: boolean;
    maxExecutions?: number | null;
}

export function scheduleTask(taskId: string, taskFn: () => void, intervalMs: number, options: ScheduleOptions = {}): string {
    if (scheduledTasks.has(taskId)) {
        cancelTask(taskId);
    }

    const { immediate = false, maxExecutions = null } = options;
    let executionCount = 0;

    logger.info(`Programando tarea "${taskId}" cada ${intervalMs}ms`);

    if (immediate) {
        try {
            taskFn();
            executionCount++;
        } catch (error: any) {
            logger.error(`Error en ejecución inmediata de tarea "${taskId}": ${error.message}`);
        }
    }

    const intervalId = setInterval(() => {
        try {
            taskFn();
            executionCount++;
            if (maxExecutions !== null && executionCount >= maxExecutions) {
                cancelTask(taskId);
                logger.info(`Tarea "${taskId}" completada después de ${maxExecutions} ejecuciones`);
            }
        } catch (error: any) {
            logger.error(`Error en ejecución de tarea "${taskId}": ${error.message}`);
        }
    }, intervalMs);

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
}

export function cancelTask(taskId: string): boolean {
    const task = scheduledTasks.get(taskId);
    if (!task) {
        logger.warn(`Intento de cancelar tarea inexistente: "${taskId}"`);
        return false;
    }

    clearInterval(task.intervalId);
    scheduledTasks.delete(taskId);
    logger.info(`Tarea "${taskId}" cancelada`);
    return true;
}

export function getTaskInfo(taskId: string): (ScheduledTask & { isActive: boolean }) | null {
    const task = scheduledTasks.get(taskId);
    return task ? { ...task, isActive: true } : null;
}

export function getAllTasks(): (ScheduledTask & { isActive: boolean })[] {
    return Array.from(scheduledTasks.values()).map(task => ({ ...task, isActive: true }));
}

// Clase de utilidad para el logging en el servidor

export class ServerLogger {
  static debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    console.log(`[INFO] ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  static apiRequest(method: string, url: string, body?: any) {
    this.debug(`API Request: ${method} ${url}`, body ? { body } : '');
  }

  static apiResponse(method: string, url: string, status: number, body?: any) {
    if (status >= 400) {
      this.error(`API Response: ${method} ${url} [${status}]`, body ? { body } : '');
    } else {
      this.debug(`API Response: ${method} ${url} [${status}]`, body ? { body } : '');
    }
  }

  static authAttempt(email: string, success: boolean) {
    if (success) {
      this.info(`Auth successful for: ${email}`);
    } else {
      this.warn(`Auth failed for: ${email}`);
    }
  }

  static dbQuery(query: string, params?: any) {
    if (process.env.NODE_ENV !== 'production') {
      this.debug(`DB Query: ${query}`, params ? { params } : '');
    }
  }

  static dbError(operation: string, error: any) {
    this.error(`DB Error during ${operation}:`, error);
  }

  // Registrar solicitudes HTTP
  static httpRequest(data: { method: string; url: string; ip: string }) {
    this.info(`HTTP ${data.method} ${data.url} from ${data.ip}`);
  }

  // Registrar eventos de seguridad
  static security(message: string, data?: any) {
    this.warn(`Security: ${message}`, data);
  }
}
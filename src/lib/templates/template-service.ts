
import { ServerLogger } from '../logging/server-logger'; // Asumiendo que existe

const logger = new ServerLogger('TemplateService');

interface Template {
  content: string;
  defaultVars: Record<string, any>;
}

class TemplateService {
  private templates: Map<string, Template> = new Map();
  private defaultVariables: Record<string, any> = {
    appName: 'Armonía',
    supportEmail: 'soporte@armonia.app',
    supportPhone: '+57 300 123 4567',
    websiteUrl: 'https://armonia.app'
  };

  constructor() {
    logger.info('TemplateService initialized');
  }

  public registerTemplate(name: string, content: string, defaultVars: Record<string, any> = {}): boolean {
    try {
      if (!name || !content) {
        throw new Error('Name and content are required');
      }
      this.templates.set(name, { content, defaultVars });
      logger.info(`Template registered: ${name}`);
      return true;
    } catch (error: any) {
      logger.error(`Error registering template: ${error.message}`, { error });
      return false;
    }
  }

  public getTemplate(name: string): Template | null {
    const template = this.templates.get(name);
    if (!template) {
      logger.warn(`Template not found: ${name}`);
      return null;
    }
    return template;
  }

  public renderTemplate(name: string, variables: Record<string, any> = {}): string | null {
    const template = this.getTemplate(name);
    if (!template) {
      return null;
    }

    const mergedVars = {
      ...this.defaultVariables,
      ...template.defaultVars,
      ...variables
    };

    let rendered = template.content;
    Object.entries(mergedVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{\s*${key}\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  }
  
  public getAllTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }
}

export const templateService = new TemplateService();

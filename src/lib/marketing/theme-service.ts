
import { PrismaClient } from '@prisma/client';
import { getPrisma } from '@/lib/prisma'; // Asumiendo que getPrisma devuelve una instancia de PrismaClient
import { ServerLogger } from '../logging/server-logger'; // Asumiendo que existe

const prisma: PrismaClient = getPrisma();
const logger = new ServerLogger('ThemeService');

// Interfaces y Tipos
interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
}

interface Theme {
    id: string;
    name: string;
    colors: ColorPalette;
    isDark: boolean;
    isCustom?: boolean;
    isCommunity?: boolean;
    accessibility?: boolean;
}

const PREDEFINED_THEMES: Record<string, Theme> = {
  light: {
    id: 'light',
    name: 'Claro',
    colors: {
      primary: '#3B82F6', secondary: '#10B981', accent: '#8B5CF6',
      background: '#FFFFFF', surface: '#F9FAFB', text: '#1F2937',
      textSecondary: '#6B7280', border: '#E5E7EB', error: '#EF4444',
      warning: '#F59E0B', success: '#10B981', info: '#3B82F6'
    },
    isDark: false
  },
  dark: {
    id: 'dark',
    name: 'Oscuro',
    colors: {
      primary: '#60A5FA', secondary: '#34D399', accent: '#A78BFA',
      background: '#111827', surface: '#1F2937', text: '#F9FAFB',
      textSecondary: '#D1D5DB', border: '#374151', error: '#F87171',
      warning: '#FBBF24', success: '#34D399', info: '#60A5FA'
    },
    isDark: true
  },
};

class ThemeService {
    private readonly defaultTheme: string = 'light';

    constructor() {
        logger.info('ThemeService initialized');
    }

    public getPredefinedThemes(): Record<string, Theme> {
        return PREDEFINED_THEMES;
    }

    public async getUserTheme(userId: number): Promise<Theme> {
        try {
            const userPreference = await prisma.userPreference.findFirst({
                where: { userId, key: 'theme' }
            });
            if (userPreference?.value && PREDEFINED_THEMES[userPreference.value]) {
                return PREDEFINED_THEMES[userPreference.value];
            }
        } catch (error: any) {
            logger.error(`Error getting user theme: ${error.message}`, { userId });
        }
        return PREDEFINED_THEMES[this.defaultTheme];
    }

    public async setUserTheme(userId: number, themeId: string): Promise<boolean> {
        try {
            if (!PREDEFINED_THEMES[themeId]) {
                throw new Error(`Theme ${themeId} not found`);
            }
            await prisma.userPreference.upsert({
                where: { userId_key: { userId, key: 'theme' } },
                update: { value: themeId },
                create: { userId, key: 'theme', value: themeId }
            });
            logger.info(`User theme set: ${userId} -> ${themeId}`);
            return true;
        } catch (error: any) {
            logger.error(`Error setting user theme: ${error.message}`, { userId, themeId });
            return false;
        }
    }
}

export const themeService = new ThemeService();

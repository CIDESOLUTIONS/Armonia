/**
 * Configuración de temas y personalización visual para el sistema de comunicaciones
 * 
 * Este archivo define los colores, estilos y configuraciones visuales para
 * los componentes del sistema de comunicaciones, permitiendo personalización
 * según la identidad corporativa del conjunto residencial.
 */

// Tipos de temas disponibles
export type ThemeMode = 'light' | 'dark';

// Tipos de idiomas soportados
export type Language = 'Español' | 'English';

// Interfaz para la configuración de colores
export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    main: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  notification: {
    info: string;
    success: string;
    warning: string;
    error: string;
  };
  border: string;
}

// Interfaz para la configuración del tema
export interface ThemeConfig {
  colors: {
    light: ColorConfig;
    dark: ColorConfig;
  };
  logo: {
    url: string;
    width: number;
    height: number;
  };
  borderRadius: string;
  fontFamily: string;
}

// Tema por defecto
const defaultTheme: ThemeConfig = {
  colors: {
    light: {
      primary: '#4f46e5', // Indigo 600
      secondary: '#6366f1', // Indigo 500
      accent: '#8b5cf6', // Violet 500
      background: {
        main: '#ffffff',
        secondary: '#f9fafb',
      },
      text: {
        primary: '#111827', // Gray 900
        secondary: '#4b5563', // Gray 600
        accent: '#4f46e5', // Indigo 600
      },
      notification: {
        info: '#3b82f6', // Blue 500
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        error: '#ef4444', // Red 500
      },
      border: '#e5e7eb', // Gray 200
    },
    dark: {
      primary: '#6366f1', // Indigo 500
      secondary: '#818cf8', // Indigo 400
      accent: '#a78bfa', // Violet 400
      background: {
        main: '#1f2937', // Gray 800
        secondary: '#111827', // Gray 900
      },
      text: {
        primary: '#f9fafb', // Gray 50
        secondary: '#d1d5db', // Gray 300
        accent: '#818cf8', // Indigo 400
      },
      notification: {
        info: '#60a5fa', // Blue 400
        success: '#34d399', // Emerald 400
        warning: '#fbbf24', // Amber 400
        error: '#f87171', // Red 400
      },
      border: '#374151', // Gray 700
    },
  },
  logo: {
    url: '/images/logo.svg',
    width: 40,
    height: 40,
  },
  borderRadius: '0.5rem',
  fontFamily: 'Inter, system-ui, sans-serif',
};

// Tema personalizado (se cargará desde la configuración del conjunto)
let customTheme: Partial<ThemeConfig> | null = null;

/**
 * Carga la configuración de tema personalizada desde la API
 */
export async function loadCustomTheme(): Promise<void> {
  try {
    // Variable response eliminada por lint
    if (response.ok) {
      const _data = await response.json();
      customTheme = data;
    }
  } catch (error) {
    console.error('Error al cargar tema personalizado:', error);
    customTheme = null;
  }
}

/**
 * Obtiene la configuración de tema actual, combinando el tema por defecto con personalizaciones
 */
export function getThemeConfig(): ThemeConfig {
  if (!customTheme) {
    return defaultTheme;
  }

  // Combinar tema por defecto con personalizaciones
  return {
    colors: {
      light: {
        ...defaultTheme.colors.light,
        ...(customTheme.colors?.light || {}),
      },
      dark: {
        ...defaultTheme.colors.dark,
        ...(customTheme.colors?.dark || {}),
      },
    },
    logo: customTheme.logo || defaultTheme.logo,
    borderRadius: customTheme.borderRadius || defaultTheme.borderRadius,
    fontFamily: customTheme.fontFamily || defaultTheme.fontFamily,
  };
}

/**
 * Obtiene la configuración de colores para el modo de tema especificado
 */
export function getColors(mode: ThemeMode = 'light'): ColorConfig {
  const theme = getThemeConfig();
  return theme.colors[mode];
}

/**
 * Obtiene el color de notificación según el tipo y modo de tema
 */
export function getNotificationColor(
  type: 'info' | 'success' | 'warning' | 'error',
  mode: ThemeMode = 'light'
): string {
  const colors = getColors(mode);
  return colors.notification[type];
}

/**
 * Obtiene la clase CSS para el color de fondo según el tipo de notificación
 */
export function getNotificationBackgroundClass(
  type: 'info' | 'success' | 'warning' | 'error'
): string {
  switch (type) {
    case 'info':
      return 'bg-blue-500 dark:bg-blue-600';
    case 'success':
      return 'bg-green-500 dark:bg-green-600';
    case 'warning':
      return 'bg-yellow-500 dark:bg-yellow-600';
    case 'error':
      return 'bg-red-500 dark:bg-red-600';
    default:
      return 'bg-gray-500 dark:bg-gray-600';
  }
}

/**
 * Obtiene la clase CSS para el color de texto según el tipo de notificación
 */
export function getNotificationTextClass(
  type: 'info' | 'success' | 'warning' | 'error'
): string {
  switch (type) {
    case 'info':
      return 'text-blue-700 dark:text-blue-300';
    case 'success':
      return 'text-green-700 dark:text-green-300';
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-300';
    case 'error':
      return 'text-red-700 dark:text-red-300';
    default:
      return 'text-gray-700 dark:text-gray-300';
  }
}

/**
 * Obtiene la clase CSS para el color de borde según el tipo de notificación
 */
export function getNotificationBorderClass(
  type: 'info' | 'success' | 'warning' | 'error'
): string {
  switch (type) {
    case 'info':
      return 'border-blue-300 dark:border-blue-700';
    case 'success':
      return 'border-green-300 dark:border-green-700';
    case 'warning':
      return 'border-yellow-300 dark:border-yellow-700';
    case 'error':
      return 'border-red-300 dark:border-red-700';
    default:
      return 'border-gray-300 dark:border-gray-700';
  }
}

/**
 * Traduce textos según el idioma seleccionado
 */
export function translate(key: string, language: Language = 'Español'): string {
  const translations: Record<string, Record<Language, string>> = {
    // Notificaciones
    'notifications': {
      'Español': 'Notificaciones',
      'English': 'Notifications',
    },
    'no_notifications': {
      'Español': 'No hay notificaciones',
      'English': 'No notifications',
    },
    'mark_as_read': {
      'Español': 'Marcar como leídas',
      'English': 'Mark as read',
    },
    'clear': {
      'Español': 'Limpiar',
      'English': 'Clear',
    },
    
    // Mensajes
    'messages': {
      'Español': 'Mensajes',
      'English': 'Messages',
    },
    'no_messages': {
      'Español': 'No hay mensajes',
      'English': 'No messages',
    },
    'view_conversation': {
      'Español': 'Ver conversación',
      'English': 'View conversation',
    },
    
    // Anuncios
    'announcements': {
      'Español': 'Tablón de Anuncios',
      'English': 'Announcement Board',
    },
    'announcements_description': {
      'Español': 'Comunicados oficiales e información importante de la administración',
      'English': 'Official communications and important information from management',
    },
    'all': {
      'Español': 'Todos',
      'English': 'All',
    },
    'unread': {
      'Español': 'No leídos',
      'English': 'Unread',
    },
    'important': {
      'Español': 'Importantes',
      'English': 'Important',
    },
    'no_announcements': {
      'Español': 'No hay anuncios',
      'English': 'No announcements',
    },
    'no_unread_announcements': {
      'Español': 'No hay anuncios sin leer',
      'English': 'No unread announcements',
    },
    'no_important_announcements': {
      'Español': 'No hay anuncios importantes',
      'English': 'No important announcements',
    },
    'confirm_reading': {
      'Español': 'Confirmar lectura',
      'English': 'Confirm reading',
    },
    'read': {
      'Español': 'Leído',
      'English': 'Read',
    },
    'confirmation_required': {
      'Español': 'Requiere confirmación',
      'English': 'Confirmation required',
    },
    'view_details': {
      'Español': 'Ver detalles',
      'English': 'View details',
    },
    'published_on': {
      'Español': 'Publicado el',
      'English': 'Published on',
    },
    'view_all': {
      'Español': 'Ver todos',
      'English': 'View all',
    },
    
    // Calendario
    'community_calendar': {
      'Español': 'Calendario Comunitario',
      'English': 'Community Calendar',
    },
    'calendar_description': {
      'Español': 'Eventos, reuniones y actividades de la comunidad',
      'English': 'Events, meetings and community activities',
    },
    'list_view': {
      'Español': 'Vista de lista',
      'English': 'List view',
    },
    'month_view': {
      'Español': 'Vista de mes',
      'English': 'Month view',
    },
    'create_event': {
      'Español': 'Crear Evento',
      'English': 'Create Event',
    },
    'previous': {
      'Español': 'Anterior',
      'English': 'Previous',
    },
    'next': {
      'Español': 'Siguiente',
      'English': 'Next',
    },
    'today': {
      'Español': 'Hoy',
      'English': 'Today',
    },
    'more': {
      'Español': 'más',
      'English': 'more',
    },
    'no_events': {
      'Español': 'No hay eventos programados',
      'English': 'No scheduled events',
    },
    'location': {
      'Español': 'Ubicación',
      'English': 'Location',
    },
    'attendees': {
      'Español': 'Asistentes',
      'English': 'Attendees',
    },
    'attending': {
      'Español': 'Asistiré',
      'English': 'Attending',
    },
    'not_attending': {
      'Español': 'No asistiré',
      'English': 'Not attending',
    },
    'maybe': {
      'Español': 'Tal vez',
      'English': 'Maybe',
    },
    'will_attend': {
      'Español': '¿Asistirás a este evento?',
      'English': 'Will you attend this event?',
    },
    'event_full': {
      'Español': 'Este evento está completo',
      'English': 'This event is full',
    },
    'close': {
      'Español': 'Cerrar',
      'English': 'Close',
    },
    'description': {
      'Español': 'Descripción',
      'English': 'Description',
    },
    'maximum_capacity': {
      'Español': 'Capacidad máxima',
      'English': 'Maximum capacity',
    },
  };

  return translations[key]?.[language] || key;
}

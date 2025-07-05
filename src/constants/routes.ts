// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  PORTAL_SELECTOR: '/portal-selector',
  LOGIN: '/login',
  RESIDENT_LOGIN: '/login?portal=resident',
  RECEPTION_LOGIN: '/login?portal=reception',
  ADMIN_LOGIN: '/login?portal=admin',
  // Portales principales
  ADMIN_DASHBOARD: '/(admin)',
  RESIDENT_DASHBOARD: '/(resident)/dashboard',
  RECEPTION_DASHBOARD: '/(reception)',
  
  // Portal de administración
  ADMIN_INVENTORY: '/(admin)/inventory',
  ADMIN_ASSEMBLIES: '/(admin)/assemblies',
  ADMIN_FINANCES: '/(admin)/finances',
  ADMIN_RESIDENTS: '/(admin)/residents',
  ADMIN_PQR: '/(admin)/pqr',
  ADMIN_SETTINGS: '/(admin)/settings',
  
  // Portal de residentes
  RESIDENT_PQR: '/(resident)/pqr',
  RESIDENT_ASSEMBLIES: '/(resident)/assemblies',
  RESIDENT_PAYMENTS: '/(resident)/payments',
  RESIDENT_RESERVATIONS: '/(resident)/reservations',
  RESIDENT_PROFILE: '/(resident)/profile',
  
  // Portal de recepción
  RECEPTION_VISITORS: '/(reception)/visitors',
  RECEPTION_PACKAGES: '/(reception)/packages',
  RECEPTION_INTERCOM: '/(reception)/intercom',
  RECEPTION_INCIDENTS: '/(reception)/incidents',
  FORGOT_PASSWORD: '/forgot-password',
  REGISTER_COMPLEX: '/register-complex',
} as const;
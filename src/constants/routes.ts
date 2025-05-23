// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  PORTAL_SELECTOR: '/portal-selector',
  LOGIN: '/login',
  RESIDENT_LOGIN: '/login?portal=resident',
  RECEPTION_LOGIN: '/login?portal=reception',
  ADMIN_LOGIN: '/login?portal=admin',
  DASHBOARD: '/dashboard',
  RESIDENT_DASHBOARD: '/resident/dashboard',
  RECEPTION_DASHBOARD: '/reception/dashboard',
  INVENTORY: '/dashboard/inventory',
  INVENTORY_PROPERTIES: '/dashboard/inventory/properties',
  INVENTORY_VEHICLES: '/dashboard/inventory/vehicles',
  INVENTORY_PETS: '/dashboard/inventory/pets',
  INVENTORY_SERVICES: '/dashboard/inventory/services',
  ASSEMBLIES: '/dashboard/assemblies',
  ASSEMBLIES_SCHEDULING: '/dashboard/assemblies/scheduling',
  ASSEMBLIES_ATTENDANCE: '/dashboard/assemblies/attendance',
  ASSEMBLIES_VOTING: '/dashboard/assemblies/voting',
  ASSEMBLIES_DOCUMENTS: '/dashboard/assemblies/documents',
  FINANCES: '/dashboard/finances',
  FINANCES_BUDGET: '/dashboard/finances/budget',
  FINANCES_PROJECTS: '/dashboard/finances/projects',
  FINANCES_REGULAR_FEES: '/dashboard/finances/regular-fees',
  FINANCES_EXTRA_FEES: '/dashboard/finances/extra-fees',
  SERVICES: '/dashboard/services',
  SERVICES_COMMON: '/dashboard/services/common',
  SERVICES_RESERVATIONS: '/dashboard/services/reservations',
  RESIDENTS: '/dashboard/residents',
  RESIDENTS_USERS: '/dashboard/residents/users',
  USERS: '/dashboard/users',
  PQR: '/dashboard/pqr',
  SETTINGS: '/dashboard/settings',
  SETTINGS_PAYMENTS: '/dashboard/settings/payments',
  SETTINGS_WHATSAPP: '/dashboard/settings/whatsapp',
  SETTINGS_CAMERAS: '/dashboard/settings/cameras',
  FORGOT_PASSWORD: '/forgot-password',
  REGISTER_COMPLEX: '/register-complex',
} as const;
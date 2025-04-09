import { PQR } from "./types";

// Datos mock para pruebas
export const mockPQRs: PQR[] = [
  {
    id: 1,
    title: "Filtración en el techo del apartamento",
    category: "maintenance",
    priority: "high",
    status: "open",
    createdAt: "2024-04-01",
    updatedAt: "2024-04-01",
    reporter: "Juan Pérez",
    property: "A-101",
    description: "Hay una filtración en el techo del baño principal que está causando humedad y manchas.",
    comments: [
      { id: 1, content: "Se programará visita técnica", createdAt: "2024-04-01", author: "Admin" }
    ],
    assignedTo: "Mantenimiento"
  },
  {
    id: 2,
    title: "Solicitud de permiso para renovación",
    category: "permits",
    priority: "medium",
    status: "inProcess",
    createdAt: "2024-03-25",
    updatedAt: "2024-03-28",
    reporter: "María Rodríguez",
    property: "A-102",
    description: "Necesito permiso para realizar una renovación en la cocina que incluye cambio de gabinetes y piso.",
    comments: [
      { id: 2, content: "Se revisará en la próxima reunión de consejo", createdAt: "2024-03-26", author: "Admin" },
      { id: 3, content: "El consejo aprobó la solicitud con condiciones", createdAt: "2024-03-28", author: "Admin" }
    ],
    assignedTo: "Consejo Administración"
  },
  {
    id: 3,
    title: "Ruido excesivo en horario nocturno",
    category: "complaint",
    priority: "high",
    status: "closed",
    createdAt: "2024-03-20",
    updatedAt: "2024-03-22",
    reporter: "Carlos López",
    property: "B-201",
    description: "El apartamento B-202 realiza fiestas con música alta después de las 10pm.",
    comments: [
      { id: 4, content: "Se notificará al propietario", createdAt: "2024-03-21", author: "Admin" },
      { id: 5, content: "Se habló con el residente y se comprometió a respetar el horario", createdAt: "2024-03-22", author: "Admin" }
    ],
    assignedTo: "Administrador"
  },
  {
    id: 4,
    title: "Solicitud de información sobre parqueaderos",
    category: "information",
    priority: "low",
    status: "open",
    createdAt: "2024-04-02",
    updatedAt: "2024-04-02",
    reporter: "Ana Martínez",
    property: "A-103",
    description: "Necesito información sobre la disponibilidad de parqueaderos para visitantes y el procedimiento para reservarlos.",
    comments: [],
    assignedTo: null
  },
  {
    id: 5,
    title: "Sugerencia para mejorar área común",
    category: "suggestion",
    priority: "medium",
    status: "open",
    createdAt: "2024-04-03",
    updatedAt: "2024-04-03",
    reporter: "Pedro Gómez",
    property: "B-301",
    description: "Sugiero instalar bebederos de agua en las zonas deportivas para mayor comodidad de los residentes.",
    comments: [],
    assignedTo: null
  }
];

// Usuarios para asignación
export const mockUsers = [
  { id: 1, name: "Administrador", role: "admin" },
  { id: 2, name: "Mantenimiento", role: "maintenance" },
  { id: 3, name: "Consejo Administración", role: "council" },
  { id: 4, name: "Seguridad", role: "security" },
  { id: 5, name: "Recepción", role: "reception" }
];
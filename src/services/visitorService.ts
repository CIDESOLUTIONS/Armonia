import { getPrisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Inicializar cliente Prisma
const prisma = getPrisma();

/**
 * Servicio para la gestión de visitantes
 */
export class VisitorService {
  /**
   * Obtiene todos los visitantes con paginación y filtros opcionales
   */
  async getAllVisitors(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      startDate,
      endDate
    } = params;

    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search } },
        { destination: { contains: search, mode: 'insensitive' } },
        { residentName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (startDate && endDate) {
      where.entryTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.entryTime = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.entryTime = {
        lte: new Date(endDate)
      };
    }
    
    // Ejecutar consulta con conteo total
    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { entryTime: 'desc' },
        include: {
          preRegister: true,
          accessPass: true,
          accessLogs: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      }),
      prisma.visitor.count({ where })
    ]);
    
    return {
      data: visitors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Obtiene un visitante por su ID
   */
  async getVisitorById(id: number) {
    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: {
        preRegister: true,
        accessPass: true,
        accessLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
    
    if (!visitor) {
      throw new Error('Visitante no encontrado');
    }
    
    return visitor;
  }
  
  /**
   * Crea un nuevo registro de visitante
   */
  async createVisitor(data: {
    name: string;
    documentType: string;
    documentNumber: string;
    destination: string;
    residentName?: string;
    plate?: string;
    photoUrl?: string;
    purpose?: string;
    company?: string;
    temperature?: number;
    belongings?: any;
    signature?: string;
    registeredBy: number;
    preRegisterId?: number;
    accessPassId?: number;
  }) {
    // Validar datos requeridos
    if (!data.name || !data.documentType || !data.documentNumber || !data.destination) {
      throw new Error('Faltan campos requeridos');
    }
    
    // Verificar si ya existe un visitante activo con el mismo documento
    const existingVisitor = await prisma.visitor.findFirst({
      where: {
        documentNumber: data.documentNumber,
        documentType: data.documentType,
        status: 'ACTIVE'
      }
    });
    
    if (existingVisitor) {
      throw new Error('Ya existe un visitante activo con este documento');
    }
    
    // Crear el visitante
    const visitor = await prisma.visitor.create({
      data: {
        name: data.name,
        documentType: data.documentType as any,
        documentNumber: data.documentNumber,
        destination: data.destination,
        residentName: data.residentName,
        entryTime: new Date(),
        plate: data.plate,
        photoUrl: data.photoUrl,
        status: 'ACTIVE',
        purpose: data.purpose,
        company: data.company,
        temperature: data.temperature,
        belongings: data.belongings,
        signature: data.signature,
        registeredBy: data.registeredBy,
        preRegisterId: data.preRegisterId,
        accessPassId: data.accessPassId
      }
    });
    
    // Crear registro en bitácora de accesos
    await prisma.accessLog.create({
      data: {
        action: 'ENTRY',
        location: 'Entrada principal',
        registeredBy: data.registeredBy,
        visitorId: visitor.id,
        accessPassId: data.accessPassId
      }
    });
    
    // Si hay un pase de acceso, actualizar su contador de uso
    if (data.accessPassId) {
      await prisma.accessPass.update({
        where: { id: data.accessPassId },
        data: {
          usageCount: { increment: 1 },
          status: 'USED'
        }
      });
    }
    
    return visitor;
  }
  
  /**
   * Registra la salida de un visitante
   */
  async registerExit(id: number, data: {
    notes?: string;
    registeredBy: number;
  }) {
    // Verificar que el visitante exista y esté activo
    const visitor = await prisma.visitor.findUnique({
      where: { id }
    });
    
    if (!visitor) {
      throw new Error('Visitante no encontrado');
    }
    
    if (visitor.status !== 'ACTIVE') {
      throw new Error('El visitante ya ha salido');
    }
    
    // Actualizar el visitante
    const updatedVisitor = await prisma.visitor.update({
      where: { id },
      data: {
        exitTime: new Date(),
        status: 'DEPARTED',
        notes: data.notes
      }
    });
    
    // Crear registro en bitácora de accesos
    await prisma.accessLog.create({
      data: {
        action: 'EXIT',
        location: 'Salida principal',
        notes: data.notes,
        registeredBy: data.registeredBy,
        visitorId: id
      }
    });
    
    return updatedVisitor;
  }
  
  /**
   * Actualiza la información de un visitante
   */
  async updateVisitor(id: number, data: {
    name?: string;
    destination?: string;
    residentName?: string;
    plate?: string;
    photoUrl?: string;
    purpose?: string;
    company?: string;
    belongings?: any;
    notes?: string;
  }) {
    // Verificar que el visitante exista
    const visitor = await prisma.visitor.findUnique({
      where: { id }
    });
    
    if (!visitor) {
      throw new Error('Visitante no encontrado');
    }
    
    // Actualizar el visitante
    const updatedVisitor = await prisma.visitor.update({
      where: { id },
      data
    });
    
    return updatedVisitor;
  }
  
  /**
   * Obtiene estadísticas de visitantes
   */
  async getVisitorStats(params: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = params;
    
    // Construir filtros de fecha
    const dateFilter: any = {};
    
    if (startDate && endDate) {
      dateFilter.entryTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.entryTime = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.entryTime = {
        lte: new Date(endDate)
      };
    }
    
    // Obtener estadísticas
    const [
      totalVisitors,
      activeVisitors,
      preRegisteredCount,
      todayCount
    ] = await Promise.all([
      prisma.visitor.count({ where: dateFilter }),
      prisma.visitor.count({ where: { ...dateFilter, status: 'ACTIVE' } }),
      prisma.preRegisteredVisitor.count({
        where: {
          status: 'ACTIVE',
          validUntil: { gte: new Date() }
        }
      }),
      prisma.visitor.count({
        where: {
          entryTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);
    
    return {
      totalVisitors,
      activeVisitors,
      preRegisteredCount,
      todayCount
    };
  }
}

// Exportar una instancia del servicio
export const visitorService = new VisitorService();

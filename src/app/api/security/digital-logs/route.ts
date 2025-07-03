// src/app/api/security/digital-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para creación de minutas digitales
const CreateDigitalLogSchema = z.object({
  // Información del turno
  shiftDate: z.string().datetime(),
  shiftStart: z.string().datetime(),
  shiftEnd: z.string().datetime().optional(),
  relievedBy: z.number().optional(),
  
  // Tipo y prioridad
  logType: z.enum(['GENERAL', 'INCIDENT', 'VISITOR', 'MAINTENANCE', 'PATROL', 'HANDOVER', 'EMERGENCY', 'SYSTEM_CHECK']).default('GENERAL'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).default('NORMAL'),
  
  // Contenido
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  location: z.string().max(100).optional(),
  
  // Personas y evidencias
  involvedPersons: z.array(z.object({
    name: z.string(),
    documentId: z.string().optional(),
    role: z.string().optional(),
    unit: z.string().optional()
  })).optional(),
  
  attachments: z.array(z.object({
    url: z.string(),
    type: z.string(),
    name: z.string()
  })).optional(),
  
  photos: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
    timestamp: z.string().datetime().optional()
  })).optional(),
  
  // Seguimiento
  requiresFollowUp: z.boolean().default(false),
  followUpDate: z.string().datetime().optional(),
  
  // Clasificación
  category: z.enum(['ACCESS_CONTROL', 'VISITOR_MGMT', 'INCIDENT', 'MAINTENANCE', 'SAFETY', 'EMERGENCY', 'PATROL', 'SYSTEM_ALERT', 'COMMUNICATION', 'OTHER']).default('OTHER'),
  subcategory: z.string().max(100).optional(),
  
  // Referencias
  incidentId: z.number().optional(),
  visitorId: z.number().optional(),
  unitId: z.number().optional(),
  
  // Condiciones
  weatherConditions: z.string().max(100).optional(),
  temperature: z.number().optional(),
  
  // Verificaciones
  patrolChecks: z.array(z.object({
    checkpoint: z.string(),
    time: z.string().datetime(),
    status: z.string(),
    observations: z.string().optional()
  })).optional(),
  
  systemChecks: z.array(z.object({
    system: z.string(),
    status: z.string(),
    notes: z.string().optional()
  })).optional(),
  
  // Firma
  guardSignature: z.string().optional()
});

// Schema para filtros de búsqueda
const SearchFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  logType: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  guardId: z.number().optional(),
  requiresFollowUp: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// POST: Crear nueva minuta digital
export async function POST(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo guardias, recepcionistas y admins pueden crear minutas
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION', 'GUARD'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Solo personal de seguridad puede crear minutas' 
      }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ 
        message: 'Usuario sin complejo asociado' 
      }, { status: 400 });
    }

    const body = await request.json();
    const validation = CreateDigitalLogSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos', 
          errors: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const prisma = getPrisma();

    // Crear minuta digital
    const digitalLog = await prisma.digitalLog.create({
      data: {
        complexId: payload.complexId,
        shiftDate: new Date(data.shiftDate),
        shiftStart: new Date(data.shiftStart),
        shiftEnd: data.shiftEnd ? new Date(data.shiftEnd) : null,
        guardOnDuty: payload.userId,
        relievedBy: data.relievedBy,
        logType: data.logType,
        priority: data.priority,
        title: data.title,
        description: data.description,
        location: data.location,
        involvedPersons: data.involvedPersons || [],
        attachments: data.attachments || [],
        photos: data.photos || [],
        requiresFollowUp: data.requiresFollowUp,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        category: data.category,
        subcategory: data.subcategory,
        incidentId: data.incidentId,
        visitorId: data.visitorId,
        unitId: data.unitId,
        weatherConditions: data.weatherConditions,
        temperature: data.temperature,
        patrolChecks: data.patrolChecks || [],
        systemChecks: data.systemChecks || [],
        guardSignature: data.guardSignature,
        createdBy: payload.userId,
        status: 'OPEN'
      },
      include: {
        guard: {
          select: { id: true, name: true, email: true }
        },
        reliever: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`[DIGITAL LOG] Minuta creada ${digitalLog.id} por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Minuta digital creada exitosamente',
      digitalLog,
      logId: digitalLog.id
    });

  } catch (error) {
    console.error('[DIGITAL LOG CREATE] Error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Error creando minuta digital' 
    }, { status: 500 });
  }
}

// GET: Obtener minutas digitales con filtros
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION', 'GUARD'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Sin permisos para ver minutas' 
      }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ 
        message: 'Usuario sin complejo asociado' 
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros de búsqueda
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      logType: searchParams.get('logType'),
      priority: searchParams.get('priority'),
      status: searchParams.get('status'),
      category: searchParams.get('category'),
      guardId: searchParams.get('guardId') ? Number(searchParams.get('guardId')) : undefined,
      requiresFollowUp: searchParams.get('requiresFollowUp') === 'true' ? true : undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20
    };

    const validation = SearchFiltersSchema.safeParse(filters);
    if (!validation.success) {
      return NextResponse.json({ 
        message: 'Filtros inválidos' 
      }, { status: 400 });
    }

    const validatedFilters = validation.data;
    const prisma = getPrisma();

    // Construir where clause
    const whereClause: any = {
      complexId: payload.complexId
    };

    if (validatedFilters.startDate) {
      whereClause.shiftDate = {
        ...whereClause.shiftDate,
        gte: new Date(validatedFilters.startDate)
      };
    }

    if (validatedFilters.endDate) {
      whereClause.shiftDate = {
        ...whereClause.shiftDate,
        lte: new Date(validatedFilters.endDate)
      };
    }

    if (validatedFilters.logType) {
      whereClause.logType = validatedFilters.logType;
    }

    if (validatedFilters.priority) {
      whereClause.priority = validatedFilters.priority;
    }

    if (validatedFilters.status) {
      whereClause.status = validatedFilters.status;
    }

    if (validatedFilters.category) {
      whereClause.category = validatedFilters.category;
    }

    if (validatedFilters.guardId) {
      whereClause.guardOnDuty = validatedFilters.guardId;
    }

    if (validatedFilters.requiresFollowUp !== undefined) {
      whereClause.requiresFollowUp = validatedFilters.requiresFollowUp;
    }

    // Paginación
    const skip = (validatedFilters.page - 1) * validatedFilters.limit;

    // Obtener minutas y total
    const [digitalLogs, total] = await Promise.all([
      prisma.digitalLog.findMany({
        where: whereClause,
        include: {
          guard: {
            select: { id: true, name: true, email: true }
          },
          reliever: {
            select: { id: true, name: true, email: true }
          },
          creator: {
            select: { id: true, name: true, email: true }
          },
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validatedFilters.limit
      }),
      prisma.digitalLog.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(total / validatedFilters.limit);

    return NextResponse.json({
      success: true,
      digitalLogs,
      pagination: {
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        total,
        totalPages,
        hasNext: validatedFilters.page < totalPages,
        hasPrevious: validatedFilters.page > 1
      },
      filters: validatedFilters
    });

  } catch (error) {
    console.error('[DIGITAL LOG LIST] Error:', error);
    return NextResponse.json({ 
      message: 'Error obteniendo minutas digitales' 
    }, { status: 500 });
  }
}

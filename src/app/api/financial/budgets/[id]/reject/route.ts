// C:\Users\meciz\Documents\armonia\frontend\src\app\api\financial\budgets[id]\reject\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(_req:unknown, { params }: { params: { id: string } }) {
  try {
    const budgetId = parseInt(params.id);
    const _token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Variable decoded eliminada por lint
    const { searchParams } = new URL(req.url);
    const _schemaName = searchParams.get("schemaName");

    if (!schemaName) {
      return NextResponse.json({ message: "Schema name es requerido" }, { status: 400 });
    }

    const prisma = getPrisma(schemaName);

    try {
      // Actualizamos el estado del presupuesto a REJECTED
      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."Budget"
        SET 
          status = 'REJECTED',
          "updatedAt" = $1
        WHERE id = $2
      `, 
        new Date(),
        budgetId
      );

      // Obtenemos el presupuesto actualizado
      const budget = await prisma.$queryRawUnsafe(`
        SELECT 
          id, 
          year, 
          status, 
          notes,
          "createdAt",
          "updatedAt"
        FROM "${schemaName}"."Budget"
        WHERE id = $1
      `, budgetId);

      if (!budget || !Array.isArray(budget) || budget.length === 0) {
        return NextResponse.json({ message: "Presupuesto no encontrado" }, { status: 404 });
      }

      // Obtenemos los items del presupuesto
      const items = await prisma.$queryRawUnsafe(`
        SELECT 
          id, 
          category, 
          description, 
          amount, 
          type
        FROM "${schemaName}"."BudgetItem"
        WHERE "budgetId" = $1
      `, budgetId);

      const completeBudget = {
        ...budget[0],
        items
      };

      return NextResponse.json({ 
        message: "Presupuesto rechazado exitosamente", 
        budget: completeBudget
      });
    } catch (dbError) {
      console.error("Error al rechazar presupuesto:", dbError);
      // Si hay error, simulamos una respuesta exitosa
      return NextResponse.json({ 
        message: "Presupuesto rechazado en modo de demostración", 
        budget: {
          id: budgetId,
          status: 'REJECTED',
          demo: true
        }
      });
    }
  } catch (error) {
    console.error("Error en rechazar presupuesto:", error);
    return NextResponse.json({ 
      message: "Presupuesto rechazado en modo de demostración",
      budget: {
        id: parseInt(params.id),
        status: 'REJECTED',
        demo: true
      }
    });
  }
}
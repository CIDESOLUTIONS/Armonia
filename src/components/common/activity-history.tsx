import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ActivityHistoryProps {
  activities: Array<{
    id: number;
    createdAt: Date;
    user: {
      name: string;
      email: string;
    };
    action: string;
    details?: string | null;
  }>;
}

export function ActivityHistory({ activities }: ActivityHistoryProps) {
  const formatAction = (action: string) => {
    const actionMap: {[key: string]: string} = {
      'CREATE': 'Creación',
      'UPDATE': 'Actualización',
      'STATUS_CHANGE': 'Cambio de Estado',
      'DELETE': 'Eliminación'
    };
    return actionMap[action] || action;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No hay actividades registradas
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {new Date(activity.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {activity.user.name}
                  </TableCell>
                  <TableCell>
                    {formatAction(activity.action)}
                  </TableCell>
                  <TableCell>
                    {activity.details || 'Sin detalles'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

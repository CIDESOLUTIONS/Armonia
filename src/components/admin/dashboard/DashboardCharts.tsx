import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface ChartData {
  month: string;
  value: number;
}

interface DashboardChartsProps {
  revenueTrend: ChartData[];
  commonAreaUsageTrend: ChartData[];
}

export function DashboardCharts({ revenueTrend, commonAreaUsageTrend }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Ingresos Mensuales */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Ingresos" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Uso de Áreas Comunes */}
      <Card>
        <CardHeader>
          <CardTitle>Uso de Áreas Comunes (Mensual)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commonAreaUsageTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis formatter={(value: number) => `${value}%`} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="% Uso" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Save, Clock, Users, DollarSign } from 'lucide-react';

interface ServiceFormProps {
  initialData: unknown;
  onSubmit: (data: unknown) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
}: ServiceFormProps) {
  const { complexId } = useAuth();
  const [_formData, _setFormData] = useState({
    name: "",
    description: "",
    capacity: 10,
    startTime: "08:00",
    endTime: "18:00",
    rules: "",
    status: "active",
    cost: 0,
    complexId: complexId || 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Asegurarse de que estos campos estén en el formato correcto
        cost: initialData.cost || 0,
        capacity: initialData.capacity || 10,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Convertir a número para campos numéricos
    if (name === "capacity" || name === "cost") {
      processedValue = value === "" ? 0 : Number(value);
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Servicio</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="maintenance">En Mantenimiento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="capacity">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Capacidad (personas)</span>
                </div>
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Hora de Inicio</span>
                </div>
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Hora de Fin</span>
                </div>
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cost">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>Costo (0 para gratuito)</span>
              </div>
            </Label>
            <Input
              id="cost"
              name="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="rules">Reglas y Recomendaciones</Label>
            <Textarea
              id="rules"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              className="min-h-[120px]"
              placeholder="Ingrese las reglas y recomendaciones para el uso del servicio..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 flex items-center">
              <Save className="w-4 h-4 mr-2" /> Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

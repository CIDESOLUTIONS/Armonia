"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type PQRType = 'PETITION' | 'COMPLAINT' | 'CLAIM';
export type PQRPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PQRStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

export interface PQRFormData {
  title: string;
  description: string;
  type: PQRType;
  priority: PQRPriority;
  propertyUnit?: string;
  assignedTo?: string;
  category?: string;
}

interface PQRFormProps {
  initialData?: Partial<PQRFormData>;
  properties: { id: number; unitNumber: string }[];
  users: { id: number; name: string }[];
  categories: string[];
  onSubmit: (data: PQRFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
  language: string;
}

export default function PQRForm({
  initialData,
  properties,
  users,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing,
  language
}: PQRFormProps) {
  const [_formData, _setFormData] = useState<PQRFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'PETITION',
    priority: initialData?.priority || 'MEDIUM',
    propertyUnit: initialData?.propertyUnit,
    assignedTo: initialData?.assignedTo,
    category: initialData?.category
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">
            {language === 'Español' ? 'Título' : 'Title'}
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={language === 'Español' ? 'Título de la solicitud' : 'Request title'}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">
            {language === 'Español' ? 'Tipo' : 'Type'}
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder={language === 'Español' ? 'Seleccionar tipo' : 'Select type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PETITION">
                {language === 'Español' ? 'Petición' : 'Petition'}
              </SelectItem>
              <SelectItem value="COMPLAINT">
                {language === 'Español' ? 'Queja' : 'Complaint'}
              </SelectItem>
              <SelectItem value="CLAIM">
                {language === 'Español' ? 'Reclamo' : 'Claim'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">
            {language === 'Español' ? 'Prioridad' : 'Priority'}
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder={language === 'Español' ? 'Seleccionar prioridad' : 'Select priority'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                {language === 'Español' ? 'Baja' : 'Low'}
              </SelectItem>
              <SelectItem value="MEDIUM">
                {language === 'Español' ? 'Media' : 'Medium'}
              </SelectItem>
              <SelectItem value="HIGH">
                {language === 'Español' ? 'Alta' : 'High'}
              </SelectItem>
              <SelectItem value="URGENT">
                {language === 'Español' ? 'Urgente' : 'Urgent'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="propertyUnit">
            {language === 'Español' ? 'Unidad' : 'Property Unit'}
          </Label>
          <Select
            value={formData.propertyUnit || ''}
            onValueChange={(value) => handleSelectChange('propertyUnit', value)}
          >
            <SelectTrigger id="propertyUnit">
              <SelectValue placeholder={language === 'Español' ? 'Seleccionar unidad' : 'Select property unit'} />
            </SelectTrigger>
            <SelectContent>
              {properties.map(property => (
                <SelectItem key={property.id} value={property.unitNumber}>
                  {property.unitNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isEditing && (
          <div>
            <Label htmlFor="assignedTo">
              {language === 'Español' ? 'Asignado a' : 'Assigned To'}
            </Label>
            <Select
              value={formData.assignedTo || ''}
              onValueChange={(value) => handleSelectChange('assignedTo', value)}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder={language === 'Español' ? 'Seleccionar responsable' : 'Select assignee'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === 'Español' ? '-- Sin asignar --' : '-- Unassigned --'}
                </SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.name}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="category">
            {language === 'Español' ? 'Categoría' : 'Category'}
          </Label>
          <Select
            value={formData.category || ''}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder={language === 'Español' ? 'Seleccionar categoría' : 'Select category'} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">
          {language === 'Español' ? 'Descripción' : 'Description'}
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder={language === 'Español' ? 'Descripción detallada de la solicitud...' : 'Detailed description of the request...'}
          className="min-h-[150px]"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-2 h-4 w-4" />
          {language === 'Español' ? 'Cancelar' : 'Cancel'}
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'Español' ? 'Guardando...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {language === 'Español' ? 'Guardar' : 'Save'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
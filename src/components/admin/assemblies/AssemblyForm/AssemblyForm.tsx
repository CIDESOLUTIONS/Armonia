import React from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

interface AssemblyFormData {
  tipo: 'ordinaria' | 'extraordinaria';
  titulo: string;
  fecha: string;
  hora: string;
  descripcion: string;
  quorumRequerido: number;
  documentos?: File[];
}

interface AssemblyFormProps {
  initialData?: Partial<AssemblyFormData>;
  onSubmit: (data: AssemblyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AssemblyForm: React.FC<AssemblyFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [_formData, _setFormData] = React.useState<AssemblyFormData>({
    tipo: 'ordinaria',
    titulo: '',
    fecha: '',
    hora: '',
    descripcion: '',
    quorumRequerido: 50,
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Asamblea
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="ordinaria">Ordinaria</option>
            <option value="extraordinaria">Extraordinaria</option>
          </select>
        </div>

        <Input
          name="titulo"
          label="Título"
          value={formData.titulo}
          onChange={handleChange}
          required
        />

        <Input
          name="fecha"
          type="date"
          label="Fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
        />

        <Input
          name="hora"
          type="time"
          label="Hora"
          value={formData.hora}
          onChange={handleChange}
          required
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows={4}
            value={formData.descripcion}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <Input
          name="quorumRequerido"
          type="number"
          label="Quórum Requerido (%)"
          value={formData.quorumRequerido.toString()}
          onChange={handleChange}
          min="1"
          max="100"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          Guardar Asamblea
        </Button>
      </div>
    </form>
  );
};

export default AssemblyForm;
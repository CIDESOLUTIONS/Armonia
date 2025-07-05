import React from 'react';

interface TableColumn<T> {
  key: string;
  title: string;
  render?: (value: unknown, record: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (record: T) => void;
  className?: string;
  emptyText?: string;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  onRowClick,
  className = '',
  emptyText = 'No hay datos disponibles'
}: TableProps<T>) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {/* Header */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.width ? `w-[${column.width}]` : ''}
                `}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td 
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                Cargando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(record)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(record[column.key], record)
                      : record[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
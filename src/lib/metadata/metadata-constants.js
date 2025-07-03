/**
 * Constantes de metadatos para la aplicación Armonía
 * Adaptado a CommonJS para compatibilidad con Jest
 */

// Tipos de entidades
const ENTITY_TYPES = {
  RESIDENT: 'RESIDENT',
  PROPERTY: 'PROPERTY',
  COMPLEX: 'COMPLEX',
  ASSEMBLY: 'ASSEMBLY',
  PQR: 'PQR',
  PAYMENT: 'PAYMENT',
  RESERVATION: 'RESERVATION',
  VISITOR: 'VISITOR',
  DOCUMENT: 'DOCUMENT'
};

// Campos de metadatos por entidad
const METADATA_FIELDS = {
  RESIDENT: [
    { name: 'identification_type', type: 'string', required: true },
    { name: 'identification_number', type: 'string', required: true },
    { name: 'birth_date', type: 'date', required: false },
    { name: 'occupation', type: 'string', required: false },
    { name: 'emergency_contact', type: 'string', required: false }
  ],
  PROPERTY: [
    { name: 'area', type: 'number', required: true },
    { name: 'bedrooms', type: 'number', required: true },
    { name: 'bathrooms', type: 'number', required: true },
    { name: 'parking_spots', type: 'number', required: true },
    { name: 'floor', type: 'number', required: true }
  ],
  COMPLEX: [
    { name: 'total_units', type: 'number', required: true },
    { name: 'year_built', type: 'number', required: false },
    { name: 'administrator_name', type: 'string', required: true },
    { name: 'administrator_phone', type: 'string', required: true },
    { name: 'administrator_email', type: 'string', required: true }
  ],
  ASSEMBLY: [
    { name: 'quorum_required', type: 'number', required: true },
    { name: 'voting_method', type: 'string', required: true },
    { name: 'recording_allowed', type: 'boolean', required: true },
    { name: 'external_moderator', type: 'boolean', required: false },
    { name: 'external_moderator_name', type: 'string', required: false }
  ],
  PQR: [
    { name: 'source', type: 'string', required: true },
    { name: 'impact_level', type: 'string', required: true },
    { name: 'affected_area', type: 'string', required: false },
    { name: 'recurrence', type: 'string', required: false },
    { name: 'external_reference', type: 'string', required: false }
  ],
  PAYMENT: [
    { name: 'payment_method', type: 'string', required: true },
    { name: 'transaction_id', type: 'string', required: false },
    { name: 'bank_reference', type: 'string', required: false },
    { name: 'receipt_number', type: 'string', required: false },
    { name: 'payment_concept', type: 'string', required: true }
  ],
  RESERVATION: [
    { name: 'attendees', type: 'number', required: true },
    { name: 'purpose', type: 'string', required: true },
    { name: 'requires_setup', type: 'boolean', required: false },
    { name: 'setup_details', type: 'string', required: false },
    { name: 'special_requests', type: 'string', required: false }
  ],
  VISITOR: [
    { name: 'identification_type', type: 'string', required: true },
    { name: 'identification_number', type: 'string', required: true },
    { name: 'vehicle_plate', type: 'string', required: false },
    { name: 'company', type: 'string', required: false },
    { name: 'visit_purpose', type: 'string', required: true }
  ],
  DOCUMENT: [
    { name: 'document_type', type: 'string', required: true },
    { name: 'version', type: 'string', required: true },
    { name: 'author', type: 'string', required: true },
    { name: 'approval_date', type: 'date', required: false },
    { name: 'expiration_date', type: 'date', required: false }
  ]
};

// Validadores de metadatos
const VALIDATORS = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !isNaN(value),
  boolean: (value) => typeof value === 'boolean',
  date: (value) => value instanceof Date && !isNaN(value.getTime()),
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[0-9+\-\s()]{7,15}$/.test(value)
};

// Exportar constantes usando CommonJS para compatibilidad con Jest
module.exports = {
  ENTITY_TYPES,
  METADATA_FIELDS,
  VALIDATORS
};

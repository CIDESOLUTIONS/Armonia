// src/models/service/common-service.model.ts
import { Schema, model } from 'mongoose';
import { ICommonService } from '../../interfaces/service/common-service.interface';

const scheduleSchema = new Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  }
});

const commonServiceSchema = new Schema<ICommonService>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  schedule: [scheduleSchema],
  rules: [{
    type: String,
    required: true
  }],
  reservationRequired: {
    type: Boolean,
    default: true
  },
  maxReservationDuration: {
    type: Number, // en minutos
    required: true,
    min: 30
  },
  minAdvanceReservation: {
    type: Number, // en horas
    required: true,
    min: 0
  },
  maxAdvanceReservation: {
    type: Number, // en días
    required: true,
    min: 1
  },
  residentialComplex: {
    type: Schema.Types.ObjectId,
    ref: 'ResidentialComplex',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
commonServiceSchema.index({ residentialComplex: 1, name: 1 }, { unique: true });
commonServiceSchema.index({ isEnabled: 1 });

export const CommonServiceModel = model<ICommonService>('CommonService', commonServiceSchema);
// src/models/service/reservation.model.ts
import { Schema, model } from 'mongoose';
import { IReservation } from '../../interfaces/service/reservation.interface';

const reservationSchema = new Schema<IReservation>({
  service: {
    type: Schema.Types.ObjectId,
    ref: 'CommonService',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  attendees: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String,
    maxlength: 500
  },
  residentialComplex: {
    type: Schema.Types.ObjectId,
    ref: 'ResidentialComplex',
    required: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
reservationSchema.index({ service: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ residentialComplex: 1 });

export const ReservationModel = model<IReservation>('Reservation', reservationSchema);
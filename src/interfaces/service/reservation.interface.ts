// src/interfaces/service/reservation.interface.ts
import { Document } from 'mongoose';

export interface IReservation extends Document {
  service: string;
  user: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  attendees: number;
  notes?: string;
  residentialComplex: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationDTO {
  service: string;
  startTime: Date;
  endTime: Date;
  attendees: number;
  notes?: string;
}

export interface UpdateReservationDTO {
  startTime?: Date;
  endTime?: Date;
  attendees?: number;
  notes?: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  currentCapacity?: number;
}

export interface IReservationService {
  createReservation(
    data: CreateReservationDTO,
    userId: string,
    complexId: string
  ): Promise<IReservation>;

  getReservation(
    id: string,
    userId: string,
    complexId: string
  ): Promise<IReservation>;

  updateReservation(
    id: string,
    data: UpdateReservationDTO,
    userId: string,
    complexId: string
  ): Promise<IReservation>;

  cancelReservation(
    id: string,
    userId: string,
    complexId: string
  ): Promise<IReservation>;

  getUserReservations(
    userId: string,
    complexId: string,
    status?: string[]
  ): Promise<IReservation[]>;

  getServiceReservations(
    serviceId: string,
    complexId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IReservation[]>;

  getAvailableTimeSlots(
    serviceId: string,
    date: Date,
    complexId: string
  ): Promise<TimeSlot[]>;
}
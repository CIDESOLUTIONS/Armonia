// src/interfaces/service/common-service.interface.ts
import { Document } from 'mongoose';

export interface ISchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ICommonService extends Document {
  name: string;
  description: string;
  isEnabled: boolean;
  capacity: number;
  schedule: ISchedule[];
  rules: string[];
  reservationRequired: boolean;
  maxReservationDuration: number;
  minAdvanceReservation: number;
  maxAdvanceReservation: number;
  residentialComplex: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
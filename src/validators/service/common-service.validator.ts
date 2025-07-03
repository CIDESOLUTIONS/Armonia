// src/validators/service/common-service.validator.ts
import Joi from 'joi';

const scheduleSchema = Joi.object({
  dayOfWeek: Joi.number().min(0).max(6).required(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

export const createServiceSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(500),
  capacity: Joi.number().required().min(1),
  schedule: Joi.array().items(scheduleSchema).min(1).required(),
  rules: Joi.array().items(Joi.string()).min(1).required(),
  reservationRequired: Joi.boolean(),
  maxReservationDuration: Joi.number().min(30).required(),
  minAdvanceReservation: Joi.number().min(0).required(),
  maxAdvanceReservation: Joi.number().min(1).required()
});

export const updateServiceSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(500),
  capacity: Joi.number().min(1),
  schedule: Joi.array().items(scheduleSchema).min(1),
  rules: Joi.array().items(Joi.string()).min(1),
  reservationRequired: Joi.boolean(),
  maxReservationDuration: Joi.number().min(30),
  minAdvanceReservation: Joi.number().min(0),
  maxAdvanceReservation: Joi.number().min(1),
  isEnabled: Joi.boolean()
}).min(1);
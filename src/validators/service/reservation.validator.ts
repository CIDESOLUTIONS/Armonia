// src/validators/service/reservation.validator.ts
import Joi from 'joi';

export const createReservationSchema = Joi.object({
  service: Joi.string().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
  attendees: Joi.number().min(1).required(),
  notes: Joi.string().max(500)
});

export const updateReservationSchema = Joi.object({
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')),
  attendees: Joi.number().min(1),
  notes: Joi.string().max(500)
}).min(1);
// src/validators/financial/fee.validator.ts
import Joi from 'joi';

export const createFeeSchema = Joi.object({
  unit: Joi.string().required(),
  type: Joi.string().valid('regular', 'extraordinary').required(),
  amount: Joi.number().min(0).required(),
  dueDate: Joi.date().greater('now').required(),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().greater(Joi.ref('periodStart')).required(),
  concept: Joi.string().required()
});

export const createBulkFeesSchema = Joi.object({
  type: Joi.string().valid('regular', 'extraordinary').required(),
  amount: Joi.number().min(0).required(),
  dueDate: Joi.date().greater('now').required(),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().greater(Joi.ref('periodStart')).required(),
  concept: Joi.string().required(),
  units: Joi.array().items(Joi.string())
});
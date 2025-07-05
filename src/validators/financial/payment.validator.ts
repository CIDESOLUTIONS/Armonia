// src/validators/financial/payment.validator.ts
import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  fee: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('cash', 'transfer', 'card', 'check').required(),
  transactionId: Joi.string().when('paymentMethod', {
    is: 'transfer',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  notes: Joi.string().max(500)
});
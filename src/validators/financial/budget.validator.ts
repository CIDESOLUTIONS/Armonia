// src/validators/financial/budget.validator.ts
const budgetItemSchema = Joi.object({
  category: Joi.string().required(),
  description: Joi.string().required(),
  plannedAmount: Joi.number().min(0).required()
});

export const createBudgetSchema = Joi.object({
  year: Joi.number().integer().min(new Date().getFullYear()).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  items: Joi.array().items(budgetItemSchema).min(1).required(),
  notes: Joi.string().max(500)
});

export const updateBudgetSchema = Joi.object({
  items: Joi.array().items(budgetItemSchema).min(1),
  notes: Joi.string().max(500)
}).min(1);

export const executeBudgetItemSchema = Joi.object({
  itemId: Joi.string().required(),
  executedAmount: Joi.number().min(0).required(),
  notes: Joi.string().max(500)
});
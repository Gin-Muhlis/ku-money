import Joi from 'joi';

export const updateCategoryDto = Joi.object({
  title: Joi.string()
    .optional()
    .trim()
    .min(1)
    .max(50)
    .messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 50 characters',
    }),
  icon: Joi.string()
    .optional()
    .trim()
    .messages({
      'string.base': 'Icon must be a string',
    }),
  type: Joi.string()
    .valid('incomes', 'expenses')
    .optional()
    .messages({
      'string.base': 'Type must be a string',
      'any.only': 'Type must be either "incomes" or "expenses"',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});


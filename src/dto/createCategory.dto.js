import Joi from 'joi';

export const createCategoryDto = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(50)
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 50 characters',
      'any.required': 'Title is required',
    }),
  icon: Joi.string()
    .required()
    .trim()
    .messages({
      'string.base': 'Icon must be a string',
      'string.empty': 'Icon is required',
      'any.required': 'Icon is required',
    }),
  type: Joi.string()
    .valid('incomes', 'expenses')
    .required()
    .messages({
      'string.base': 'Type must be a string',
      'any.only': 'Type must be either "incomes" or "expenses"',
      'any.required': 'Type is required',
    }),
});


import Joi from 'joi';

/**
 * DTO for creating account
 */
export const createAccountDto = Joi.object({
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
  description: Joi.string()
    .optional()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description must not exceed 200 characters',
    }),
  balance: Joi.number()
    .optional()
    .default(0)
    .messages({
      'number.base': 'Balance must be a number',
    }),
});

/**
 * DTO for updating account
 */
export const updateAccountDto = Joi.object({
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
  description: Joi.string()
    .optional()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description must not exceed 200 characters',
    }),
  balance: Joi.number()
    .optional()
    .messages({
      'number.base': 'Balance must be a number',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});


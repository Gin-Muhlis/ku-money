import Joi from 'joi';

/**
 * DTO for creating transaction
 */
export const createTransactionDto = Joi.object({
  accountId: Joi.string()
    .required()
    .messages({
      'string.base': 'Account ID must be a string',
      'string.empty': 'Account ID is required',
      'any.required': 'Account ID is required',
    }),
  categoryId: Joi.string()
    .required()
    .messages({
      'string.base': 'Category ID must be a string',
      'string.empty': 'Category ID is required',
      'any.required': 'Category ID is required',
    }),
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be a positive number',
      'any.required': 'Amount is required',
    }),
  note: Joi.string()
    .optional()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.base': 'Note must be a string',
      'string.max': 'Note must not exceed 500 characters',
    }),
  paymentDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Payment date must be a valid date',
    }),
});

/**
 * DTO for updating transaction
 */
export const updateTransactionDto = Joi.object({
  accountId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Account ID must be a string',
    }),
  categoryId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Category ID must be a string',
    }),
  amount: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be a positive number',
    }),
  note: Joi.string()
    .optional()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.base': 'Note must be a string',
      'string.max': 'Note must not exceed 500 characters',
    }),
  paymentDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Payment date must be a valid date',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});


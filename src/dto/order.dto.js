import Joi from 'joi';

/**
 * DTO for creating order
 */
export const createOrderDto = Joi.object({
  packageId: Joi.string()
    .required()
    .messages({
      'string.base': 'Package ID must be a string',
      'string.empty': 'Package ID is required',
      'any.required': 'Package ID is required',
    }),
  period: Joi.object({
    type: Joi.string()
      .valid('month')
      .default('month')
      .messages({
        'string.base': 'Period type must be a string',
        'any.only': 'Period type must be "month"',
      }),
    value: Joi.number()
      .valid(1, 3, 6, 12)
      .required()
      .messages({
        'number.base': 'Period value must be a number',
        'any.only': 'Period value must be 1, 3, 6, or 12',
        'any.required': 'Period value is required',
      }),
  })
    .required()
    .messages({
      'object.base': 'Period must be an object',
      'any.required': 'Period is required',
    }),
});


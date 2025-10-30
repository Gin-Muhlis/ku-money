import Category from '../models/Category.model.js';

/**
 * Create new category
 */
export const createCategory = async (categoryData) => {
  return await Category.create(categoryData);
};

/**
 * Find category by ID
 */
export const findCategoryById = async (categoryId) => {
  return await Category.findById(categoryId);
};

/**
 * Find category by ID and user ID
 */
export const findCategoryByIdAndUserId = async (categoryId, userId) => {
  return await Category.findOne({
    _id: categoryId,
    'createdBy._id': userId,
  });
};

/**
 * Find all categories by user ID
 */
export const findCategoriesByUserId = async (userId, filters = {}) => {
  const query = { 'createdBy._id': userId };
  
  if (filters.type) {
    query.type = filters.type;
  }

  return await Category.find(query).sort({ createdAt: -1 });
};

/**
 * Count categories by user ID
 */
export const countCategoriesByUserId = async (userId, type = null) => {
  const query = { 'createdBy._id': userId };
  
  if (type) {
    query.type = type;
  }

  return await Category.countDocuments(query);
};

/**
 * Update category by ID
 */
export const updateCategoryById = async (categoryId, userId, updateData) => {
  return await Category.findOneAndUpdate(
    { _id: categoryId, 'createdBy._id': userId },
    updateData,
    { new: true }
  );
};

/**
 * Delete category by ID
 */
export const deleteCategoryById = async (categoryId, userId) => {
  return await Category.findOneAndDelete({
    _id: categoryId,
    'createdBy._id': userId,
  });
};


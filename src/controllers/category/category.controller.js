import * as categoryDatasource from '../../datasource/category.datasource.js';
import * as transactionDatasource from '../../datasource/transaction.datasource.js';

/**
 * Create new category
 */
export const createCategory = async (req, res) => {
  const { title, icon, type } = req.body;

  try {
    const categoryData = {
      createdBy: {
        _id: req.user.id,
        email: req.user.email,
      },
      title,
      icon,
      type,
    };

    const category = await categoryDatasource.createCategory(categoryData);

    res.status(201).json({
      message: 'Category created successfully',
      data: category,
      subscription: req.subscription, // Info from checkCategoryLimit middleware
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get all categories for current user
 */
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;

    const categories = await categoryDatasource.findCategoriesByUserId(
      req.user.id,
      { type }
    );

    // Get category IDs to calculate total amounts
    const categoryIds = categories.map(cat => cat._id);

    // Get total amounts for all categories
    const amountsByCategory = await transactionDatasource.getTotalAmountsByCategoryIds(
      req.user.id,
      categoryIds
    );

    // Map categories with amount
    const categoriesWithAmount = categories.map(category => {
      const categoryId = category._id.toString();
      const amount = amountsByCategory[categoryId] || 0;

      return {
        ...category.toObject(),
        amount: amount,
      };
    });

    res.status(200).json({
      data: categoriesWithAmount,
      total: categoriesWithAmount.length,
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await categoryDatasource.findCategoryByIdAndUserId(
      id,
      req.user.id
    );

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    res.status(200).json({
      data: category,
    });
  } catch (error) {
    console.error('Get Category By ID Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Update category by ID
 */
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title, icon, type } = req.body;

  try {
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (icon !== undefined) updateData.icon = icon;
    if (type !== undefined) updateData.type = type;

    const category = await categoryDatasource.updateCategoryById(
      id,
      req.user.id,
      updateData
    );

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    res.status(200).json({
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Delete category by ID
 */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Get category first to get the name
    const category = await categoryDatasource.findCategoryByIdAndUserId(
      id,
      req.user.id
    );

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    // Update all transactions that use this category with snapshot
    const categorySnapshot = category.title;
    const updateResult = await transactionDatasource.updateCategorySnapshot(
      id,
      categorySnapshot
    );

    // Delete category
    await categoryDatasource.deleteCategoryById(id, req.user.id);

    res.status(200).json({
      message: 'Category deleted successfully',
      data: category,
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};


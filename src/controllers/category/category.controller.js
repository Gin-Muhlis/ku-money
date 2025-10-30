import * as categoryDatasource from '../../datasource/category.datasource.js';

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

    res.status(200).json({
      data: categories,
      total: categories.length,
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
    const category = await categoryDatasource.deleteCategoryById(
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


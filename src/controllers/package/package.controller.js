import * as packageDatasource from '../../datasource/subscriptionPackage.datasource.js';

/**
 * Get all subscription packages
 */
export const getPackages = async (req, res) => {
  try {
    const packages = await packageDatasource.findAllPackages();
    
    res.status(200).json({
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data packages',
      error: error.message,
    });
  }
};


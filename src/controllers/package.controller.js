import SubscriptionPackage from '../models/SubscriptionPackage.model.js';

export const getPackages = async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find();
    
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


import SubscriptionPackage from '../models/SubscriptionPackage.model.js';

/**
 * Find subscription package by ID
 */
export const findPackageById = async (packageId) => {
  return await SubscriptionPackage.findById(packageId);
};

/**
 * Find subscription package by name
 */
export const findPackageByName = async (packageName) => {
  return await SubscriptionPackage.findOne({ package: packageName });
};

/**
 * Find all subscription packages
 */
export const findAllPackages = async () => {
  return await SubscriptionPackage.find();
};


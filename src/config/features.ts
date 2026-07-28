/**
 * Feature access configuration for the Free/Premium subscription system.
 *
 * PREMIUM_FEATURES: only accessible when status_subscription === 'premium'
 * FREE_FEATURES: accessible to all authenticated users regardless of tier
 */

export const PREMIUM_FEATURES = [
  'view_ai_analytics',
] as const;

export const FREE_FEATURES = [
  'view_dashboard',
  'view_basic_reports',
  'view_advanced_reports',
  'upload_documents',
  'view_lowongan',
  'view_profile',
  'view_feedback',
  'ai_cv_generator',
  'export_data',
] as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[number];
export type FreeFeature = typeof FREE_FEATURES[number];
export type FeatureName = PremiumFeature | FreeFeature;

/**
 * Returns true if `feature` is in the premium-only list.
 */
export function isPremiumFeature(feature: string): feature is PremiumFeature {
  return (PREMIUM_FEATURES as readonly string[]).includes(feature);
}

/**
 * Returns true if `feature` is accessible without a premium subscription.
 */
export function isFreeFeature(feature: string): feature is FreeFeature {
  return (FREE_FEATURES as readonly string[]).includes(feature);
}

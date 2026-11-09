import type { SalinityClass } from '../types';

/**
 * EC SCALE NOTE
 * Dataset values range 0–1 and appear to be NORMALIZED, not raw dS/m.
 * Set EC_SCALE_CONFIRMED = true once the original scaling parameters
 * are verified — this activates the dS/m classification thresholds.
 */
export const EC_SCALE_CONFIRMED = false;

export const classifySalinity = (ecValue: number): SalinityClass => {
  if (!EC_SCALE_CONFIRMED) {
    return {
      label: 'Scale Unconfirmed',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      interpretation:
        'EC values in this dataset range from 0–1 and may be normalized. ' +
        'Classification in dS/m will be activated once the original scale is verified.',
      minEc: 0,
      maxEc: 1,
    };
  }

  // Standard dS/m thresholds — active only when EC_SCALE_CONFIRMED = true
  if (ecValue <= 2) {
    return {
      label: 'Non-saline',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      interpretation: 'Soil is suitable for most crops. No salinity concern.',
      minEc: 0,
      maxEc: 2,
    };
  } else if (ecValue <= 8) {
    return {
      label: 'Moderately saline',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      interpretation: 'Moderate salinity. Salt-tolerant crops may still grow.',
      minEc: 2,
      maxEc: 8,
    };
  } else {
    return {
      label: 'Strongly to extremely saline',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      interpretation: 'High salinity. Most crops will not grow without soil treatment.',
      minEc: 8,
      maxEc: Infinity,
    };
  }
};

export const formatEcValue = (ecValue: number | null): string => {
  if (ecValue === null || ecValue === undefined) return 'N/A';
  return ecValue.toFixed(6);
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Sort outlets by distance from a given coordinate
 */
export const sortOutletsByDistance = <T extends { id: number; latitude: string | number; longitude: string | number }>(
  outlets: T[],
  userLat: number,
  userLng: number
): Array<T & { distance: number }> => {
  return outlets
    .map((outlet) => ({
      ...outlet,
      distance: calculateDistance(
        userLat,
        userLng,
        parseFloat(outlet.latitude.toString()),
        parseFloat(outlet.longitude.toString())
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
};

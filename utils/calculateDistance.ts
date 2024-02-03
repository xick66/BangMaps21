type Coordinate = {
    lat: number;
    lon: number;
  };
  
  /**
   * Calculates the distance between two points on the Earth's surface.
   * @param {Coordinate} point1 - The first point with latitude and longitude.
   * @param {Coordinate} point2 - The second point with latitude and longitude.
   * @returns {number} The distance in kilometers.
   */
  export const calculateDistance = (point1: Coordinate, point2: Coordinate): number => {
    const { lat: lat1, lon: lon1 } = point1;
    const { lat: lat2, lon: lon2 } = point2;
  
    // Radius of the earth in kilometers
    const earthRadiusKm = 6371;
  
    // Convert degrees to radians
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
  
    // Apply the Haversine formula
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return earthRadiusKm * c;
  };
  
  /**
   * Converts degrees to radians.
   * @param {number} degrees - The angle in degrees.
   * @returns {number} The angle in radians.
   */
  const degreesToRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };
  
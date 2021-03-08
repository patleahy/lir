/**
 * Implementation of the haversine formula to calculate the distance between 
 * two points on the globe. 
 * 
 * This is not part of the Lir DSL implementation but it is used in the gpx2tcx
 * mapping rules to calculate a property in the TCX format which is not in the
 * GPX format.
 */
export const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const radius = 6367000; // m
    const dlatrad = deg2rad(lat2 - lat1);
    const dlonrad = deg2rad(lon2 - lon1);
    const lat1rad = deg2rad(lat1);
    const lat2rad = deg2rad(lat2);
    const centralAngle = (Math.sin(dlatrad / 2) ** 2) + (Math.sin(dlonrad / 2) ** 2) * Math.cos(lat1rad) * Math.cos(lat2rad)
    const sphericalDistance = 2 * Math.asin(Math.sqrt(centralAngle));
    return radius * sphericalDistance;
};

let deg2rad = (deg: number): number => deg * Math.PI / 180;
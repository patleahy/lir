/**
 * Lir rules which maps from a GPX format to TCX format.
 */

import { from } from './lir';
import { haversine } from './haversine';

export const rules = 
    from('gpx.metadata.name').to('TrainingCenterDatabase.Courses.Course.Name')
    .from('gpx.trk.trkseg.trkpt').each().to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
    .with(
         from('@_lat').to('Position.LatitudeDegrees')
        .from('@_lon').to('Position.LongitudeDegrees')
        .from('time').to('Time')
        .from('ele').to('AltitudeMeters'));

        
// TCX point contain a running total of the distance since the start. 
// GPX doesn't have this data but we can calculate it.
// This takes advantage of the 'using' keyword to add a custom transformation 
// function to the mapping rules. We add the calcDistance function
// to turn the input trackpoint into an object like this 
// "{ 'DistanceMeters' : 12.42 }". That object will then be merged into the 
// Trackpoint object that was already created using the mappings above.

rules.from('gpx.trk.trkseg.trkpt').each().using(calcDistance)
    .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint');

var distance = 0.0;
var prevPoint = undefined;
function calcDistance(point: any): any {
    var currPoint = [ parseFloat(point['@_lat']), parseFloat(point['@_lon']) ];
    if (prevPoint) {
        distance += haversine(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]);
    }
    prevPoint = currPoint;
    return { 'DistanceMeters' : distance };
}
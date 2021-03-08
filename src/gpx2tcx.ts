import { from } from './lir';
import { haversine } from './haversine';

export const rules = from('gpx.metadata.name').to('TrainingCenterDatabase.Courses.Course.Name')
    .from('gpx.trk.trkseg.trkpt').each()
    .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
        .with(
             from('@_lat').to('Position.LatitudeDegrees')
            .from('@_lon').to('Position.LongitudeDegrees')
            .from('time').to('Time')
            .from('ele').to('AltitudeMeters'));

rules.from('gpx.trk.trkseg.trkpt')
    .each()
    .using(calcDistance)
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
import { from } from './lir';




export const rules = from('gpx.metadata.name').to('TrainingCenterDatabase.Courses.Course.Name')
    .from('gpx.trk.trkseg.trkpt').each()
    .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
        .with(
             from('@_lat').to('Position.LatitudeDegrees')
            .from('@_lon').to('Position.LongitudeDegrees')
            .from('time').to('Time')
            .from('ele').to('AltitudeMeters'));


function haversine(lat1, lon1, lat2, lon2) {
    return 42.0;
}

var distance = 0.0;
var prevPoint = undefined;
function calcDistance(point: any): any {
    if (prevPoint) {
        distance += haversine(prevPoint['@_lat'], prevPoint['@_lon'], point['@_lat'], point['@_lon']);
    }
    prevPoint = point;
    return { 'DistanceMeters' : distance };
}

rules.from('gpx.trk.trkseg.trkpt')
    .each()
    .using(calcDistance)
    .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint');

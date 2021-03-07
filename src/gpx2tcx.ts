import { from } from './lir';

export const rules = from('gpx.metadata.name').to('TrainingCenterDatabase.Courses.Course.Name')
    .from('gpx.trk.trkseg.trkpt').each()
    .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
        .with(
             from('@_lat').to('Position.LatitudeDegrees')
            .from('@_lon').to('Position.LongitudeDegrees')
            .from('time').to('Time')
            .from('ele').to('AltitudeMeters'));

import { expect } from 'chai';
import { from } from '../src/lir';

describe('Lir', () => {

    it('single shallow property mapping', () => {
        var source = { name: 'My Blog' };

        var output = from('name').to('title').map(source);

        expect(output.title).to.be.equal('My Blog');
    });

    it('single deeper property mapping', () => {
        var source = {
            rss: {
                channel: {
                    title: 'My Blog',
                }
            }
        };
        
        var output = from('rss.channel.title').to('feed.title.#text').map(source);

        expect(output.feed.title['#text']).to.be.equal('My Blog');
    });

    it('array of properties mapping', () => {
        var source = {
            gpx: {
                trk: { 
                    trkseg: {
                        trkpt: [
                            { lat: 45.839295, lon: -123.959679 },
                            { lat: 45.838555, lon: -123.959732 },
                            { lat: 45.838526, lon: -123.958723 }
                        ]
                    }
                }
            }
        };

        var output = 
             from('gpx.trk.trkseg.trkpt')
            .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
            .map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lat).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lat).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lat).to.be.equal(45.838526);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lon).to.be.equal(-123.959679);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lon).to.be.equal(-123.959732);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lon).to.be.equal(-123.958723);
    });

    it('two properties property mapping', () => {
        var source = {
            rss: {
                channel: {
                    title: 'My Blog',
                    description: 'The very interesting things I do.'
                }
            }
        };

        var output = 
             from('rss.channel.title').to('feed.title.text')
            .from('rss.channel.description').to('feed.subtitle.text')
            .map(source);

        expect(output.feed.title.text).to.be.equal('My Blog');
        expect(output.feed.subtitle.text).to.be.equal('The very interesting things I do.');
    });

    it('two properties at different depths', () => {
        var source = {
            rss: {
                channel: {
                    title: 'My Blog',
                    link: {
                        href: 'http://myspace.com/pat',
                    }
                }
            }
        };

        var output = 
             from('rss.channel.title').to('feed.title.text')
            .from('rss.channel.link.href').to('feed.link.href')
            .map(source);

        expect(output.feed.title.text).to.be.equal('My Blog');
        expect(output.feed.link.href).to.be.equal('http://myspace.com/pat');
    });

    it('child mapping using with', () => {
        var source = {
            rss: {
                channel: {
                    title: 'My Blog',
                    link: {
                        href: 'http://myspace.com/pat',
                    }
                }
            }
        };

        var output = 
             from('rss.channel').to('feed')
            .with(from('title').to('title.text'))
            .map(source);
        
        expect(output.feed.title.text).to.be.equal('My Blog');
    });


    it('child mapping using with and and', () => {
        var source = {
            rss: {
                channel: {
                    title: 'My Blog',
                    link: {
                        href: 'http://myspace.com/pat',
                    }
                }
            }
        };

        var output = 
             from('rss.channel').to('feed')
            .with(
                 from('title').to('title.text')
                .from('link.href').to('link.href'))
            .map(source);
        
        expect(output.feed.title.text).to.be.equal('My Blog');
    });

    it('child mapping using two with/and blocks', () => {
        var source = {
            gpx: {
                trk: { 
                    trkseg: {
                        trkpt: [
                            { lat: 45.839295, lon: -123.959679 },
                            { lat: 45.838555, lon: -123.959732 },
                            { lat: 45.838526, lon: -123.958723 }
                        ]
                    }
                }
            }
        };

        var output = 
             from('gpx').to('TrainingCenterDatabase')
            .with(
                 from('trk').to('Courses')
                .with(from('trkseg.trkpt').to('Course.Track.Trackpoint')))
            .map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lat).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lat).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lat).to.be.equal(45.838526);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lon).to.be.equal(-123.959679);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lon).to.be.equal(-123.959732);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lon).to.be.equal(-123.958723);
    });

    it('map array', () => {

        var source = {
            gpx: {
                trk: { 
                    trkseg: {
                        trkpt: [
                            { lat: 45.839295, lon: -123.959679 },
                            { lat: 45.838555, lon: -123.959732 },
                            { lat: 45.838526, lon: -123.958723 }
                        ]
                    }
                }
            }
        };

        var lir = 
             from('gpx.trk.trkseg.trkpt')
            .each()
            .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint');

        var output = lir.map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lat).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lat).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lat).to.be.equal(45.838526);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lon).to.be.equal(-123.959679);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lon).to.be.equal(-123.959732);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lon).to.be.equal(-123.958723);
    });

    it('map property inside array', () => {

        var source = {
            gpx: {
                trk: { 
                    trkseg: {
                        trkpt: [
                            { lat: 45.839295, lon: -123.959679 },
                            { lat: 45.838555, lon: -123.959732 },
                            { lat: 45.838526, lon: -123.958723 }
                        ]
                    }
                }
            }
        };

        var output = 
             from('gpx.trk.trkseg.trkpt').each()
            .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
            .with(from('lat').to('Latitude'))
            .map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].Latitude).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].Latitude).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].Latitude).to.be.equal(45.838526);
    });

    it('map two properties inside array', () => {

        var source = {
            gpx: {
                trk: { 
                    trkseg: {
                        trkpt: [
                            { lat: 45.839295, lon: -123.959679 },
                            { lat: 45.838555, lon: -123.959732 },
                            { lat: 45.838526, lon: -123.958723 }
                        ]
                    }
                }
            }
        };

        var output = 
             from('gpx.trk.trkseg.trkpt').each()
            .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
            .with(
                 from('lat').to('Latitude')
                .from('lon').to('Longitude'))
            .map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].Latitude).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].Latitude).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].Latitude).to.be.equal(45.838526);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].Longitude).to.be.equal(-123.959679);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].Longitude).to.be.equal(-123.959732);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].Longitude).to.be.equal(-123.958723);
    });

    it('and constant value to mapping', () => {
        
        var source = {
            rss: {
                channel: {
                    link: {
                        href: 'https://myblog.org/feed/'
                    }
                }
            }
        };

        var output =
            from('rss.channel.link')
            .to('feed.link')
            .with(
                 from('href').to('href')
                .constant('alternate').to('rel')
                .constant('text/html').to('type'))
            .map(source);

        expect(output.feed.link.href).to.be.equal('https://myblog.org/feed/');
        expect(output.feed.link.rel).to.be.equal('alternate');
        expect(output.feed.link.type).to.be.equal('text/html');
    });
});
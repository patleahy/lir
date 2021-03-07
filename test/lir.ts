import { expect } from 'chai';
import { Lir } from '../src/lir';

describe('Lir', () => {

    it('single shallow property mapping', () => {
        var source = { name: 'My Blog' };
        
        var lir = Lir();
        lir.from('name').to('title');
        var output = lir.map(source);

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
        
        var lir = Lir();
        lir.from('rss.channel.title').to('feed.title.#text');
        var output = lir.map(source);

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

        var lir = Lir()
        lir.from('gpx.trk.trkseg.trkpt')
           .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint');
        var output = lir.map(source);

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
                    description: "The very interesting things I do."
                }
            }
        };

        var lir = Lir();
        lir.from('rss.channel.title').to('feed.title.text');
        lir.from('rss.channel.description').to('feed.subtitle.text');
        var output = lir.map(source);

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

        var lir = Lir();
        lir.from('rss.channel.title').to('feed.title.text');
        lir.from('rss.channel.link.href').to('feed.link.href');
        var output = lir.map(source);

        expect(output.feed.title.text).to.be.equal('My Blog');
        expect(output.feed.link.href).to.be.equal('http://myspace.com/pat');
    });

    it("child mapping using with", () => {
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

        var lir = Lir();
        lir.from('rss.channel').to('feed')
            .with('title').to('title.text');
        
        var output = lir.map(source);
        expect(output.feed.title.text).to.be.equal('My Blog');
    });


    it("child mapping using with and and", () => {
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

        var lir = Lir();
        lir.from('rss.channel').to('feed')
            .with('title').to('title.text')
            .and('link.href').to('link.href');
        
        var output = lir.map(source);
        expect(output.feed.title.text).to.be.equal('My Blog');
    });

    it("child mapping using two with/and blocks", () => {
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

        var lir = Lir()
        lir.from('gpx').to('TrainingCenterDatabase')
                .with('trk').to('Courses')
                    .with('trkseg.trkpt').to('Course.Track.Trackpoint');

        var output = lir.map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lat).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lat).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lat).to.be.equal(45.838526);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lon).to.be.equal(-123.959679);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lon).to.be.equal(-123.959732);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lon).to.be.equal(-123.958723);
    });

    it("map array", () => {

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

        var lir = Lir()
        lir.from('gpx.trk.trkseg.trkpt').each()
            .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint');

        var output = lir.map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lat).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lat).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lat).to.be.equal(45.838526);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].lon).to.be.equal(-123.959679);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].lon).to.be.equal(-123.959732);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].lon).to.be.equal(-123.958723);
    });

    it("map property inside array", () => {

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

        var lir = Lir()
        lir.from('gpx.trk.trkseg.trkpt').each()
            .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
            .with('lat').to('Latitude')

        var output = lir.map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].Latitude).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].Latitude).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].Latitude).to.be.equal(45.838526);
    });


    it("map two properties inside array", () => {

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

        var lir = Lir()
        lir.from('gpx.trk.trkseg.trkpt').each()
            .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
                .with('lat').to('Latitude')
                .and('lon').to('Longitude')

        var output = lir.map(source);

        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].Latitude).to.be.equal(45.839295);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].Latitude).to.be.equal(45.838555);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].Latitude).to.be.equal(45.838526);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[0].Longitude).to.be.equal(-123.959679);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[1].Longitude).to.be.equal(-123.959732);
        expect(output.TrainingCenterDatabase.Courses.Course.Track.Trackpoint[2].Longitude).to.be.equal(-123.958723);
    });
});
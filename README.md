# Lir

*A DSL for describing the conversion of data in one schema into another.*

Pat Leahy - pat@patleahy.com

## Documents

| Name                                                                                                          | Url                                                                                       |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Design Document](DESIGN.md)                                                                                  | https://bitbucket.org/patleahy/lir/src/0535c88ef6de10041a1559eb0c1678ad65da3020/DESIGN.md |

## Source Code

Here are the important source files:

| File                               | Description                                                                |
| ---------------------------------- | -------------------------------------------------------------------------- |
| [src/lir.ts](src/lir.ts)           | The implementation of the Lir DSL.                                         |
| [test/lir.ts](test/lir.ts)         | Tests of the DSL methods.                                                  |
| [src/gpx2tcx.ts](src/gpx2tcx.ts)   | Lir rules which maps from a GPX format to TCX format.                      |
| [src/rss2atom.ts](src/rss2atom.ts) | Lir rules which maps from a RSS format to Atom format.                     |
| [src/lir-cli.tcs](src/lir-cli.ts ) | A command line script for using gpx2tcx and rss2atom to convert XML files. |

## Command Line Usage

To convert a [GPX (GPS Exchange Format)](https://www.topografix.com/gpx.asp) to [TCX (Training Center XML)](https://en.wikipedia.org/wiki/Training_Center_XML) run:
```
npm run cli gpx2tcs <input.gpx> <output.tcx>
```

To convert an RSS file to Atom:
```
npm run cli rss2atom <input.rss> <output.atom>
```

To run the tests:
```
npm run test
```

## Language Usage

These examples will show the Lir code to convert from an example input structure to an output structure. A simple rule specifics a `to` property and a `from` property. Rules are executed by calling `map` on the rule, passing in a source object. The transformed output object is returned.

### Simple example

To map a property from input to output:

*Input*
```js
{
    'rss': {
        'channel': {
            'title': 'My Blog'
        }
    }
}
```

*Code*
```ts
var output = from('rss.channel.title').to('feed.title.#text').map(source);
```

*Output*
```js
{
    'feed': {
        'title': {
            'text': 'My Blog'
        }
    }
}
```

### Multiple properties

You can map multiple properties:

*Input*
```js
{
    'rss': {
        'channel': {
            'title': 'My Blog',
            'description': 'The very interesting things I do.'
        }
    }
}
```

*Code*
```ts
var output = 
     from('rss.channel.title').to('feed.title.text')
    .from('rss.channel.description').to('feed.subtitle.text')
    .map(source);
```

*Output*
```js
{
    'feed': {
      'title': {
        'text': 'My Blog',
      },
      'subtitle': {
        'text': 'The very interesting things I do.'
      }
    }
}
```

### Missing properties

Properties you include in the mapping rules which are not contained in the input will be ignored and not result in an exception. For example, the property `rss.category.title` does not exist in the input. The other properties are successfully mapped.

*Input*
```js
{
    'rss': {
        'channel': {
            'title': 'My Blog'
        }
    }
}
```

*Code*
```ts
var output = 
     from('rss.channel.title').to('feed.title.text')
    .from('rss.category.title').to('feed.category.text')
    .map(source)
```

*Output*
```js
{
    'feed': {
        'title': {
            'text': 'My Blog'
        }
    }
}
```

### With keyword

You can use the `with` keyword to specify mappings which are scoped to the parent rule. In the next example `rss.channel` will be mapped to `feed`. How the mapping is done is specified using the rules inside the `with` method.

*Input*
```js
{
    'rss': {
        'channel': {
            'title': 'My Blog',
            'link': {
                'href': 'http://myspace.com/pat',
            }
        }
    }
}
```

*Code*
```ts
var output = 
     from('rss.channel').to('feed')
    .with(
         from('title').to('title.text')
        .from('link.href').to('link.href'))
    .map(source);
```

*Output*
```js
{
    'feed': {
        'title': {
            'text': 'My Blog',
            'href': 'http://myspace.com/pat'
        }
    }
}
```

### Nested with blocks

You can nest `with` scopes inside other `with` scopes:

*Input*
```js
{
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
}
```

*Code*
```ts
var output = 
     from('gpx').to('TrainingCenterDatabase')
    .with(
         from('trk').to('Courses')
        .with(
            from('trkseg.trkpt').to('Course.Track.Trackpoint')))
    .map(source);
```

*Output*
```js
{
    TrainingCenterDatabase: {
        Courses: {
            Course: {
                Track: {
                    Trackpoint: [
                        { lat: 45.839295, lon: -123.959679 },
                        { lat: 45.838555, lon: -123.959732 },
                        { lat: 45.838526, lon: -123.958723 }
                    ]
                }
            }
        }
    }
}
```

### Arrays using the `each` keyword

In the previous example the property `trkpt` in the input contained an array. This value is copied to the output `Trackpoint`. These array values are not treated any differently than if they were strings.

If you need to map the values inside the array to a different output structure you must use the `each` keyword to specify rules which will be applied to each item in the input array.

*Input*
```js
{
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
}
```

*Code*
```ts
var output = 
     from('gpx.trk.trkseg.trkpt')
    .each()
    .to('TrainingCenterDatabase.Courses.Course.Track.Trackpoint')
    .with(
         from('lat').to('Latitude')
        .from('lon').to('Longitude'))
    .map(source);
```

*Output*
```js
{
    TrainingCenterDatabase: {
        Courses: {
            Course: {
                Track: {
                    Trackpoint: [
                        { Latitude: 45.839295, Longitude: -123.959679 },
                        { Latitude: 45.838555, Longitude: -123.959732 },
                        { Latitude: 45.838526, Longitude: -123.958723 }
                    ]
                }
            }
        }
    }
}
```

### Including literal values

You can include literal values in the output by appending the `include` keyword to a rule. 

*Input*
```js
{
    rss: {
        channel: {
            link: {
                href: 'https://myblog.org/feed/'
            }
        }
    }
}
```

*Code*
```ts
var output =
     from('rss.channel.link.href').to('feed.link.href')
    .include({ 'rel' : 'alternate', 'type' : 'text/html' }).to('feed.link')
    .map(source);
```

*Output*
```js
{
    feed: {
        link: {
            href: 'https://myblog.org/feed/',
            rel : 'alternate',
            type : 'text/html'
        }
    }
}
```

### Using custom functions

You can specify a function to modify the input value of a property before it is set in the output property by inserting the `using` method between the `from` and `to` path of a rule.

This example inserts a function to convert the format of a date time string.

*Input*
```js
{
    rss: {
        channel: {
            lastBuildDate: '11/25/2020',
        }
    }
}
```

*Code*
```ts
const dateConvert = (dt) => (new Date(dt)).toISOString();

var output = from('rss.channel.lastBuildDate')
            .using(dateConvert)
            .to('feed.updated')
            .map(source);
```

*Output*
```js
{
    feed: {
        updated: '2020-11-25T00:00:00.000Z'
    }
}
```

/**
 * A command line script for using gpx2tcx and rss2atom to convert XML files.
 * 
 * To convert a GPX (GPS Exchange Format) to [TCX (Training Center XML) run:
 * 
 *      npm run cli gpx2tcs <input.gpx> <output.tcx>
 *
 * To convert an RSS file to Atom:
 * 
 *      npm run cli rss2atom <input.rss> <output.atom>
 */
import parser = require('fast-xml-parser');
import fs = require('fs');
import rss2atom = require('./rss2atom');
import gpx2tcx = require('./gpx2tcx');

function main(argv: string[]) {
    const outputPath = argv.pop();
    const inputPath = argv.pop();
    const fileType = argv.pop();

    var rules = fileType === 'gpx' ? gpx2tcx.rules : rss2atom.rules;
    
    const parserOptions = { 
        attributeNamePrefix: '@_',
        ignoreAttributes : false 
    };
    
    const xmlIn = fs.readFileSync(inputPath, 'utf8');
    const objIn = parser.parse(xmlIn, parserOptions);
    const objOut = rules.map(objIn);
    const xmlOut = (new parser.j2xParser(parserOptions)).parse(objOut);
    fs.writeFileSync(outputPath, xmlOut, 'utf8');

    console.log(`${fileType}: ${inputPath} -> ${outputPath}`);
}

main(process.argv);
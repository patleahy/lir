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

    console.log(objOut);
    console.log(xmlOut);

    console.log(`${fileType}: ${inputPath} -> ${outputPath}`);
}

main(process.argv);
import parser = require('fast-xml-parser');
import fs = require('fs');
import rss2atom = require('./rss2atom');

function main(argv: string[]) {
    const outputPath = argv.pop();
    const inputPath = argv.pop();
    
    const parserOptions = { 
        attributeNamePrefix: '@_',
        ignoreAttributes : false 
    };
    const xmlIn = fs.readFileSync(inputPath, 'utf8');
    const objIn = parser.parse(xmlIn, parserOptions);
    const objOut = rss2atom.rules.map(objIn);
    const xmlOut = (new parser.j2xParser(parserOptions)).parse(objOut);
    fs.writeFileSync(outputPath, xmlOut, 'utf8');

    console.log(objOut);
    console.log(xmlOut);

    console.log(`${inputPath} -> ${outputPath}`);
}

main(process.argv);
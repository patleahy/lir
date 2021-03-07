import parser = require('fast-xml-parser');
import fs = require('fs');

function main(argv: string[]) {
    const outputPath = argv.pop();
    const inputPath = argv.pop();
    
    const parserOptions = { ignoreAttributes : false };
    const xmlIn = fs.readFileSync(inputPath, 'utf8');
    const obj = parser.parse(xmlIn, parserOptions);
    const xmlOut = (new parser.j2xParser(parserOptions)).parse(obj);
    fs.writeFileSync(outputPath, xmlOut, 'utf8');

    console.log(`${inputPath} -> ${outputPath}`);
}

main(process.argv);
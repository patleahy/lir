# Lir Examples

The XML files are examples of pairs of file types which are semantically similar.

`wolfram.atom` and `wolfram.rss` are syndication feeds saved https://blog.wolfram.com at the same time.

`bikeride.gpx` and `bikeride.txc` are the same bike ride downloaded from the *Ride With GPS* website.

Each of the file above was converted to a `json` file to demonstrate an the in memory data model for each file type in TypeScript. These files were created using the following code:

```ts
import parser = require('fast-xml-parser');
import fs = require("fs");

const xml = fs.readFileSync(filename, 'utf8');
const obj = parser.parse(xml, { ignoreAttributes : false });
```
/**
 * Lir rules which maps from a RSS format to Atom format.
 */
import { from } from './lir';

const typeText = { '@_type' : 'text' };
const typeHtml = { '@_type' : 'html' };
const altHtml  = { '@_type' : 'text/html', '@_rel' : 'alternate' };

export const rules = from('rss.channel').to('feed')
    .with(
         from('title').to('title.#text')
        .include(typeText).to('title')
        .from('description').to('subtitle.#text')
        .include(typeText).to('subtitle')
        .from('link.@_href').to('link.@_href')
        .include(altHtml).to('link')
    );

rules
    .from('rss.channel.item').each().to('feed.entry')
    .with(
         from('title').to('title._cdata_')
        .include(typeHtml).to('title')
        .from('dc:creator._cdata_').to('author.name')
        .from('description._cdata_').to('summary._cdata_')
        .include(typeHtml).to('summary')
        .from('content:encoded._cdata_').to('content._cdata_')
        .include(typeHtml).to('content')
    );
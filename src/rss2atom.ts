import { from } from './lir';

var typeText = { '@_type' : 'text' };
var typeHtml = { '@_type' : 'html' };

export const rules = from('rss.channel').to('feed')
    .with(
         from('title').to('title.#text').include(typeText)
        .from('description').to('subtitle.#text').include(typeText)
        .from('link').to('link')
        .with(
             from('@_href').to('@_href')
            .include({
                'rel' : 'alternate',
                'type' : 'text/html'
             })
        )
    );

rules
    .from('rss.channel.item').each().to('feed.entry')
    .with(
         from('title').to('title.#text').include(typeHtml)
        .from('dc:creator').to('author.name')
        .from('description').to('summary.#text').include(typeHtml)
        // .from('content:encoded').to('content.#text')
    );
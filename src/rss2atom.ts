import { Lir } from './lir';

export const rules = Lir()
    .from('rss.channel').to('feed')
    .with(Lir()
        .from('title').to('title.#text').constant('test').to('@_type')
        .from('description').to('subtitle.#text').constant('test').to('@_type')
        .from('link').to('link')
        .with(Lir()
            .from('@_href').to('@_href')
            .constant('alternate').to('@_rel')
            .constant('text/html').to('@_type')
        )
    );

rules
    .from('rss.channel.item').each().to('feed.entry')
    .with(Lir()
        .from('title').to('title.#text').constant('html').to('@_type')
        .from('dc:creator').to('author.name')
        .from('description').to('summary.#text').constant('html').to('@_type')
        // .from('content:encoded').to('content.#text')
    );
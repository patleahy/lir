import { Lir } from './lir';

export const rules = Lir();

rules.from('rss.channel').to('feed')
    .with('title').to('title.#text')
    .and('atom:link').to('link')
        .with('@_href').to('@_href')
        .constant('alternate').to('@_rel')
        .constant('text/html').to('@_type');

        
        



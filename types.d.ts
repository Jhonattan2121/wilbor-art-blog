import type { marked } from 'marked';declare module 'marked' {  function marked(text: string, options?: marked.MarkedOptions): string;    namespace marked {    function parse(text: string, options?: MarkedOptions): string;        interface MarkedOptions {
      baseUrl?: string;
      breaks?: boolean;
      gfm?: boolean;
      headerIds?: boolean;
      headerPrefix?: string;
      langPrefix?: string;
      mangle?: boolean;
      pedantic?: boolean;
      sanitize?: boolean;
      silent?: boolean;
      smartLists?: boolean;
      smartypants?: boolean;
      xhtml?: boolean;
    }
  }
  
  export = marked;
}
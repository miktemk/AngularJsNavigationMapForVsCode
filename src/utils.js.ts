
// https://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
export function snakeToCamel(s: string): string {
    return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
}
export function camelToSnake(s: string):string {
    return s.replace(/([A-Z0-9])/g, function($1){return "-"+$1.toLowerCase();});
}

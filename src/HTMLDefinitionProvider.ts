import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {DefinitionProviderBase} from './DefinitionProviderBase';
import {CodeNavigCacheProvider} from './CodeNavigCache';

const HTML_TAGS: string[] = [
    'html', 'head', 'body',
    'script', 'style',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'p', 'a', 'img', 'span', 'strong', 'em',
    'table', 'thead', 'tbody', 'th', 'tr', 'td',
    'ul', 'li', 'ol', 'dl', 'dt', 'dd',
    'form', 'input', 'label', 'button',
    'class', 'id', 'src', 'href',
    'click', 'mousemove',
];

export class HTMLDefinitionProvider extends DefinitionProviderBase {

    constructor(navigDataProvider: CodeNavigCacheProvider) {
        super(navigDataProvider);
    }

    // private regexSnake = new RegExp(`[a-zA-Z0-9_-]*`);
    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let range = document.getWordRangeAtPosition(position); //, this.regexSnake);
            let word = document.getText(range);

            if (HTML_TAGS.findIndex(tag => tag === word.toLowerCase()) >= 0) {
                // console.log(`${word} is html tag.`);
                resolve();
            }

            let cachedMatch = this.findCachedMatch(document, position);
            if (cachedMatch) {
                resolve(cachedMatch);
                return;
            }

            var fileDir = path.dirname(document.fileName);
            //let fileDirRelative = path.relative(vscode.workspace.rootPath, fileDir);
            let filesLocalAll = fs.readdirSync(fileDir);
            var filesLocalJS = filesLocalAll.filter(x => x.endsWith('.js') && !x.endsWith('.spec.js'));
            
            let foundDef= false;

            Promise.all(filesLocalJS.map(jsFile => {
                let jsFileFullPath = path.join(fileDir, jsFile);
                return vscode.workspace.openTextDocument(jsFileFullPath).then((jsDoc) => {
                    let allText = jsDoc.getText();
                    let indexOfScopeDot = -1;

                    // plan A: try to find in scope { ... } AKA: https://regex101.com/r/jUuDt3/2
                    var regex = new RegExp(`scope:\\s*{[^}]*(${word})[^}]*}`, 'g');
                    var matchDirScope = regex.exec(allText);
                    if (matchDirScope && matchDirScope.length > 1) {
                        indexOfScopeDot = matchDirScope.index + matchDirScope[0].indexOf(matchDirScope[1]); //TODO: index bug here
                    }

                    // plan B: find a scope.myvar construct
                    if (indexOfScopeDot == -1) {
                        indexOfScopeDot = allText.indexOf('scope.' + word);
                    }
                    
                    if (indexOfScopeDot == -1)
                        return;
                    
                    foundDef = true;
                    let jsUri = vscode.Uri.file(jsFileFullPath);
                    let targetPosition = jsDoc.positionAt(indexOfScopeDot + 6); // + 6 to compensate for "scope."
                    resolve(new vscode.Location(jsUri, targetPosition));
                }, (error) => {
                    // something bad happened, could not load WS file
                });
            })).then(() => {
                if (!foundDef)
                    resolve();
            });
        });
    }
}
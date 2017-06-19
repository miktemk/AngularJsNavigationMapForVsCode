import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';

export class CodeNavigEntry {
    value: string;
    occurences: string[];
    type: string;
    position: vscode.Position;
    positionFile: string;
}

export class CodeNavigCacheProvider {

    private entries: CodeNavigEntry[] = [];

    public getNavigData():CodeNavigEntry[] {
        return this.entries;
    }

    public rebuild():Thenable<void> {
        return new Promise<void>((finalResolve, finalReject) => {
            this.clearCache();
            vscode.workspace.findFiles('www/**/*.js', 'www/vendor/**').then(wsFiles => {
                var promise = Promise.all(wsFiles.map(wsFile => {
                    var relativePath = path.relative(vscode.workspace.rootPath, wsFile.fsPath);
                    return vscode.workspace.openTextDocument(wsFile.path).then((wsDoc) => {
                        let allText = wsDoc.getText();
                        
                        this.tryToAddSymbolToCache(relativePath, wsDoc, allText, 'directive', `.directive('`);
                        this.tryToAddSymbolToCache(relativePath, wsDoc, allText, 'service', `.service('`);
                        this.tryToAddSymbolToCache(relativePath, wsDoc, allText, 'factory', `.factory('`);
                        this.tryToAddSymbolToCache(relativePath, wsDoc, allText, 'constant', `.constant('`);
                        this.tryToAddSymbolToCache(relativePath, wsDoc, allText, 'controller', `.controller('`);

                    }, (error) => {
                        // something bad happened, could not load WS file
                        finalReject();
                    });
                })).then(() => {
                    console.log('cache is rebuilt');
                    let cacheJsonFile = this.getCacheFilename();
                    fs.writeFile(cacheJsonFile, JSON.stringify(this.entries, null, '  '), (errorMaybe) => {
                        // if errorMaybe != null something bad happened, could not write to a cache file!!
                        if (errorMaybe)
                            finalReject();
                    });
                }).then(() => {
                    finalResolve();
                });
            });
        });
    }

    public reloadFromCache():Thenable<void> {
        return new Promise<void>((finalResolve, finalReject) => {
            let cacheJsonFile = this.getCacheFilename();
            fs.exists(cacheJsonFile, (fileExists) => {
                if (!fileExists){
                    finalReject('ENOENT');
                    return;
                }

                fs.readFile(cacheJsonFile, null, (errorMaybe, data) => {
                    if (errorMaybe) {
                        finalReject();
                        return;
                    }
                    try {
                        var rawJsonObject:CodeNavigEntry[] = JSON.parse(data, (key, value) => {
                            // NOTE: revival function is the only way to convert rawJSON to a TypeScript class unless a 3rd party serialization lib is used
                            if (key == 'position')
                                return new vscode.Position(value.line, value.character);
                            else
                                return value;
                        });
                        this.entries = rawJsonObject;
                        if (!this.entries) {
                            this.entries = [];
                            finalReject();
                            return;
                        }
                        finalResolve();
                    }
                    catch (parseException) {
                        finalReject();
                    }
                });
            });
        });
    }

    private getCacheFilename():string {
        return path.join(vscode.workspace.rootPath, '.vscode/angularjs-navig-cache.json');
    }
    private clearCache() {
        this.entries = [];
    }
    private tryToAddSymbolToCache(fileRelativePath, wsDoc, allText, symbolType, prefix) {
        let indexOfSymbol = allText.indexOf(prefix);
        if (indexOfSymbol != -1)
        {
            var wordPosition = wsDoc.positionAt(indexOfSymbol + prefix.length);
            var wordRange = wsDoc.getWordRangeAtPosition(wordPosition);
            var symbol = wsDoc.getText(wordRange);
            var kebabCased = utils.camelToSnake(symbol);
            
            var occurences = [symbol];
            // TODO: this shit should be configurable
            if (symbolType == 'directive')
                occurences = [`<${kebabCased}`, `</${kebabCased}`];
            else if (['constant', 'factory', 'service'].find(x => x == symbolType))
                occurences = [`'${symbol}'`];
            else if (symbolType == 'controller')
                occurences = [`controller: '${symbol}'`];

            this.entries.push({
                type: symbolType,
                value: symbol,
                occurences: occurences,
                position: wordPosition,
                positionFile: fileRelativePath
            });
        }
    }
}
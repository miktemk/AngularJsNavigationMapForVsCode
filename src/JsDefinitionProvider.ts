import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {DefinitionProviderBase} from './DefinitionProviderBase';
import {CodeNavigCacheProvider} from './CodeNavigCache';

export class JsDefinitionProvider extends DefinitionProviderBase {

    constructor(navigDataProvider: CodeNavigCacheProvider) {
        super(navigDataProvider);
    }

    private regexInQuotes = new RegExp(`('|")[a-zA-Z0-9_]*('|")`);
    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let range = document.getWordRangeAtPosition(position, this.regexInQuotes);
            if (!range) {
                resolve();
                return;
            }

            let cachedMatch = this.findCachedMatch(document, position);
            if (cachedMatch) {
                resolve(cachedMatch);
                return;
            }
      
            resolve();
        });
    }
}
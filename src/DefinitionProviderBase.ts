import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {CodeNavigCacheProvider} from './CodeNavigCache';

export abstract class DefinitionProviderBase implements vscode.DefinitionProvider {

    protected navigDataProvider:CodeNavigCacheProvider;

    constructor(navigDataProvider: CodeNavigCacheProvider) {
        this.navigDataProvider = navigDataProvider;
    }

    protected findCachedMatch(document: vscode.TextDocument, position: vscode.Position):vscode.Location {
        let navigData = this.navigDataProvider.getNavigData();
        let wordRange = document.getWordRangeAtPosition(position); //, this.regexSnake);
        let wordValue = document.getText(wordRange);

        let matchingEntries = navigData.filter(navigEntry => {
            var matchingEntryOccurences = navigEntry.occurences.filter(occurence => {
                var indexOfWord = occurence.indexOf(wordValue);
                if (indexOfWord == -1)
                    return false;
                var occurenceMaybeInDocViaOffsets = document.getText(new vscode.Range(wordRange.start.translate(0, -indexOfWord), wordRange.start.translate(0, -indexOfWord + occurence.length)));
                return occurenceMaybeInDocViaOffsets == occurence;
            });
            return matchingEntryOccurences.length > 0;
        });

        if (matchingEntries.length > 0) {
            var entry1 = matchingEntries[0];
            let targetFullPath = path.join(vscode.workspace.rootPath, entry1.positionFile);
            let targetUri = vscode.Uri.file(targetFullPath);
            return new vscode.Location(targetUri, entry1.position);
        }

        return null;
    }

    public abstract provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.Location>;
}
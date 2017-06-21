import * as vscode from 'vscode';
import * as path from 'path';
import { IMultipleOccurences, NavigPosition } from "./CodeNavigCache";

export class CodeNavigUtils {


    public static findCachedMatch<T extends IMultipleOccurences>(document: vscode.TextDocument, position: vscode.Position, navigData:T[]):T {
        //let navigData = this.navigDataProvider.getNavigData();
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
            return entry1;
        }

        return null;
    }

    public static NavigPosition2vscodeLocation(pos:NavigPosition) {
        let targetFullPath = path.join(vscode.workspace.rootPath, pos.filePath);
        let targetUri = vscode.Uri.file(targetFullPath);
        return new vscode.Location(targetUri, pos.position);
    }
}

import * as vscode from 'vscode';
import * as path from 'path'
import * as fs from 'fs'

export class JsDefinitionProvider implements vscode.DefinitionProvider {

    private regexInQuotes = new RegExp(`('|")[a-zA-Z0-9_]*('|")`);
    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let range = document.getWordRangeAtPosition(position, this.regexInQuotes);
            if (!range) {
                resolve();
                return;
            }

            let word = document.getText(range);
            console.log(`TODO: resolve ${word}`);
            resolve();
            
            /*
            var fileDir = path.dirname(document.fileName);
            //let fileDirRelative = path.relative(vscode.workspace.rootPath, fileDir);
            let filesLocalAll = fs.readdirSync(fileDir);
            var filesLocalJS = filesLocalAll.filter(x => x.endsWith('.js') && !x.endsWith('.spec.js'));
            
            let foundDef= false;

            Promise.all(filesLocalJS.map(jsFile => {
                let jsFileFullPath = path.join(fileDir, jsFile);
                return vscode.workspace.openTextDocument(jsFileFullPath).then((jsDoc) => {
                    let allText = jsDoc.getText();
                    let indexOfScopeDot = allText.indexOf('scope.' + word);
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
            //*/
        });
    }
}
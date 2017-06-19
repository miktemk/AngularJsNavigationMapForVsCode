'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path'
import * as fs from 'fs'


const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };

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

class HTMLDefinitionProvider implements vscode.DefinitionProvider {

    // private regexSnake = new RegExp(`[a-zA-Z0-9_-]*`);
    // private snakeToCamel(s: string){
    //     return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
    // }

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let range = document.getWordRangeAtPosition(position); //, this.regexSnake);
            let word = document.getText(range);

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
            
/*
            // check word as function or property.
            if (HTML_TAGS.findIndex(tag => tag === word.toLowerCase()) >= 0) {
                // console.log(`${word} is html tag.`);
                resolve();
            }

            // if next character is '(', so word is function
            if (document.getText(new vscode.Range(range.end, range.end.translate(0, 1))) === '(') {
                wordType = 1;
            }
            // console.log(`wordType: ${wordType}`);

            let pattern: string;
            if (wordType === 0) {               // property
                pattern = `^\\s*(private\\s+)?(${word})|^\\s*(public\\s+)?(${word})|^\\s*(protected\\s+)?(${word})`;
            }
            else {                              // function
                pattern = `^\\s*(private\\s+)?(${word})\\(.*\\)|^\\s*(public\\s+)?(${word})\\(.*\\)|^\\s*(protected\\s+)?(${word})\\(.*\\)`;
            }
            let rgx = new RegExp(pattern);

            // find function|property in ts
            let htmlFile = document.fileName;
            let fileNameWithoutExtension = htmlFile.slice(0, htmlFile.lastIndexOf('.'));
            let tsFile = fileNameWithoutExtension + '.ts';
            let tsUri = vscode.Uri.file(tsFile);
            let enterClass = false;

            vscode.workspace.openTextDocument(tsFile).then((tsDoc) => {

//tsDoc.getText()

                let lineCount = tsDoc.lineCount;
                for (var li = 0; li < tsDoc.lineCount; li++) {
                    let line = tsDoc.lineAt(li);
                    if (line.isEmptyOrWhitespace) {
                        continue;
                    }
                    if (!enterClass) {
                        if (line.text.match(/\s+class\s+/)) {
                            enterClass = true;
                        }
                        continue;
                    }

                    let m = line.text.match(rgx);
                    if (m && m.length > 0)
                    {
                        let pos = line.text.indexOf(word);
                        resolve(new vscode.Location(tsUri, new vscode.Position(li, pos)));
                    }
                }
                resolve();
            });
            //*/
        });
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your shitty extension is now active!');

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            HTML_MODE, new HTMLDefinitionProvider())
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}
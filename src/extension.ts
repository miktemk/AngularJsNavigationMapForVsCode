'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path'
import * as fs from 'fs'
import { HTMLDefinitionProvider } from './HTMLDefinitionProvider'
import { JsDefinitionProvider } from './JsDefinitionProvider'


const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };
const JS_MODE: vscode.DocumentFilter = { language: 'javascript', scheme: 'file' };

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


// https://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
function snakeToCamel(s: string):string {
    return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
}
function camelToSnake(s: string):string {
    return s.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
}

function tryToAddSymbolToCache(wsDoc, allText, symbolType, prefix) {
    let indexOfSymbol = allText.indexOf(prefix);
    if (indexOfSymbol != -1)
    {
        var wordPosition = wsDoc.positionAt(indexOfSymbol + prefix.length);
        var wordRange = wsDoc.getWordRangeAtPosition(wordPosition);
        var symbol = wsDoc.getText(wordRange);
        var kebabCased = camelToSnake(symbol);
        console.log(`TODO: add ${symbolType}: ${symbol} (${kebabCased})`);
    }
}

function miktemk_angularJSNavig_RebuidCache() {
    vscode.workspace.findFiles('www/**/*.js', 'www/vendor/**').then(wsFiles => {
        Promise.all(wsFiles.map(wsFile => {
            return vscode.workspace.openTextDocument(wsFile.path).then((wsDoc) => {
                let allText = wsDoc.getText();
                
                tryToAddSymbolToCache(wsDoc, allText, 'directive', `.directive('`);
                tryToAddSymbolToCache(wsDoc, allText, 'service', `.service('`);
                tryToAddSymbolToCache(wsDoc, allText, 'factory', `.factory('`);
                tryToAddSymbolToCache(wsDoc, allText, 'constant', `.constant('`);

            }, (error) => {
                // something bad happened, could not load WS file
            });
        })).then(() => {
            console.log('TODO: save to JSON');

            let cacheJsonFile = path.join(vscode.workspace.rootPath, '.vscode/miktemk-angularjs-navig-cache.json');
            fs.writeFile(cacheJsonFile, JSON.stringify({
                directives: ['a', 'b', 'c'],
                services: ['a', 'b', 'c'],
                factories: ['a', 'b', 'c']
            }, null, '  '), (errorMaybe) => {
                // if errorMaybe != null something bad happened, could not write to a cache file!!
            });

            // Display a message box to the user
            vscode.window.showInformationMessage('AangularJS Navigation cache rebuit!');
        });

    });
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

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            JS_MODE, new JsDefinitionProvider())
    );

    var disposable = vscode.commands.registerCommand('miktemk.angularJSNavig.RebuidCache', miktemk_angularJSNavig_RebuidCache);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
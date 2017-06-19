'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path'
import * as fs from 'fs'
import { HTMLDefinitionProvider } from './HTMLDefinitionProvider'
import { JsDefinitionProvider } from './JsDefinitionProvider'
import { CodeNavigCacheProvider } from './CodeNavigCache';


const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };
const JS_MODE: vscode.DocumentFilter = { language: 'javascript', scheme: 'file' };

let globalCacheProvider: CodeNavigCacheProvider = new CodeNavigCacheProvider();

function miktemk_angularJSNavig_RebuidCache() {
    globalCacheProvider.rebuild().then(() => {
        // Display a message box to the user
        vscode.window.showInformationMessage('AngularJS Navigation cache rebuit!');
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
            HTML_MODE, new HTMLDefinitionProvider(globalCacheProvider))
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            JS_MODE, new JsDefinitionProvider(globalCacheProvider))
    );

    var disposable = vscode.commands.registerCommand('miktemk.angularJSNavig.RebuidCache', miktemk_angularJSNavig_RebuidCache);

    globalCacheProvider.reloadFromCache().then(
        function (success) {},
        function (failed) {
            globalCacheProvider.rebuild().then(() => {
                // Display a message box to the user
                vscode.window.showInformationMessage('AngularJS Navigation cache rebuit!');
            });
        }
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}
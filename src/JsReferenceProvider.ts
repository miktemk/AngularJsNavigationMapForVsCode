import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {CodeNavigCacheProvider} from './CodeNavigCache';
import { CodeNavigUtils } from "./utils";

export class JsReferenceProvider implements vscode.ReferenceProvider {

    protected navigDataProvider:CodeNavigCacheProvider;

    constructor(navigDataProvider: CodeNavigCacheProvider) {
        this.navigDataProvider = navigDataProvider;
    }

    public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): Thenable<vscode.Location[]> {
        return new Promise((resolve, reject) => {
            let navigData = this.navigDataProvider.getNavigData();
            var match = CodeNavigUtils.findCachedMatch(document, position, navigData);

            if (match == null)
                resolve();

            let referencesVsLocations = match.cachedReferences.map(CodeNavigUtils.NavigPosition2vscodeLocation);
            resolve(referencesVsLocations);
        });
    }
}
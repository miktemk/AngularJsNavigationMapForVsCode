import * as vscode from 'vscode';
import { CodeNavigCacheProvider } from './CodeNavigCache';
import { CodeNavigUtils } from "./utils";

export abstract class DefinitionProviderBase implements vscode.DefinitionProvider {

    protected navigDataProvider:CodeNavigCacheProvider;

    constructor(navigDataProvider: CodeNavigCacheProvider) {
        this.navigDataProvider = navigDataProvider;
    }

    protected findCachedMatch(document: vscode.TextDocument, position: vscode.Position):vscode.Location {
        let navigData = this.navigDataProvider.getNavigData();
        var match = CodeNavigUtils.findCachedMatch(document, position, navigData);
        return (match != null)
            ? CodeNavigUtils.NavigPosition2vscodeLocation(match.definition)
            : null;
    }

    public abstract provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.Location>;
}
﻿### how to write a VSCode extension

 - https://code.visualstudio.com/docs/extensions/example-hello-world
 - https://code.visualstudio.com/docs/extensionAPI/vscode-api
 - https://stackoverflow.com/questions/35427666/how-to-implement-go-to-definition-extension-in-vscode
 - https://github.com/mrmlnc/vscode-less/blob/master/src/server.ts

tricks: https://github.com/Microsoft/vscode-tips-and-tricks

### hacking FindInFiles in VsCode source code (!!!)

so far the only usefuyl line is this bit, which happens on ENTER in searchWidget

    this.searchHistory.add(this.searchInput.getValue());

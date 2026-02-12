import * as vscode from 'vscode';

/**
 * Webview View Provider for the Testing Brain sidebar panel.
 * Reads brain data from the workspace and pushes to webview via postMessage.
 */
export class TestingBrainPanelProvider implements vscode.WebviewViewProvider {
    private view?: vscode.WebviewView;
    private watcher?: vscode.FileSystemWatcher;
    private ready = false;

    constructor(private readonly extensionUri: vscode.Uri) { }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview'),
            ],
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Listen for messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'ready':
                    this.ready = true;
                    await this.loadAndSendData();
                    this.setupWatcher();
                    break;
                case 'fetchTypeData':
                    await this.loadTypeData(message.testType);
                    break;
            }
        });

        webviewView.onDidDispose(() => {
            this.watcher?.dispose();
            this.ready = false;
        });
    }

    private setupWatcher() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        this.watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(folders[0], 'testing-brain/**/*.json')
        );

        const reload = () => this.loadAndSendData();
        this.watcher.onDidChange(reload);
        this.watcher.onDidCreate(reload);
        this.watcher.onDidDelete(reload);
    }

    private async loadAndSendData() {
        if (!this.view || !this.ready) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        const baseUri = vscode.Uri.joinPath(folders[0].uri, 'testing-brain');

        try {
            const progressData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'progress.json'));
            if (!progressData) return;

            const historyData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'execution_history.json'));
            const configData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'config.json'));

            this.view.webview.postMessage({
                type: 'brainState',
                data: {
                    progress: progressData,
                    history: historyData,
                    config: configData,
                    typeData: {},
                },
            });
        } catch (err) {
            console.error('Error loading brain data:', err);
        }
    }

    private async loadTypeData(type: string) {
        if (!this.view || !this.ready) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        const uri = vscode.Uri.joinPath(folders[0].uri, 'testing-brain', 'types', `${type}.json`);
        const data = await readJsonFile(uri);

        if (data) {
            this.view.webview.postMessage({
                type: 'typeData',
                testType: type,
                data,
            });
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const webviewUri = vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview');
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewUri, 'assets', 'index.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewUri, 'assets', 'index.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};" />
    <link rel="stylesheet" href="${styleUri}" />
    <title>Testing Brain</title>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}

async function readJsonFile(uri: vscode.Uri): Promise<any | null> {
    try {
        const raw = await vscode.workspace.fs.readFile(uri);
        return JSON.parse(Buffer.from(raw).toString('utf-8'));
    } catch {
        return null;
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

import * as vscode from 'vscode';

/**
 * Webview View Provider for the Testing Brain sidebar panel.
 * Reads brain data from the workspace and pushes to webview via postMessage.
 */
export class TestingBrainPanelProvider implements vscode.WebviewViewProvider {
    private view?: vscode.WebviewView;
    private watcher?: vscode.FileSystemWatcher;
    private ready = false;

    constructor(private readonly extensionUri: vscode.Uri, private readonly outputChannel: vscode.OutputChannel) { }

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
            this.outputChannel.appendLine(`[Panel] Received message: ${message.type}`);
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

        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(folders[0], '{.testing-brain,testing-brain,public/testing-brain}/**/*.json')
        );
        this.watcher = watcher;

        const reload = () => this.loadAndSendData();
        this.watcher.onDidChange(reload);
        this.watcher.onDidCreate(reload);
        this.watcher.onDidDelete(reload);
    }

    private async resolveBaseUri(folder: vscode.Uri): Promise<vscode.Uri | null> {
        const candidates = ['.testing-brain', 'testing-brain', 'public/testing-brain'];
        for (const c of candidates) {
            const uri = vscode.Uri.joinPath(folder, c);
            this.outputChannel.appendLine(`[Panel] Checking candidate path: ${uri.fsPath}`);
            try {
                const stat = await vscode.workspace.fs.stat(uri);
                if (stat.type === vscode.FileType.Directory) {
                    try {
                        await vscode.workspace.fs.stat(vscode.Uri.joinPath(uri, 'progress.json'));
                        this.outputChannel.appendLine(`[Panel] Found valid data directory: ${uri.fsPath}`);
                        return uri;
                    } catch {
                        this.outputChannel.appendLine(`[Panel] progress.json not found in ${uri.fsPath}`);
                    }
                }
            } catch {
                // ignore
            }
        }
        this.outputChannel.appendLine('[Panel] No valid data directory found');
        return null;
    }

    private async loadAndSendData() {
        if (!this.view || !this.ready) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            this.outputChannel.appendLine('[Panel] No workspace folders');
            return;
        }

        const baseUri = await this.resolveBaseUri(folders[0].uri);
        if (!baseUri) return;

        try {
            this.outputChannel.appendLine('[Panel] Loading data files...');
            const progressData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'progress.json'));
            if (!progressData) {
                this.outputChannel.appendLine('[Panel] Failed to load progress.json');
                return;
            }

            const historyData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'execution_history.json'));
            const configData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'config.json'));

            this.outputChannel.appendLine('[Panel] Sending brainState to webview');
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
            this.outputChannel.appendLine(`[Panel] Error loading data: ${err}`);
        }
    }

    private async loadTypeData(type: string) {
        if (!this.view || !this.ready) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        const baseUri = await this.resolveBaseUri(folders[0].uri);
        if (!baseUri) return;

        const uri = vscode.Uri.joinPath(baseUri, 'types', `${type}.json`);
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

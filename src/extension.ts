import * as vscode from 'vscode';
import { TestingBrainPanelProvider } from './TestingBrainPanel';

export function activate(context: vscode.ExtensionContext) {
    const provider = new TestingBrainPanelProvider(context.extensionUri);

    // Register Webview View Provider (sidebar)
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'testingBrain.dashboard',
            provider,
            { webviewOptions: { retainContextWhenHidden: true } }
        )
    );

    // Register command to open in editor panel
    context.subscriptions.push(
        vscode.commands.registerCommand('testingBrain.open', () => {
            const panel = vscode.window.createWebviewPanel(
                'testingBrain',
                'Testing Brain',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview'),
                    ],
                }
            );

            const brainDataProvider = new BrainDataProvider();
            setupWebviewPanel(panel.webview, context.extensionUri, brainDataProvider);

            panel.onDidDispose(() => {
                brainDataProvider.dispose();
            });
        })
    );
}

class BrainDataProvider {
    private watcher: vscode.FileSystemWatcher | undefined;
    private onDataChangeCallback: ((data: any) => void) | undefined;
    private disposed = false;

    async start(callback: (data: any) => void) {
        this.onDataChangeCallback = callback;
        await this.loadAndSend();
        this.setupWatcher();
    }

    private setupWatcher() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        this.watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(folders[0], 'testing-brain/**/*.json')
        );

        const reload = () => this.loadAndSend();
        this.watcher.onDidChange(reload);
        this.watcher.onDidCreate(reload);
        this.watcher.onDidDelete(reload);
    }

    private async loadAndSend() {
        if (this.disposed || !this.onDataChangeCallback) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        const baseUri = vscode.Uri.joinPath(folders[0].uri, 'testing-brain');

        try {
            // Load progress.json
            const progressData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'progress.json'));
            if (!progressData) return;

            // Load execution_history.json (optional)
            const historyData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'execution_history.json'));

            // Load config.json (optional)
            const configData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'config.json'));

            this.onDataChangeCallback({
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

    async loadTypeData(type: string) {
        if (this.disposed || !this.onDataChangeCallback) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        const uri = vscode.Uri.joinPath(folders[0].uri, 'testing-brain', 'types', `${type}.json`);
        const data = await readJsonFile(uri);

        if (data) {
            this.onDataChangeCallback({
                type: 'typeData',
                testType: type,
                data,
            });
        }
    }

    dispose() {
        this.disposed = true;
        this.watcher?.dispose();
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

function setupWebviewPanel(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    dataProvider: BrainDataProvider
) {
    webview.html = getWebviewHtml(webview, extensionUri);

    // Listen for messages from the webview
    webview.onDidReceiveMessage(async (message) => {
        switch (message.type) {
            case 'ready':
                await dataProvider.start((msg) => {
                    webview.postMessage(msg);
                });
                break;
            case 'fetchTypeData':
                await dataProvider.loadTypeData(message.testType);
                break;
        }
    });
}

function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const webviewUri = vscode.Uri.joinPath(extensionUri, 'dist', 'webview');
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

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function deactivate() {}

import * as vscode from 'vscode';
import { TestingBrainPanelProvider } from './TestingBrainPanel';

export function activate(context: vscode.ExtensionContext) {
    // Create output channel
    const outputChannel = vscode.window.createOutputChannel('Testing Brain');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('Testing Brain Extension Activated');

    const provider = new TestingBrainPanelProvider(context.extensionUri, outputChannel);

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
            outputChannel.appendLine('Command testingBrain.open triggered');
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

            const brainDataProvider = new BrainDataProvider(outputChannel);
            setupWebviewPanel(panel.webview, context.extensionUri, brainDataProvider, outputChannel);

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

    constructor(private readonly outputChannel: vscode.OutputChannel) {}

    async start(callback: (data: any) => void) {
        this.outputChannel.appendLine('BrainDataProvider started');
        this.onDataChangeCallback = callback;
        await this.loadAndSend();
        this.setupWatcher();
    }

    private setupWatcher() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        // Watch all possible locations
        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(folders[0], '{.testing-brain,testing-brain,public/testing-brain}/**/*.json')
        );
        this.watcher = watcher;

        const reload = () => this.loadAndSend();
        this.watcher.onDidChange(reload);
        this.watcher.onDidCreate(reload);
        this.watcher.onDidDelete(reload);
    }

    private async resolveBaseUri(folder: vscode.Uri): Promise<vscode.Uri | null> {
        const candidates = ['.testing-brain', 'testing-brain', 'public/testing-brain'];
        for (const c of candidates) {
            const uri = vscode.Uri.joinPath(folder, c);
            this.outputChannel.appendLine(`Checking candidate path: ${uri.fsPath}`);
            try {
                const stat = await vscode.workspace.fs.stat(uri);
                if (stat.type === vscode.FileType.Directory) {
                     // Check if progress.json exists to confirm it's a valid data dir
                    try {
                        await vscode.workspace.fs.stat(vscode.Uri.joinPath(uri, 'progress.json'));
                        this.outputChannel.appendLine(`Found valid data directory: ${uri.fsPath}`);
                        return uri;
                    } catch (e) {
                         this.outputChannel.appendLine(`progress.json not found in ${uri.fsPath}`);
                    }
                }
            } catch (e) {
                // ignore
            }
        }
        this.outputChannel.appendLine('No valid data directory found');
        return null;
    }

    private async loadAndSend() {
        if (this.disposed || !this.onDataChangeCallback) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            this.outputChannel.appendLine('No workspace folders');
            return;
        }

        const baseUri = await this.resolveBaseUri(folders[0].uri);
        if (!baseUri) return;

        try {
            this.outputChannel.appendLine('Loading data files...');
            // Load progress.json
            const progressData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'progress.json'));
            if (!progressData) {
                this.outputChannel.appendLine('Failed to load progress.json');
                return;
            }

            // Load execution_history.json (optional)
            const historyData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'execution_history.json'));

            // Load config.json (optional)
            const configData = await readJsonFile(vscode.Uri.joinPath(baseUri, 'config.json'));

            this.outputChannel.appendLine('Sending brainState to webview');
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
            this.outputChannel.appendLine(`Error loading brain data: ${err}`);
        }
    }

    async loadTypeData(type: string) {
        if (this.disposed || !this.onDataChangeCallback) return;

        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return;

        const baseUri = await this.resolveBaseUri(folders[0].uri);
        if (!baseUri) return;

        const uri = vscode.Uri.joinPath(baseUri, 'types', `${type}.json`);
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
    dataProvider: BrainDataProvider,
    outputChannel: vscode.OutputChannel
) {
    webview.html = getWebviewHtml(webview, extensionUri);

    // Listen for messages from the webview
    webview.onDidReceiveMessage(async (message) => {
        outputChannel.appendLine(`Received message from webview: ${message.type}`);
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

export function deactivate() { }

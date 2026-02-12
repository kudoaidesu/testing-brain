import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.')

    test('Extension should be present', () => {
        const extension = vscode.extensions.getExtension('kudoaidesu.testing-brain')
        assert.ok(extension, 'Extension should be installed')
    })

    test('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('kudoaidesu.testing-brain')
        assert.ok(extension)

        if (!extension.isActive) {
            await extension.activate()
        }

        assert.ok(extension.isActive, 'Extension should be activated')
    })

    test('Command testingBrain.open should be registered', async () => {
        const commands = await vscode.commands.getCommands(true)
        assert.ok(
            commands.includes('testingBrain.open'),
            'Command testingBrain.open should be registered'
        )
    })
})

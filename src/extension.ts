import * as vscode from 'vscode';
import * as path from 'path';

const TERMINAL_NAME = 'C++ Runner';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	console.log('Расширение "C++ Runner" активировано');

	const runCommand = vscode.commands.registerCommand('cpp-runner.run', runCurrentFile);
	const guardCommand = vscode.commands.registerCommand('cpp-runner.insertHeaderGuard', insertHeaderGuard);
	const classCommand = vscode.commands.registerCommand('cpp-runner.createClass', createClass);

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItem.text = '$(play) Run C++';
	statusBarItem.tooltip = 'Скомпилировать и запустить текущий файл (Ctrl+Alt+R)';
	statusBarItem.command = 'cpp-runner.run';
	updateStatusBar(vscode.window.activeTextEditor);

	const editorListener = vscode.window.onDidChangeActiveTextEditor(updateStatusBar);

	context.subscriptions.push(runCommand, guardCommand, classCommand, statusBarItem, editorListener);
}

export function deactivate() {
	console.log('Расширение "C++ Runner" деактивировано');
}

function updateStatusBar(editor: vscode.TextEditor | undefined) {
	if (editor && editor.document.fileName.endsWith('.cpp')) {
		statusBarItem.show();
	} else {
		statusBarItem.hide();
	}
}

async function runCurrentFile() {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !editor.document.fileName.endsWith('.cpp')) {
		vscode.window.showWarningMessage('Откройте файл .cpp, чтобы его запустить.');
		return;
	}

	await editor.document.save();

	const config = vscode.workspace.getConfiguration('cppRunner');
	const compiler = config.get<string>('compiler', 'g++');
	const standard = config.get<string>('standard', 'c++17');

	const filePath = editor.document.fileName;
	const folder = path.dirname(filePath);
	const fileName = path.basename(filePath);
	const programName = getProgramName(filePath, process.platform);

	const command = buildRunCommand(compiler, standard, fileName, programName, vscode.env.shell);

	vscode.window.terminals.find(t => t.name === TERMINAL_NAME)?.dispose();
	const terminal = vscode.window.createTerminal({ name: TERMINAL_NAME, cwd: folder });
	terminal.show();
	terminal.sendText(command);
}

export function getProgramName(filePath: string, platform: string): string {
	const name = path.parse(filePath).name;
	return platform === 'win32' ? `${name}.exe` : name;
}

export function buildRunCommand(compiler: string, standard: string, fileName: string,
	programName: string, shell: string): string {
	const compile = `${compiler} -std=${standard} -Wall "${fileName}" -o "${programName}"`;
	const shellName = shell.toLowerCase();

	if (shellName.includes('powershell') || shellName.includes('pwsh')) {
		return `${compile}; if ($?) { & ".\\${programName}" }`;
	}
	if (shellName.endsWith('cmd.exe')) {
		return `${compile} && "${programName}"`;
	}
	return `${compile} && "./${programName}"`;
}

async function insertHeaderGuard() {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !/\.(h|hpp)$/.test(editor.document.fileName)) {
		vscode.window.showWarningMessage('Откройте заголовочный файл .h или .hpp.');
		return;
	}

	const document = editor.document;
	const text = document.getText();
	const guard = makeGuardName(path.basename(document.fileName));

	if (text.includes('#pragma once') || text.includes(`#ifndef ${guard}`)) {
		vscode.window.showInformationMessage('В файле уже есть header guard.');
		return;
	}

	const ending = text.length > 0 && !text.endsWith('\n') ? '\n' : '';

	await editor.edit(editBuilder => {
		editBuilder.insert(new vscode.Position(0, 0), `#ifndef ${guard}\n#define ${guard}\n\n`);
		editBuilder.insert(document.positionAt(text.length), `${ending}\n#endif // ${guard}\n`);
	});
}

export function makeGuardName(fileName: string): string {
	return fileName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

async function createClass(folderUri?: vscode.Uri) {
	const folder = folderUri ?? vscode.workspace.workspaceFolders?.[0]?.uri;
	if (!folder) {
		vscode.window.showWarningMessage('Сначала откройте папку с проектом.');
		return;
	}

	const className = await vscode.window.showInputBox({
		prompt: 'Введите имя класса',
		placeHolder: 'Например: Point',
		validateInput: value => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value)
			? null
			: 'Имя должно начинаться с латинской буквы и содержать только буквы, цифры и _',
	});
	if (!className) {
		return;
	}

	const headerUri = vscode.Uri.joinPath(folder, `${className}.h`);
	const sourceUri = vscode.Uri.joinPath(folder, `${className}.cpp`);

	if (await fileExists(headerUri) || await fileExists(sourceUri)) {
		vscode.window.showErrorMessage(`Файлы класса ${className} уже существуют.`);
		return;
	}

	const encoder = new TextEncoder();
	await vscode.workspace.fs.writeFile(headerUri, encoder.encode(classHeader(className)));
	await vscode.workspace.fs.writeFile(sourceUri, encoder.encode(classSource(className)));

	await vscode.window.showTextDocument(headerUri);
	vscode.window.showInformationMessage(`Созданы файлы ${className}.h и ${className}.cpp`);
}

async function fileExists(uri: vscode.Uri): Promise<boolean> {
	try {
		await vscode.workspace.fs.stat(uri);
		return true;
	} catch {
		return false;
	}
}

export function classHeader(name: string): string {
	const guard = makeGuardName(`${name}.h`);
	return `#ifndef ${guard}
#define ${guard}

class ${name} {
public:
    ${name}();
    ~${name}();

private:
};

#endif // ${guard}
`;
}

export function classSource(name: string): string {
	return `#include "${name}.h"

${name}::${name}() {
}

${name}::~${name}() {
}
`;
}

import * as assert from 'assert';
import * as vscode from 'vscode';
import { buildRunCommand, classHeader, getProgramName, makeGuardName } from '../extension';

suite('C++ Runner', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('имя header guard', () => {
		assert.strictEqual(makeGuardName('math_utils.h'), 'MATH_UTILS_H');
		assert.strictEqual(makeGuardName('point-2d.hpp'), 'POINT_2D_HPP');
	});

	test('имя программы зависит от ОС', () => {
		assert.strictEqual(getProgramName('/lab/main.cpp', 'darwin'), 'main');
		assert.strictEqual(getProgramName('lab/main.cpp', 'win32'), 'main.exe');
	});

	test('команда запуска для разных терминалов', () => {
		assert.strictEqual(
			buildRunCommand('g++', 'c++17', 'main.cpp', 'main', '/bin/zsh'),
			'g++ -std=c++17 -Wall "main.cpp" -o "main" && "./main"');
		assert.strictEqual(
			buildRunCommand('g++', 'c++17', 'main.cpp', 'main.exe', 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'),
			'g++ -std=c++17 -Wall "main.cpp" -o "main.exe"; if ($?) { & ".\\main.exe" }');
		assert.strictEqual(
			buildRunCommand('g++', 'c++20', 'main.cpp', 'main.exe', 'C:\\Windows\\System32\\cmd.exe'),
			'g++ -std=c++20 -Wall "main.cpp" -o "main.exe" && "main.exe"');
	});

	test('заготовка класса', () => {
		const header = classHeader('Point');
		assert.ok(header.startsWith('#ifndef POINT_H\n#define POINT_H\n'));
		assert.ok(header.includes('class Point {'));
		assert.ok(header.endsWith('#endif // POINT_H\n'));
	});

	test('команды зарегистрированы', async () => {
		await vscode.extensions.getExtension('student.cpp-runner')?.activate();
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('cpp-runner.run'));
		assert.ok(commands.includes('cpp-runner.insertHeaderGuard'));
		assert.ok(commands.includes('cpp-runner.createClass'));
	});
});

# C++ Runner

Расширение для Visual Studio Code, которое упрощает работу с программами на C++.

## Возможности

- **Запуск C++ одной кнопкой** — компилирует открытый `.cpp` файл и сразу запускает программу во встроенном терминале.
- **Header guard** — добавляет в заголовочный файл защиту `#ifndef / #define / #endif`.
- **Создание класса** — создаёт файлы `Имя.h` и `Имя.cpp` с заготовкой класса.
- **Сниппеты** — шаблоны для типовых задач: `main`, цикл, работа с массивами, сортировка, бинарный поиск.
- **Настройки** — можно выбрать компилятор и стандарт C++.

## Требования

Нужен компилятор C++, который запускается из терминала:

- **macOS:** `xcode-select --install`
- **Windows:** MinGW-w64 (например, через [MSYS2](https://www.msys2.org/)), папка с `g++.exe` должна быть в `PATH`
- **Linux:** `sudo apt install g++`

Проверка: `g++ --version`.

## Как пользоваться

### Запуск программы

Откройте `.cpp` файл и нажмите кнопку **▶** справа над редактором, кнопку **Run C++** в строке
состояния или **Ctrl+Alt+R** (на macOS — Control+Option+R).

Расширение сохранит файл, откроет терминал **C++ Runner** в папке с файлом и выполнит:

```bash
g++ -std=c++17 -Wall "main.cpp" -o "main" && "./main"
```

Если в коде ошибка, компилятор выведет её в терминал, а программа не запустится.
По `Cmd+клик` / `Ctrl+клик` на `main.cpp:5:3` VS Code перейдёт к строке с ошибкой.

### Header guard

Откройте `.h` или `.hpp` файл → правый клик → **C++ Runner: Вставить header guard**.

```cpp
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int max2(int a, int b);

#endif // MATH_UTILS_H
```

### Создание класса

Правый клик по папке в проводнике → **C++ Runner: Создать класс** → введите имя, например `Point`.
Появятся файлы `Point.h` и `Point.cpp`:

```cpp
// Point.h
#ifndef POINT_H
#define POINT_H

class Point {
public:
    Point();
    ~Point();

private:
};

#endif // POINT_H
```

### Сниппеты

Начните вводить префикс в `.cpp` файле и нажмите `Tab`.

| Префикс | Что вставляет |
|---------|---------------|
| `cppmain` | `#include <iostream>` и функцию `main` |
| `fori` | цикл `for (int i = 0; i < n; ++i)` |
| `readarr` | функцию чтения массива |
| `printarr` | функцию вывода массива |
| `bubblesort` | сортировку пузырьком |
| `binsearch` | бинарный поиск |

## Команды

| Команда | Горячая клавиша |
|---------|-----------------|
| C++ Runner: Скомпилировать и запустить | `Ctrl+Alt+R` |
| C++ Runner: Вставить header guard | — |
| C++ Runner: Создать класс | — |

Все команды есть в палитре команд (`Ctrl+Shift+P` / `Cmd+Shift+P`).

## Настройки

| Настройка | По умолчанию | Описание |
|-----------|--------------|----------|
| `cppRunner.compiler` | `g++` | компилятор (`g++`, `clang++` или полный путь) |
| `cppRunner.standard` | `c++17` | стандарт C++: `c++11`, `c++14`, `c++17`, `c++20` |

## Запуск из исходников

```bash
git clone https://github.com/USERNAME/cpp-runner.git
cd cpp-runner
npm install
code .
```

Нажмите **F5** — откроется окно **Extension Development Host** с папкой `examples`, в которой есть
файлы для проверки.

Другие команды:

```bash
npm run compile      # скомпилировать TypeScript в папку out/
npm test             # запустить тесты
npx @vscode/vsce package   # собрать файл .vsix
```

## Структура проекта

```text
├── .vscode/             # настройки запуска и отладки (F5)
├── examples/            # примеры C++ для проверки
├── snippets/cpp.json    # сниппеты
├── src/
│   ├── extension.ts     # весь код расширения
│   └── test/
│       └── extension.test.ts
├── package.json         # манифест: команды, кнопки, настройки
└── tsconfig.json
```

## Лицензия

[MIT](LICENSE)

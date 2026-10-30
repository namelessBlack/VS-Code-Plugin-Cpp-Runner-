#include <iostream>

int readNumber(const char* prompt) {
    int value = 0;
    std::cout << prompt;
    std::cin >> value;
    return value;
}

int main() {
    int a = readNumber("Enter the first number: ");
    int b = readNumber("Enter the second number: ");
    std::cout << "Sum: " << a + b << std::endl;
    return 0;
}

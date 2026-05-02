/*
 * write_demo.c — calls write(2) directly, bypassing printf.
 * Useful to compare with hello.c under strace: printf goes through libc
 * and eventually reaches write; this program calls it directly.
 *
 * Build:  gcc -Wall -Wextra -g -O0 write_demo.c -o write_demo
 * Trace:  strace ./write_demo
 */
#include <string.h>
#include <unistd.h>

int main(void) {
    const char msg[] = "hello via write\n";
    write(STDOUT_FILENO, msg, strlen(msg));
    return 0;
}
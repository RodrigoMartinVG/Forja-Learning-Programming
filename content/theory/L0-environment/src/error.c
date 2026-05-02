/*
 * error.c — intentional memory error for valgrind / ASan demonstration.
 *
 * Writes 12 bytes ("hello world\0") into a 10-byte buffer: heap buffer overflow.
 * valgrind and AddressSanitizer both catch this at runtime.
 *
 * Build (plain):   gcc -g -O0 error.c -o error
 * Run with valgrind: valgrind ./error
 *
 * Build (ASan):    gcc -g -O0 -fsanitize=address -fsanitize=undefined error.c -o error_asan
 * Run:              ./error_asan
 */

#include <stdlib.h>
#include <string.h>

int main(void) {
    char *buf = malloc(10);
    strcpy(buf, "hello world");   /* writes 12 bytes into 10: overflow */
    free(buf);
    return 0;
}

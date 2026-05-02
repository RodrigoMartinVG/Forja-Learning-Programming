/*
 * maps_demo.c — prints its own virtual memory layout via /proc/self/maps.
 *
 * Useful to observe how the kernel maps the ELF sections, libc, and the stack.
 * Each execution produces different base addresses (ASLR), but the structure
 * is always the same: .text (r-x), .data/.bss (rw-), libc (r-x), [stack] (rw-).
 *
 * Build:  gcc -g -O0 maps_demo.c -o maps_demo
 * Run:    ./maps_demo
 */

#include <stdio.h>

int global_init   = 42;   /* .data — initialized global */
int global_uninit;        /* .bss  — zero-initialized by the OS */

int main(void) {
    int local = 99;       /* stack */

    printf("code  (main):        %p\n", (void *)main);
    printf("global (init):       %p\n", (void *)&global_init);
    printf("global (uninit/bss): %p\n", (void *)&global_uninit);
    printf("local  (stack):      %p\n", (void *)&local);
    printf("\n--- /proc/self/maps ---\n");

    FILE *maps = fopen("/proc/self/maps", "r");
    if (!maps) { perror("fopen"); return 1; }

    char line[256];
    while (fgets(line, sizeof(line), maps))
        fputs(line, stdout);

    fclose(maps);
    return 0;
}

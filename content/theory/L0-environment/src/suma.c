/*
 * suma.c — minimal example to study compiler output.
 *
 * Build (no optimizations, generate assembly):
 *   gcc -O0 -S suma.c -o suma.s
 *
 * Build (with optimizations, compare):
 *   gcc -O2 -S suma.c -o suma_opt.s
 *   diff suma.s suma_opt.s
 */

int suma(int a, int b) {
    return a + b;
}

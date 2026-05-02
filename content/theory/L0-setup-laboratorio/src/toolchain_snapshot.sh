#!/usr/bin/env bash
set -euo pipefail

show_version() {
    local label="$1"
    shift

    if command -v "$1" >/dev/null 2>&1; then
        printf '[ok] %-14s ' "$label"
        "$@" | head -n 1
    else
        printf '[missing] %s\n' "$label"
    fi
}

echo '== Forja toolchain snapshot =='
show_version 'bash' bash --version
show_version 'gcc' gcc --version
show_version 'clang' clang --version
show_version 'rustc' rustc --version
show_version 'cargo' cargo --version
show_version 'gdb' gdb --version
show_version 'python3' python3 --version
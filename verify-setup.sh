#!/usr/bin/env bash
set -euo pipefail

failures=0

run_check() {
  local label="$1"
  local command="$2"
  local output

  if output=$(bash -lc "$command" 2>&1); then
    output=$(printf '%s\n' "$output" | head -n 1)
    if [[ -n "$output" ]]; then
      printf '%-22s [ok] %s\n' "$label" "$output"
    else
      printf '%-22s [ok]\n' "$label"
    fi
  else
    output=$(printf '%s\n' "$output" | head -n 1)
    printf '%-22s [fail] %s\n' "$label" "$output"
    failures=$((failures + 1))
  fi
}

run_check "gcc" "gcc --version"
run_check "clang" "clang --version"
run_check "gdb" "gdb --version"
run_check "lldb" "lldb --version"
run_check "valgrind" "valgrind --version"
run_check "make" "make --version"
run_check "cmake" "cmake --version"
run_check "ninja" "ninja --version"
run_check "strace" "strace --version"
run_check "ltrace" "ltrace -V"
run_check "perf" "perf --version"
run_check "nm" "nm --version"
run_check "objdump" "objdump --version"
run_check "readelf" "readelf --version"
run_check "ar" "ar --version"
run_check "ranlib" "ranlib --version"
run_check "ldd" "ldd --version"
run_check "file" "file --version"
run_check "git" "git --version"
run_check "gh" "gh --version"
run_check "python3" "python3 --version"
run_check "jq" "jq --version"
run_check "yq" "yq --version"
run_check "hyperfine" "hyperfine --version"
run_check "rustup" "rustup --version"
run_check "cargo" "cargo --version"
run_check "cargo fmt" "cargo fmt --version"
run_check "cargo clippy" "cargo clippy --version"
run_check "cargo expand" "cargo expand --version"
run_check "cargo audit" "cargo audit --version"
run_check "cargo flamegraph" "cargo flamegraph --version"
run_check "cbindgen" "cbindgen --version"
run_check "bindgen" "bindgen --version"

if rustup toolchain list | grep -q '^nightly'; then
  run_check "nightly toolchain" "rustup toolchain list | grep -q '^nightly'"
  run_check "miri" "rustup run nightly cargo miri --version"
else
  printf '%-22s [skip] not installed in base profile\n' "nightly toolchain"
  printf '%-22s [skip] not installed in base profile\n' "miri"
fi

run_check "liburing" "pkg-config --exists liburing"
run_check "libseccomp" "pkg-config --exists libseccomp"
run_check "linux headers" "ls /usr/src | grep -q '^linux-headers-'"

if (( failures > 0 )); then
  printf '\nSetup verification failed: %d check(s) missing.\n' "$failures" >&2
  exit 1
fi

printf '\nSetup verification passed.\n'

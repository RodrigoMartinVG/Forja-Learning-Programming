FROM mcr.microsoft.com/devcontainers/base:bookworm

ARG DEBIAN_FRONTEND=noninteractive
ARG FORJA_INSTALL_NIGHTLY=false

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        clang \
        lldb \
        gdb \
        valgrind \
        make \
        cmake \
        ninja-build \
        strace \
        ltrace \
        linux-perf \
        binutils \
        linux-headers-amd64 \
        liburing-dev \
        libseccomp-dev \
        git \
        gh \
        python3 \
        python3-pip \
        jq \
        yq \
        hyperfine \
        file \
        pkg-config \
        libclang-dev \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

ENV CARGO_HOME=/home/vscode/.cargo
ENV RUSTUP_HOME=/home/vscode/.rustup
ENV PATH=/home/vscode/.cargo/bin:${PATH}
ENV BINSTALL_DISABLE_TELEMETRY=true

USER vscode

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable \
    && rustup component add rustfmt clippy \
    && if [ "$FORJA_INSTALL_NIGHTLY" = "true" ]; then \
        rustup toolchain install nightly \
        && rustup component add --toolchain nightly miri rustfmt clippy; \
      fi \
    && curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | sh \
    && for crate in cargo-expand flamegraph cargo-audit cbindgen bindgen-cli; do \
        cargo binstall --no-confirm --disable-strategies compile "$crate" \
        || cargo install --locked "$crate"; \
    done

#!/bin/sh
# vai CLI installer — https://vaicli.com
# Usage: curl -fsSL https://vaicli.com/install.sh | sh
#
# Installs voyageai-cli globally via npm.

set -e

# ─── Colors ───────────────────────────────────────────────────────────────────

setup_colors() {
  if [ -t 1 ] && [ -n "$(tput colors 2>/dev/null)" ] && [ "$(tput colors)" -ge 8 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    BOLD='\033[1m'
    DIM='\033[2m'
    RESET='\033[0m'
  else
    RED='' GREEN='' YELLOW='' BLUE='' BOLD='' DIM='' RESET=''
  fi
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

info()    { printf "${BLUE}ℹ${RESET}  %s\n" "$1"; }
success() { printf "${GREEN}✓${RESET}  %s\n" "$1"; }
warn()    { printf "${YELLOW}⚠${RESET}  %s\n" "$1"; }
error()   { printf "${RED}✗${RESET}  %s\n" "$1" >&2; }
fatal()   { error "$1"; exit 1; }

banner() {
  printf "\n"
  printf "${BOLD}${BLUE}"
  printf "  ╦  ╦╔═╗╦\n"
  printf "  ╚╗╔╝╠═╣║\n"
  printf "   ╚╝ ╩ ╩╩  ${RESET}${DIM}CLI Installer${RESET}\n"
  printf "\n"
  printf "  ${DIM}https://vaicli.com${RESET}\n\n"
}

# ─── Flags ────────────────────────────────────────────────────────────────────

INSTALL_VERSION=""
ACTION="install"

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --help|-h)
        cat <<EOF
vai CLI installer

Usage:
  curl -fsSL https://vaicli.com/install.sh | sh
  curl -fsSL https://vaicli.com/install.sh | sh -s -- [options]

Options:
  --help, -h          Show this help
  --version VERSION   Install a specific version (e.g. --version 1.2.0)
  --uninstall         Remove vai CLI
EOF
        exit 0
        ;;
      --version)
        shift
        INSTALL_VERSION="$1"
        ;;
      --uninstall)
        ACTION="uninstall"
        ;;
      *)
        warn "Unknown option: $1"
        ;;
    esac
    shift
  done
}

# ─── OS Detection ─────────────────────────────────────────────────────────────

detect_os() {
  OS="$(uname -s)"
  case "$OS" in
    Darwin)  OS_NAME="macOS" ;;
    Linux)   OS_NAME="Linux" ;;
    MINGW*|MSYS*|CYGWIN*|Windows*)
      fatal "Windows is not supported by this installer. Use: npm install -g voyageai-cli"
      ;;
    *)
      fatal "Unsupported operating system: $OS"
      ;;
  esac
  success "Detected ${OS_NAME}"
}

# ─── Node.js Check ────────────────────────────────────────────────────────────

check_node() {
  if ! command -v node >/dev/null 2>&1; then
    error "Node.js is not installed (v18+ required)"
    printf "\n"
    if [ "$OS_NAME" = "macOS" ]; then
      info "Install via Homebrew:  ${BOLD}brew install node${RESET}"
      info "Or via nvm:            ${BOLD}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash${RESET}"
    else
      info "Install via nvm:       ${BOLD}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash${RESET}"
      info "Or via package manager: ${BOLD}sudo apt install nodejs${RESET}  (Ubuntu/Debian)"
      info "                        ${BOLD}sudo dnf install nodejs${RESET}  (Fedora)"
    fi
    printf "\n"
    fatal "Please install Node.js v18+ and try again."
  fi

  NODE_VERSION="$(node --version | sed 's/^v//')"
  NODE_MAJOR="$(echo "$NODE_VERSION" | cut -d. -f1)"

  if [ "$NODE_MAJOR" -lt 18 ]; then
    fatal "Node.js v${NODE_VERSION} found — v18+ is required. Please upgrade."
  fi

  success "Node.js v${NODE_VERSION}"
}

check_npm() {
  if ! command -v npm >/dev/null 2>&1; then
    fatal "npm not found. It should come with Node.js — please reinstall Node."
  fi
  success "npm $(npm --version)"
}

# ─── Uninstall ────────────────────────────────────────────────────────────────

do_uninstall() {
  banner
  info "Uninstalling vai CLI..."

  if ! command -v vai >/dev/null 2>&1; then
    warn "vai CLI is not installed."
    exit 0
  fi

  npm uninstall -g voyageai-cli 2>/dev/null || sudo npm uninstall -g voyageai-cli
  success "vai CLI has been uninstalled."
}

# ─── Install ──────────────────────────────────────────────────────────────────

do_install() {
  banner

  # Check if already installed
  if command -v vai >/dev/null 2>&1; then
    CURRENT="$(vai --version 2>/dev/null || echo "unknown")"
    warn "vai CLI is already installed (${CURRENT})"
    printf "\n"
    # When piped, default to upgrade
    if [ -t 0 ]; then
      printf "  Upgrade/reinstall? [Y/n] "
      read -r REPLY
      case "$REPLY" in
        [nN]*) info "Keeping current version."; exit 0 ;;
      esac
    else
      info "Proceeding with upgrade..."
    fi
    printf "\n"
  fi

  info "Checking requirements..."
  detect_os
  check_node
  check_npm

  printf "\n"

  PKG="voyageai-cli"
  [ -n "$INSTALL_VERSION" ] && PKG="voyageai-cli@${INSTALL_VERSION}"

  info "Installing ${BOLD}${PKG}${RESET} globally..."

  if npm install -g "$PKG" 2>/dev/null; then
    : # success
  else
    warn "Permission denied — retrying with sudo..."
    if sudo npm install -g "$PKG"; then
      : # success
    else
      printf "\n"
      error "Installation failed. Try one of:"
      info "  ${BOLD}sudo npm install -g ${PKG}${RESET}"
      info "  Or fix npm permissions: ${DIM}https://docs.npmjs.com/resolving-eacces-permissions-errors${RESET}"
      exit 1
    fi
  fi

  printf "\n"

  # Verify
  if command -v vai >/dev/null 2>&1; then
    INSTALLED_VERSION="$(vai --version 2>/dev/null || echo "installed")"
    success "vai CLI ${INSTALLED_VERSION} installed successfully!"
  else
    warn "vai was installed but isn't in PATH. You may need to restart your shell."
  fi

  # Getting started
  printf "\n"
  printf "${BOLD}  Getting Started${RESET}\n"
  printf "${DIM}  ─────────────────────────────────────────${RESET}\n"
  printf "  ${BOLD}1.${RESET} Set your Voyage AI API key:\n"
  printf "     ${GREEN}vai config set api-key YOUR_KEY${RESET}\n\n"
  printf "  ${BOLD}2.${RESET} Connect MongoDB (optional):\n"
  printf "     ${GREEN}vai config set mongodb-uri YOUR_URI${RESET}\n\n"
  printf "  ${BOLD}3.${RESET} Try it out:\n"
  printf "     ${GREEN}vai demo${RESET}\n"
  printf "     ${GREEN}vai explain embeddings${RESET}\n"
  printf "${DIM}  ─────────────────────────────────────────${RESET}\n\n"

  printf "  ${DIM}Other install methods:${RESET}\n"
  printf "  ${DIM}  npm install -g voyageai-cli${RESET}\n"
  printf "  ${DIM}  https://vaicli.com${RESET}\n\n"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  setup_colors
  parse_args "$@"

  case "$ACTION" in
    uninstall) do_uninstall ;;
    install)   do_install ;;
  esac
}

main "$@"

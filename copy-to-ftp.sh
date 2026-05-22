#!/bin/bash
# Copy current directory to remote server's public_html via rsync + sshpass
# Install sshpass if not available: sudo apt install sshpass (Debian/Ubuntu)

# If not already running as root, re‑run with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Script perlu dijalankan sebagai root. Melanjutkan dengan sudo..."
    exec sudo "$0" "$@"
fi

set -x

USER="daddyssp"
SERVER="daddys-sporthub.com"
REMOTE_DIR="public_html/"

# Use environment variable for password (safer than command line)
export SSHPASS='+E]7SGc8lX82rq'

echo "Mulai copy ke remote server..."

rsync -avz --delete --progress --stats --rsh='sshpass -e ssh -p 21' --exclude '.git' --exclude '.gitignore' ./ "${USER}@${SERVER}:${REMOTE_DIR}"
RSYNC_EXIT=$?

if [ $RSYNC_EXIT -eq 0 ]; then
    echo "Done. (rsync succeeded)"
else
    echo "Error: rsync exited with code $RSYNC_EXIT" >&2
fi

echo "NOTE: Files have been copied to ${REMOTE_DIR}. Verify by visiting the site."

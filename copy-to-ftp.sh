#!/bin/bash
# Copy current directory to remote server's public_html via rsync + sshpass
# Install sshpass if not available: sudo apt install sshpass (Debian/Ubuntu)

USER="daddyssp"
SERVER="daddys-sporthub.com"
REMOTE_DIR="public_html/"

# Use environment variable for password (safer than command line)
export SSHPASS='+E]7SGc8lX82rq'

rsync -avz --delete --rsh='sshpass -e ssh' --exclude '.git' --exclude '.gitignore' ./ "${USER}@${SERVER}:${REMOTE_DIR}"
echo "Done."
echo "NOTE: Files have been copied to ${REMOTE_DIR}. Verify by visiting the site."

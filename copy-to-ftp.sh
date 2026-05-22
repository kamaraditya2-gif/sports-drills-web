#!/bin/bash
# Copy current directory to remote server's public_html via rsync
# Modify USER, SERVER, and REMOTE_DIR as needed

USER="your_username"
SERVER="your_server.com"
REMOTE_DIR="public_html/"

# Ensure you have SSH access set up
rsync -avz --delete --exclude '.git' --exclude '.gitignore' ./ "${USER}@${SERVER}:${REMOTE_DIR}"
echo "Done."
echo "NOTE: Files have been copied to ${REMOTE_DIR}. Verify by visiting the site."

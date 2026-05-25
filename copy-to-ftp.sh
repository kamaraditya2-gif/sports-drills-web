#!/bin/bash
# Copy current directory to remote server's public_html via FTP (lftp)
# Install lftp if not available: sudo apt install lftp (Debian/Ubuntu)

FTP_USER="daddyssp"
FTP_SERVER="daddys-sporthub.com"
FTP_REMOTE_DIR="/public_html/"

# Use environment variable for password (safer than command line)
export PASS='+E]7SGc8lX82rq'

if ! command -v lftp &> /dev/null; then
    echo "Error: lftp not installed. Install it with: sudo apt install lftp" >&2
    exit 1
fi

echo "Mulai copy ke remote server (FTP)..."

lftp -u "${FTP_USER}:${PASS}" "${FTP_SERVER}" <<EOF
set ftp:ssl-allow no
mirror -R --exclude-glob .git --exclude-glob .gitignore ./ "${FTP_REMOTE_DIR}"
bye
EOF

FTP_EXIT=$?

if [ $FTP_EXIT -eq 0 ]; then
    echo "Done. (lftp succeeded)"
else
    echo "Error: lftp exited with code $FTP_EXIT" >&2
fi

echo "NOTE: Files have been copied to ${FTP_REMOTE_DIR}. Verify by visiting the site."

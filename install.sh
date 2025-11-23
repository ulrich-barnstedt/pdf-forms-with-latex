#!/bin/sh

mkdir -p ~/.local/bin/

cat > ~/.local/bin/pdfform-to-latex << EOF
#!/bin/sh
node "$(pwd)/dist" "\$@"
EOF
chmod +x ~/.local/bin/pdfform-to-latex

#!/bin/bash
# Add jBake headers to all .adoc files in src/docs/
# Each file gets the required :jbake-type and :jbake-status attributes

SRC_DIR="src/docs"

find "$SRC_DIR" -name '*.adoc' | while read -r file; do
    # Determine menu category from directory
    rel_dir=$(dirname "${file#$SRC_DIR/}")
    case "$rel_dir" in
        concepts*) menu="concepts" ;;
        decisions*) menu="decisions" ;;
        *) menu="arc42" ;;
    esac

    # Check if jbake headers already exist
    if grep -q 'jbake-type' "$file"; then
        echo "SKIP (has headers): $file"
        continue
    fi

    # Read first line (title)
    read -r first_line < "$file"

    # Create temp file with headers inserted after title
    {
        echo "$first_line"
        echo ":jbake-type: page"
        echo ":jbake-status: published"
        echo ":jbake-menu: $menu"
        echo ""
        tail -n +2 "$file"
    } > "${file}.tmp" && mv "${file}.tmp" "$file"

    echo "OK: $file ($menu)"
done

echo "Done."

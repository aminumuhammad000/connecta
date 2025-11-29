#!/usr/bin/env python3
import re

files_to_fix = [
    ("src/pages/Notifications.tsx", 79, 80),
    ("src/pages/Payments.tsx", 109, 110),
    ("src/pages/Projects.tsx", 126, 127),
    ("src/pages/Proposals.tsx", 88, 89),
]

for filepath, return_line, main_line in files_to_fix:
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # Remove any comments or extra content between return ( and <main>
    # Find the return ( line and the <main> line
    if return_line - 1 < len(lines) and main_line - 1 < len(lines):
        # Check if there's content between return ( and <main>
        between_lines = main_line - return_line - 1
        if between_lines > 0:
            # Remove the lines between
            del lines[return_line:main_line-1]
            print(f"  Removed {between_lines} line(s) between return and main")
    
    with open(filepath, 'w') as f:
        f.writelines(lines)
    
    print(f"✓ Fixed {filepath}")

print("\nDone!")

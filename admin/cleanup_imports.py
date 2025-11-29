#!/usr/bin/env python3
import re

# Files with unused AppLayout import
files_with_unused_import = [
    "src/pages/Analytics.tsx",
    "src/pages/Contracts.tsx",
    "src/pages/Dashboard.tsx",
    "src/pages/GigApplications.tsx",
    "src/pages/Jobs.tsx",
    "src/pages/Payments.tsx",
    "src/pages/Profile.tsx",
    "src/pages/Projects.tsx",
    "src/pages/Proposals.tsx",
    "src/pages/Reviews.tsx",
    "src/pages/Settings.tsx",
    "src/pages/Users.tsx",
    "src/pages/Subscriptions.tsx" 
]

for filepath in files_with_unused_import:
    print(f"Processing {filepath}...")
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Remove AppLayout import
        content = re.sub(r"import\s+AppLayout\s+from\s+['\"]\.\.\/components\/AppLayout['\"];?\s*\n", "", content)
        
        # For Subscriptions.tsx specifically, remove the wrapper tags too
        if "Subscriptions.tsx" in filepath:
            content = re.sub(r'<AppLayout>\s*\n', '', content)
            content = re.sub(r'\s*</AppLayout>', '', content)
            # Also handle the loading state wrapper
            content = re.sub(r'return \(\s*\n\s*<AppLayout>', 'return (', content)
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✓ Processed {filepath}")
    except FileNotFoundError:
        print(f"⚠ File not found: {filepath}")

print("\nDone!")

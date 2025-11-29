#!/usr/bin/env python3
import re
import os

files = [
    "src/pages/Notifications.tsx",
    "src/pages/Payments.tsx",
    "src/pages/Analytics.tsx",
    "src/pages/Settings.tsx",
    "src/pages/Jobs.tsx",
    "src/pages/Profile.tsx",
    "src/pages/Reviews.tsx",
    "src/pages/Contracts.tsx",
    "src/pages/Projects.tsx",
    "src/pages/GigApplications.tsx",
    "src/pages/Proposals.tsx",
    "src/pages/Users.tsx",
    "src/pages/Dashboard.tsx"
]

for filepath in files:
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove import statement
    content = re.sub(r"import\s+AppLayout\s+from\s+['\"]\.\.\/components\/AppLayout['\"];\s*\n", "", content)
    
    # Remove <AppLayout> and </AppLayout> tags while keeping the content
    # This handles multi-line cases
    content = re.sub(r'<AppLayout>\s*\n', '', content)
    content = re.sub(r'\s*</AppLayout>', '', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Processed {filepath}")

print("\nDone!")

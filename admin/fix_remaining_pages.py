#!/usr/bin/env python3
import re

# Files that need wrapping in fragments (they have modals)
fragment_files = [
    "src/pages/Payments.tsx",
]

# Files that just need comment removal
simple_files = [
    "src/pages/Projects.tsx",
    "src/pages/Proposals.tsx",
]

# Fix fragment files
for filepath in fragment_files:
    print(f"Processing {filepath} (with fragment)...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove AppLayout import
    content = re.sub(r"import\s+AppLayout\s+from\s+['\"]\.\.\/components\/AppLayout['\"];\s*\n", "", content)
    
    # Fix return statement - wrap in fragment
    content = re.sub(r'return \(\s*\n\s*\{/\* Main Content \*/\}\s*\n\s*<main', 'return (\n    <>\n      <main', content)
    
    # Add closing fragment before final closing paren
    content = re.sub(r'(\s*\}\)\s*\n\s*\)\s*\n\})$', r'\1\n    </>\n  )\n}', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Processed {filepath}")

# Fix simple files
for filepath in simple_files:
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove AppLayout import
    content = re.sub(r"import\s+AppLayout\s+from\s+['\"]\.\.\/components\/AppLayout['\"];\s*\n", "", content)
    
    # Remove comment from return statement
    content = re.sub(r'return \(\s*\n\s*\{/\*[^}]*\*/\}\s*\n\s*<main', 'return (\n      <main', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Processed {filepath}")

print("\nDone!")

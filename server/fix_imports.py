import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Regex to find relative imports
    # Matches: import ... from "./..." or export ... from "./..."
    # Capture group 1: the path
    pattern = re.compile(r'(from\s+[\'"])([\.][^\'"]+)([\'"])')
    
    def replacer(match):
        prefix = match.group(1)
        path = match.group(2)
        suffix = match.group(3)
        
        if path.endswith('.js') or path.endswith('.json') or path.endswith('.png') or path.endswith('.jpg'):
            return match.group(0)
        
        return f"{prefix}{path}.js{suffix}"
    
    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        print(f"Fixed {filepath}")
        with open(filepath, 'w') as f:
            f.write(new_content)

for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".ts"):
            fix_file(os.path.join(root, file))

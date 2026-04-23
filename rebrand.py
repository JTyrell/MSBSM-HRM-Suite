import os
import re

# Define mappings
replacements = {
    r'\bemerald-500\b': 'msbm-red',
    r'\bemerald-600\b': 'msbm-red',
    r'\bemerald-700\b': 'msbm-red',
    r'\bteal-500\b': 'inner-blue',
    r'\bteal-600\b': 'inner-blue',
    r'\bemerald-100\b': 'msbm-red/10',
    r'\bteal-100\b': 'inner-blue/10',
    r'\bemerald-50\b': 'msbm-red/5',
    r'\bteal-50\b': 'inner-blue/5',
    r'\bemerald-400\b': 'msbm-red-bright',
    r'\bemerald-300\b': 'msbm-red-bright',
    r'\bteal-400\b': 'light-blue',
    r'\bteal-300\b': 'light-blue',
    r'\bemerald-900/30\b': 'msbm-red/20',
    r'\bteal-900/30\b': 'inner-blue/20',
    r'\bemerald-950/20\b': 'msbm-red/10',
    r'\bemerald-950/30\b': 'msbm-red/15',
    r'\bemerald-950/10\b': 'msbm-red/5',
    r'\bshadow-emerald-500/25\b': 'shadow-msbm-red/25',
    r'\bfrom-emerald-500\b': 'from-msbm-red',
    r'\bto-teal-500\b': 'to-inner-blue',
    r'\bfrom-emerald-600\b': 'from-msbm-red',
    r'\bto-teal-600\b': 'to-inner-blue',
    r'\bvia-emerald-950\b': 'via-[#4a0a10]',
    r'\bvia-teal-600\b': 'via-inner-blue',
    r'\bto-emerald-700\b': 'to-msbm-red',
    r'\bto-emerald-50/30\b': 'to-msbm-red/5',
}

def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

def walk_and_replace(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css')):
                replace_in_file(os.path.join(root, file))

if __name__ == "__main__":
    src_dir = r"c:\Users\JT\Documents\WebDev Refresh\MSBM\MSBM-HRM-Suite\src"
    walk_and_replace(src_dir)

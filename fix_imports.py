import glob
for f in glob.glob('frontend/src/pages/**/*.jsx', recursive=True):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if '../../../contexts/AuthContext' in content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content.replace('../../../contexts/AuthContext', '../../contexts/AuthContext'))
print("Fixed imports")

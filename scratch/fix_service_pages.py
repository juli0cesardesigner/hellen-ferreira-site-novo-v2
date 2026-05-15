import os
import re

files = [
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\casal\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\civil\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\corporativo\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\familia\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\gestante\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\mensal-menina\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\mensal-menino\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\newborn-menina\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\newborn-menino\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\revelacao\page.tsx",
    r"f:\Hellen\Site Novo - VSCODE\hellen-ferreira-site-novo-v2\src\app\servicos\smash\page.tsx",
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add imports
    if 'import { SessionWithPackages, Package }' not in content:
        content = re.sub(
            r'import { fetchSessionDetails } from "@/lib/actions/booking-actions";',
            r'import { fetchSessionDetails } from "@/lib/actions/booking-actions";\nimport { SessionWithPackages, Package } from "@/types/database";',
            content
        )
    
    # Fix session state
    content = content.replace('React.useState<any>(null)', 'React.useState<SessionWithPackages | null>(null)')
    
    # Fix getPackage any
    content = content.replace('(p: any) => p.tier_order === tier', '(p: Package) => p.tier_order === tier')
    
    # Remove unused icons (common ones found in lint)
    content = re.sub(r'Sparkles, |Camera, |Heart, |Users, |Coffee, |Info, ', '', content)
    # Also clean up the import line if it became messy
    content = content.replace('import {  } from "lucide-react";', '')
    
    # Remove unused SITE_CONFIG
    content = content.replace('import { SITE_CONFIG } from "@/lib/constants";\n', '')
    content = content.replace('import { SITE_CONFIG } from "@/lib/constants";', '')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done fixing service pages.")

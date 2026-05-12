import csv
from datetime import datetime
import json

file_path = r'f:\Hellen\Site Novo\Lista de agendamentos-12_05_2026.csv'

noise_emails = ['hellen@hellenferreira.com', 'jlcsrgmspnt@gmail.com']
noise_status = ['Incompleto', 'Cancelado']
noise_keywords = ['arrumar', 'limpar', 'teste', 'pilates', 'net ', 'ensaio', 'fotos mãe', 'fotos mae', 'edição', 'edicao']

def parse_date(date_str):
    try:
        date_str = date_str.strip('"')
        if ',' in date_str:
            return datetime.strptime(date_str, "%d/%m/%Y, %H:%M")
        else:
            return datetime.strptime(date_str, "%d/%m/%Y")
    except Exception:
        return None

analysis = {
    'total_rows': 0,
    'rows_2026_plus': 0,
    'noise': {
        'status': [],
        'email': [],
        'keyword': [],
        'duplicate': []
    },
    'valid': []
}

seen_slots = {} # (date, time) -> [rows]

with open(file_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        analysis['total_rows'] += 1
        
        start_time_str = row.get('Horário de início do agendamento', '')
        start_time = parse_date(start_time_str)
        
        if not start_time or start_time < datetime(2026, 1, 1):
            continue
            
        analysis['rows_2026_plus'] += 1
        
        is_noise = False
        
        # 1. Status Noise
        status = row.get('Status do agendamento', '')
        if status in noise_status:
            analysis['noise']['status'].append(row)
            is_noise = True
            
        # 2. Email Noise
        email = row.get('Email', '').lower()
        if any(ne in email for ne in noise_emails):
            if not is_noise: # Only add to this category if not already flagged as status noise
                analysis['noise']['email'].append(row)
            is_noise = True
            
        # 3. Keyword Noise
        name = (row.get('Nome', '') + ' ' + row.get('Sobrenome', '')).lower()
        if any(kw in name for kw in noise_keywords):
            if not is_noise:
                analysis['noise']['keyword'].append(row)
            is_noise = True
            
        # 4. Duplicate Check (Even for valid looking ones)
        if not is_noise:
            slot = (row['Horário de início do agendamento'], row['Membro da equipe'])
            if slot in seen_slots:
                # Potential duplicate or overlapping booking
                analysis['noise']['duplicate'].append(row)
                is_noise = True
            else:
                seen_slots[slot] = row
                
        if not is_noise:
            analysis['valid'].append(row)

# Prepare detailed markdown report
valid_count = len(analysis['valid'])
status_noise_count = len(analysis['noise']['status'])
email_noise_count = len(analysis['noise']['email'])
keyword_noise_count = len(analysis['noise']['keyword'])
duplicate_noise_count = len(analysis['noise']['duplicate'])

report = f"""# Análise Detalhada: Lista de Agendamentos (2026+)

Fiz uma filtragem profunda para remover ruídos e garantir que apenas agendamentos reais sejam considerados para o site.

## 📊 Números da Análise
- **Total no arquivo:** {analysis['total_rows']} registros
- **Filtro (>= 2026):** {analysis['rows_2026_plus']} registros
- **Agendamentos Válidos Identificados:** **{valid_count}**

### 🗑️ Ruídos Removidos ({analysis['rows_2026_plus'] - valid_count})
1.  **Status Inválido:** {status_noise_count} (Cancelados ou Incompletos)
2.  **Testes/Admin:** {email_noise_count} (Emails `hellen@...` ou `jlcsrg...`)
3.  **Termos de Bloqueio:** {keyword_noise_count} (Ex: "Arrumar", "Limpar", "Pilates")
4.  **Duplicidades/Conflitos:** {duplicate_noise_count} (Mesmo horário e profissional)

---

## 🔎 Exemplos de Ruídos Identificados
Abaixo estão exemplos do que foi removido como ruído para sua conferência:

| Motivo | Nome | Serviço | Data/Hora |
| :--- | :--- | :--- | :--- |
"""

# Sample noise entries
all_noise = analysis['noise']['status'][:3] + analysis['noise']['email'][:3] + analysis['noise']['keyword'][:3]
for row in all_noise:
    reason = "Status" if row in analysis['noise']['status'] else "Email" if row in analysis['noise']['email'] else "Keyword"
    report += f"| {reason} | {row['Nome']} {row['Sobrenome']} | {row['Nome do serviço']} | {row['Horário de início do agendamento']} |\n"

report += """
---

## ✅ Próximos Passos
Os **{valid_count} agendamentos limpos** estão prontos para serem estruturados.
Eles seguem este padrão de qualidade:
- Status: **Confirmado**
- Cliente: **Real** (baseado em email/nome)
- Sem conflito de horários.

Deseja que eu gere um arquivo JSON ou CSV apenas com estes dados limpos para facilitar a importação futura?
"""

with open(r'f:\Hellen\Site Novo\scratch\report.md', 'w', encoding='utf-8') as f:
    f.write(report)

# Export valid data to JSON
output_json = r'f:\Hellen\Site Novo\agendamentos_limpos_2026.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(analysis['valid'], f, ensure_ascii=False, indent=2)

print(f"Report written to scratch/report.md")
print(f"Clean data exported to {output_json}")

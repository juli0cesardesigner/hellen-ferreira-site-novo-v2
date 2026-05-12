import csv
from datetime import datetime

file_path = r'f:\Hellen\Site Novo\Lista de agendamentos-12_05_2026.csv'
output_path = r'f:\Hellen\Site Novo\agendamentos_analisados.md'

noise_emails = ['hellen@hellenferreira.com', 'jlcsrgmspnt@gmail.com'] # Adding julio cesar as well as it looks like testing
noise_status = ['Incompleto', 'Cancelado']

def parse_date(date_str):
    try:
        # Format: "dd/mm/yyyy, hh:mm" or "dd/mm/yyyy"
        date_str = date_str.strip('"')
        if ',' in date_str:
            return datetime.strptime(date_str, "%d/%m/%Y, %H:%M")
        else:
            return datetime.strptime(date_str, "%d/%m/%Y")
    except Exception:
        return None

results = {
    'total': 0,
    'since_2026': 0,
    'confirmed': 0,
    'noise_status': 0,
    'noise_email': 0,
    'noise_name': 0,
    'clean_data': []
}

with open(file_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        results['total'] += 1
        
        start_time_str = row.get('Horário de início do agendamento', '')
        start_time = parse_date(start_time_str)
        
        if not start_time or start_time < datetime(2026, 1, 1):
            continue
            
        results['since_2026'] += 1
        
        is_noise = False
        
        # Check Status
        status = row.get('Status do agendamento', '')
        if status in noise_status:
            results['noise_status'] += 1
            is_noise = True
            
        # Check Email
        email = row.get('Email', '').lower()
        if any(ne in email for ne in noise_emails):
            results['noise_email'] += 1
            is_noise = True
            
        # Check Name (Keywords)
        name = (row.get('Nome', '') + ' ' + row.get('Sobrenome', '')).lower()
        noise_keywords = ['arrumar', 'limpar', 'teste', 'pilates', 'net ', 'ensaio', 'fotos mãe']
        if any(kw in name for kw in noise_keywords):
            results['noise_name'] += 1
            is_noise = True
            
        if not is_noise:
            results['confirmed'] += 1
            results['clean_data'].append(row)

# Summary for the user
report = f"""# Relatório de Análise de Agendamentos

## Resumo Geral
- **Total de registros no CSV:** {results['total']}
- **Registros a partir de 01/01/2026:** {results['since_2026']}

## Identificação de Ruído (desde 2026)
- **Status Inválido (Cancelado/Incompleto):** {results['noise_status']}
- **Emails Administrativos/Teste:** {results['noise_email']}
- **Nomes com Palavras-Chave de Ruído:** {results['noise_name']}
  *(Ex: Arrumar, Limpar, Pilates, Teste)*

## Dados Limpos Sugeridos
- **Total de agendamentos válidos:** {len(results['clean_data'])}

---

### Amostra de Dados Limpos (Primeiros 10):
| Data | Nome | Serviço | Status | Valor |
| :--- | :--- | :--- | :--- | :--- |
"""

for row in results['clean_data'][:10]:
    report += f"| {row['Horário de início do agendamento']} | {row['Nome']} {row['Sobrenome']} | {row['Nome do serviço']} | {row['Status do agendamento']} | {row['Valor total do pedido']} |\n"

print(report)

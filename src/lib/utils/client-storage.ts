export interface SavedClientData {
  name: string;
  email: string;
  whatsapp: string;
  cpf: string;
  rememberMe?: boolean;
}

const CLIENT_STORAGE_KEY = 'hf_client_booking_data_v1';

export function saveClientData(data: SavedClientData): void {
  if (typeof window === 'undefined') return;
  try {
    if (data.rememberMe === false) {
      localStorage.removeItem(CLIENT_STORAGE_KEY);
      return;
    }
    const payload = JSON.stringify({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      whatsapp: data.whatsapp,
      cpf: data.cpf,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(CLIENT_STORAGE_KEY, payload);
  } catch (error) {
    console.error('Erro ao salvar dados da cliente localmente:', error);
  }
}

export function getClientData(): SavedClientData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.name && parsed.email) {
      return {
        name: parsed.name || '',
        email: parsed.email || '',
        whatsapp: parsed.whatsapp || '',
        cpf: parsed.cpf || '',
        rememberMe: true,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearClientData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar dados da cliente:', error);
  }
}

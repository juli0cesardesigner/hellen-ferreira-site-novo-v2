import { describe, it, expect, beforeEach } from 'vitest';
import { saveClientData, getClientData, clearClientData } from './client-storage';

describe('client-storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve client data correctly', () => {
    saveClientData({
      name: 'Maria Silva',
      email: 'MARIA@Gmail.com ',
      whatsapp: '(11) 99999-8888',
      cpf: '123.456.789-00',
      rememberMe: true,
    });

    const data = getClientData();
    expect(data).not.toBeNull();
    expect(data?.name).toBe('Maria Silva');
    expect(data?.email).toBe('maria@gmail.com');
    expect(data?.whatsapp).toBe('(11) 99999-8888');
    expect(data?.cpf).toBe('123.456.789-00');
  });

  it('should remove data when rememberMe is false', () => {
    saveClientData({
      name: 'Maria Silva',
      email: 'maria@gmail.com',
      whatsapp: '11999998888',
      cpf: '12345678900',
      rememberMe: true,
    });

    expect(getClientData()).not.toBeNull();

    saveClientData({
      name: 'Maria Silva',
      email: 'maria@gmail.com',
      whatsapp: '11999998888',
      cpf: '12345678900',
      rememberMe: false,
    });

    expect(getClientData()).toBeNull();
  });

  it('should clear client data when clearClientData is called', () => {
    saveClientData({
      name: 'Ana Paula',
      email: 'ana@gmail.com',
      whatsapp: '11988887777',
      cpf: '11122233344',
      rememberMe: true,
    });

    expect(getClientData()).not.toBeNull();

    clearClientData();

    expect(getClientData()).toBeNull();
  });
});

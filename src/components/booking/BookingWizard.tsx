"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, CheckCircle, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Home, Trees, MapPin, X, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAvailableSlots, createBooking, fetchSessionDetails, getMonthAvailability, processPayment, getNatalConfig } from "@/lib/actions/booking-actions";
import { useToast } from "@/components/ui/Toast";
import { fbEvent, fbInit } from "@/components/analytics/FacebookPixel";
import { trackSiteEvent } from "@/components/analytics/SiteTracker";
import { getClientData, saveClientData, clearClientData } from "@/lib/utils/client-storage";

import { SessionWithPackages, Package } from "@/types/database";

type Step = 'schedule' | 'details' | 'payment' | 'checkout' | 'pix' | 'success';

interface MercadoPagoBrickSettings {
  initialization: {
    amount: number;
    preferenceId: string;
    payer: {
      email: string;
      entityType: string;
      identification: {
        type: string;
        number: string;
      };
    };
  };
  customization: {
    paymentMethods: Record<string, string>;
    visual: {
      style: {
        theme: string;
      };
    };
  };
  callbacks: {
    onReady: () => void;
    onSubmit: (paymentFormData: { formData: Record<string, unknown> }) => Promise<void>;
    onError: (error: unknown) => void;
  };
}

interface BookingWizardProps {
  initialSessionId?: string;
  initialTier?: number;
  initialModality?: 'digital' | 'print';
}

export default function BookingWizard({ 
  initialSessionId = "be68f0ac-d486-4cad-8ea4-3eed090ffada", 
  initialTier = 1,
  initialModality = 'digital'
}: BookingWizardProps) {
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('schedule');
  const [sessionId] = useState<string>(initialSessionId);
  const [session, setSession] = useState<SessionWithPackages | null>(null);
  const [selectedTier] = useState<number>(initialTier);
  
  // Estados para a Agenda Mensal
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [monthAvailability, setMonthAvailability] = useState<Record<string, boolean>>({});
  const [selectedDateSlots, setSelectedDateSlots] = useState<{ time: string; available: boolean; reason?: string }[]>([]);
  
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "", cpf: "" });
  const [locationType, setLocationType] = useState<'estudio' | 'externo'>('estudio');
  const [locationDetails, setLocationDetails] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isDataAutoFilled, setIsDataAutoFilled] = useState(false);
  const [packageType, setPackageType] = useState<'digital' | 'print'>(initialModality);
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode?: string; qrCodeBase64?: string; expiresAt?: string } | null>(null);
  const [pixTimeLeft, setPixTimeLeft] = useState<number>(30 * 60); // 30 min em segundos
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [mpLoaded, setMpLoaded] = useState(false);

  // Carregar dados salvos do cliente para agendamentos recorrentes
  useEffect(() => {
    const savedData = getClientData();
    if (savedData && savedData.name && savedData.email) {
      let formattedCpf = savedData.cpf || "";
      const rawCpf = formattedCpf.replace(/\D/g, "");
      if (rawCpf.length === 11) {
        formattedCpf = rawCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      }
      setFormData({
        name: savedData.name,
        email: savedData.email,
        whatsapp: savedData.whatsapp,
        cpf: formattedCpf,
      });
      setIsDataAutoFilled(true);
    }
  }, []);

  const handleClearSavedData = () => {
    clearClientData();
    setFormData({ name: "", email: "", whatsapp: "", cpf: "" });
    setIsDataAutoFilled(false);
    showToast("Dados salvos removidos deste dispositivo.", "info");
  };

  const handleGoToPayment = () => {
    saveClientData({
      name: formData.name,
      email: formData.email,
      whatsapp: formData.whatsapp,
      cpf: formData.cpf,
      rememberMe,
    });
    setStep('payment');
  };

  // Determinar o pacote ativo baseado no Tier selecionado
  const activePackage = session?.session_packages?.find((p: Package) => p.tier_order === selectedTier) || session?.session_packages?.[0];

  // Carregar regras de Natal para restrição de local
  const [natalLocationOverride, setNatalLocationOverride] = useState<'all' | 'estudio' | 'externo' | null>(null);

  useEffect(() => {
    async function checkNatalLocation() {
      if (!selectedDate) {
        setNatalLocationOverride(null);
        return;
      }
      const natal = await getNatalConfig();
      if (
        natal?.enabled &&
        (!natal.startDate || selectedDate >= natal.startDate) &&
        (!natal.endDate || selectedDate <= natal.endDate)
      ) {
        const rule = natal.sessionRules?.[sessionId];
        const override = rule?.locationOverride || natal.defaultLocationOverride;
        if (override && override !== 'all') {
          setNatalLocationOverride(override);
          setLocationType(override);
        } else {
          setNatalLocationOverride(null);
        }
      } else {
        setNatalLocationOverride(null);
      }
    }
    checkNatalLocation();
  }, [selectedDate, sessionId]);

  // Sessões que permitem escolha entre Estúdio ou Externo (ex: Gestante, Feminino, Família, Revelação)
  const baseSupportsLocation = !session?.slug || ['gestante', 'feminino', 'familia', 'revelacao'].includes(session.slug);
  const supportsLocationChoice = baseSupportsLocation && (!natalLocationOverride || natalLocationOverride === 'all');

  // Carregar Detalhes da Sessão
  useEffect(() => {
    async function loadSession() {
      const res = await fetchSessionDetails(sessionId);
      if (res.session) {
        setSession(res.session);
        if (res.session.start_date) {
          const [sYear, sMonth] = res.session.start_date.split('-').map(Number);
          setCurrentMonthDate(new Date(sYear, sMonth - 1, 1));
        }
      }
    }
    loadSession();
  }, [sessionId]);

  // Contador de expiração do Pix
  useEffect(() => {
    if (step === 'pix' && pixTimeLeft > 0) {
      const interval = setInterval(() => {
        setPixTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, pixTimeLeft]);

  // Tracking de Mudança de Passos
  useEffect(() => {
    if (step === 'details') {
      fbEvent('InitiateCheckout', {
        content_name: session?.name,
        content_ids: [sessionId],
        content_type: 'product'
      });
      trackSiteEvent('step_booking_details', session?.name);
    }
    if (step === 'checkout') {
      fbEvent('AddPaymentInfo', {
        content_name: session?.name,
        value: (paymentType === 'deposit' ? session?.deposit_price : (packageType === 'digital' ? activePackage?.price_digital : activePackage?.price_print)) ?? 0,
        currency: 'BRL'
      });
      trackSiteEvent('step_booking_checkout', session?.name);
    }
    if (step === 'success') {
      fbEvent('Purchase', {
        content_name: session?.name,
        content_ids: [sessionId],
        content_type: 'product',
        value: (paymentType === 'deposit' ? session?.deposit_price : (packageType === 'digital' ? activePackage?.price_digital : activePackage?.price_print)) ?? 0,
        currency: 'BRL'
      });
      trackSiteEvent('booking_success', session?.name);
    }
  }, [step, session?.name, sessionId, paymentType, packageType, activePackage, session?.deposit_price]);

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => setMpLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Inicializar o Brick de Pagamento quando tivermos o preferenceId
  useEffect(() => {
    if (step === 'checkout' && preferenceId && mpLoaded) {
      // Limpar container anterior se existir
      const container = document.getElementById("paymentBrick_container");
      if (container) container.innerHTML = "";

      if (!window.MercadoPago) return;
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
      const bricksBuilder = mp.bricks();

      const renderPaymentBrick = async (bricksBuilder: any) => {
        try {
          console.log("🔧 Iniciando renderização do Brick com preferenceId:", preferenceId);
          const settings: MercadoPagoBrickSettings = {
          initialization: {
            amount: (paymentType === 'deposit' ? session?.deposit_price : (packageType === 'digital' ? activePackage?.price_digital : activePackage?.price_print)) ?? 0,
            preferenceId: preferenceId,
            payer: {
              email: formData.email,
              entityType: 'individual',
              identification: {
                type: 'CPF',
                number: formData.cpf.replace(/\D/g, ''),
              },
            },
          },
          customization: {
            paymentMethods: {
              bankTransfer: "all", // Pix
              creditCard: "all",   // Cartão de Crédito
            },
            visual: {
              style: {
                theme: "default",
              },
            },
          },
          callbacks: {
            onReady: () => {
              setIsLoading(false);
            },
            onSubmit: async (paymentFormData: { formData: Record<string, unknown> }) => {
              try {
                const formDataSubmit = paymentFormData.formData;
                const paymentMethodId = formDataSubmit.payment_method_id as string;
                
                // Garantir que a estrutura 'payer' esteja devidamente preenchida e sincronizada com os nossos dados locais
                if (!formDataSubmit.payer) {
                  formDataSubmit.payer = {};
                }
                const payerObj = formDataSubmit.payer as Record<string, unknown>;
                
                // Garantir o e-mail
                if (!payerObj.email && formData.email) {
                  payerObj.email = formData.email;
                }
                
                // Garantir a identificação do portador (CPF) para o Pix ou cartão
                if (!payerObj.identification) {
                  const cpfClean = formData.cpf.replace(/\D/g, '');
                  payerObj.identification = {
                    type: 'CPF',
                    number: cpfClean
                  };
                } else {
                  const identObj = payerObj.identification as Record<string, unknown>;
                  if (!identObj.number && formData.cpf) {
                    identObj.type = 'CPF';
                    identObj.number = formData.cpf.replace(/\D/g, '');
                  }
                }

                const identification = payerObj.identification as Record<string, unknown> | undefined;
                const cpf = identification?.number as string | undefined;
                
                if (paymentMethodId === 'pix' && !cpf) {
                  showToast("CPF é obrigatório para pagamento via PIX. Volte para preencher.", "error");
                  return;
                }
                if (!bookingId) {
                  console.error("❌ Erro: bookingId está ausente no submit.");
                  showToast("Erro interno: ID do agendamento ausente.", "error");
                  return;
                }
                const res = await processPayment(formDataSubmit, bookingId);
                
                if (res.success) {
                  if (paymentMethodId === 'pix') {
                    setPixData(res.pixData || null);
                    setPixTimeLeft(30 * 60); // Reset contador (30 min)
                    setStep('pix');
                  } else if (res.status === 'approved' || res.status === 'in_process') {
                    setStep('success');
                  } else {
                    showToast(`Status do pagamento: ${res.status}`, "info");
                    setStep('success'); // Avança mesmo assim e deixa o webhook/admin cuidar
                  }
                } else {
                  showToast(res.error || "Erro ao processar pagamento.", "error");
                }
              } catch (err) {
                console.error("Erro no callback onSubmit:", err);
                showToast("Erro ao processar o pagamento. Tente novamente.", "error");
              }
            },
            onError: (error: unknown) => {
              console.error("❌ Erro no Brick:", error);
              showToast("Erro no formulário de pagamento. Tente novamente.", "error");
            },
          },
        };
        
        if (window.paymentBrickController) {
          await window.paymentBrickController.unmount();
        }

        window.paymentBrickController = await bricksBuilder.create(
          "payment",
          "paymentBrick_container",
          settings
        );
        console.log("✅ Brick renderizado com sucesso!");
        } catch (error) {
          console.error("❌ Erro ao renderizar Brick:", error);
          throw error;
        }
      };

      renderPaymentBrick(bricksBuilder).catch((err: unknown) => {
        console.error("❌ Erro ao renderizar Brick:", err);
        showToast("Erro ao carregar formulário de pagamento. Recarregue a página.", "error");
      });
    }
    
    return () => {
      if (window.paymentBrickController && typeof window.paymentBrickController.unmount === 'function') {
        window.paymentBrickController.unmount();
      }
    };
  }, [
    step, preferenceId, mpLoaded, bookingId, 
    paymentType, packageType, session?.deposit_price, 
    activePackage?.price_digital, activePackage?.price_print, 
    formData.email, formData.cpf, showToast
  ]);

  // Carregar disponibilidade do mês
  useEffect(() => {
    async function loadMonthData() {
      setIsLoading(true);
      const res = await getMonthAvailability(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth(),
        sessionId
      );
      setMonthAvailability(res);
      setIsLoading(false);
    }
    loadMonthData();
  }, [currentMonthDate, sessionId]);

  // Carregar slots do dia selecionado
  useEffect(() => {
    if (selectedDate) {
      async function loadSlots() {
        setIsSlotsLoading(true);
        const res = await getAvailableSlots(selectedDate, sessionId);
        if (Array.isArray(res.slots)) {
          const sortedSlots = [...res.slots].sort((a, b) => a.time.localeCompare(b.time));
          setSelectedDateSlots(sortedSlots as { time: string; available: boolean; reason?: string }[]);
        }
        setIsSlotsLoading(false);
      }
      loadSlots();
    }
  }, [selectedDate, sessionId]);

  const canPrevMonth = () => {
    if (session?.start_date) {
      const [sYear, sMonth] = session.start_date.split('-').map(Number);
      return new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1) > new Date(sYear, sMonth - 1, 1);
    }
    const today = new Date();
    return currentMonthDate > new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const canNextMonth = () => {
    if (session?.end_date) {
      const [eYear, eMonth] = session.end_date.split('-').map(Number);
      return new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1) < new Date(eYear, eMonth - 1, 1);
    }
    return true;
  };

  const handleNextMonth = () => {
    if (!canNextMonth()) return;
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonthDate(next);
  };

  const handlePrevMonth = () => {
    if (!canPrevMonth()) return;
    const prev = new Date(currentMonthDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonthDate(prev);
  };

  // Funções de navegação dia a dia dentro do popup de horários
  const parseSelectedDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateToString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const canPrevDay = () => {
    if (!selectedDate) return false;
    const cur = parseSelectedDate(selectedDate);
    const prev = new Date(cur);
    prev.setDate(prev.getDate() - 1);
    
    // Limite mínimo: hoje (não permitir agendamentos no passado)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prev < today) return false;

    // Se o serviço tiver data de início definida
    if (session?.start_date) {
      const startLimit = parseSelectedDate(session.start_date);
      if (prev < startLimit) return false;
    }
    return true;
  };

  const canNextDay = () => {
    if (!selectedDate) return false;
    const cur = parseSelectedDate(selectedDate);
    const next = new Date(cur);
    next.setDate(next.getDate() + 1);

    // Se o serviço tiver data de término definida
    if (session?.end_date) {
      const endLimit = parseSelectedDate(session.end_date);
      if (next > endLimit) return false;
    }
    return true;
  };

  const handlePrevDay = () => {
    if (!canPrevDay()) return;
    const cur = parseSelectedDate(selectedDate);
    cur.setDate(cur.getDate() - 1);
    const newDateStr = formatDateToString(cur);
    setSelectedDate(newDateStr);
    setSelectedTime("");
    // Se mudou de mês, sincroniza o calendário ao fundo
    if (cur.getMonth() !== currentMonthDate.getMonth() || cur.getFullYear() !== currentMonthDate.getFullYear()) {
      setCurrentMonthDate(new Date(cur.getFullYear(), cur.getMonth(), 1));
    }
  };

  const handleNextDay = () => {
    if (!canNextDay()) return;
    const cur = parseSelectedDate(selectedDate);
    cur.setDate(cur.getDate() + 1);
    const newDateStr = formatDateToString(cur);
    setSelectedDate(newDateStr);
    setSelectedTime("");
    // Se mudou de mês, sincroniza o calendário ao fundo
    if (cur.getMonth() !== currentMonthDate.getMonth() || cur.getFullYear() !== currentMonthDate.getFullYear()) {
      setCurrentMonthDate(new Date(cur.getFullYear(), cur.getMonth(), 1));
    }
  };

  const getCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleFinalize = async () => {
    setIsLoading(true);

    // Advanced Matching: Inicializa o Pixel com os dados do cliente para melhorar a otimização
    fbInit({
      em: formData.email.toLowerCase().trim(),
      ph: formData.whatsapp.replace(/\D/g, ''),
      fn: formData.name.split(' ')[0].toLowerCase().trim(),
      external_id: formData.cpf.replace(/\D/g, '')
    });

    // Tracking de Lead
    fbEvent('Lead', {
      content_name: session?.name,
      content_category: 'Booking'
    });
    trackSiteEvent('lead_form_submitted', session?.name);

    const res = await createBooking({
      sessionId,
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.whatsapp,
      clientCpf: formData.cpf,
      bookingDate: selectedDate,
      startTime: selectedTime,
      paymentType,
      packageType,
      selectedTier,
      locationType: supportsLocationChoice ? locationType : 'estudio',
      locationDetails: supportsLocationChoice && locationType === 'externo' ? locationDetails : undefined,
    });
    
    if (res.success && res.preferenceId) {
      setBookingId(res.bookingId);
      setPreferenceId(res.preferenceId);
      setStep('checkout');
    } else {
      setIsLoading(false);
      showToast(res.error || "Erro ao criar agendamento. Tente novamente.", "error");
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Aplicar máscara 000.000.000-00
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{3})/, "$1.$2");
    }
    
    setFormData({ ...formData, cpf: value });
  };

  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      showToast("Código Pix copiado!", "success");
    }
  };

  const dayNamesShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="min-h-screen bg-[#FCFBF9] pt-10 md:pt-28 pb-10 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-4 md:mb-8 space-y-1">
          <h1 className="text-3xl md:text-5xl font-serif text-[#2C2A29] italic underline decoration-blush/20 decoration-6 md:decoration-8 underline-offset-[-2px]">
            Agenda
          </h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#8C8681] font-light">Selecione seu momento</p>
        </div>

        {/* Container sem box/borda no mobile, preservando o card elegante em desktop */}
        <div className="bg-transparent md:bg-white rounded-none md:rounded-3xl p-0 md:p-10 shadow-none md:shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-0 md:border md:border-[#E6DFD3]/50">
          
          <AnimatePresence mode="wait">
            
            {step === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4 md:space-y-8"
              >
                {/* ─── Cabeçalho Elegante e Otimizado para Mobile ─── */}
                <div className="border-b border-[#E6DFD3]/60 pb-3 md:pb-6 space-y-2 text-center">
                  {/* Identificação do Serviço e Pacote Selecionado */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white md:bg-[#FBF9F5] border border-[#E6DFD3]/70 rounded-full shadow-sm max-w-full">
                    <span className="text-[11px] md:text-xs font-serif italic text-[#2C2A29] truncate">
                      {session?.name || "Carregando..."}
                    </span>
                    {(session?.session_packages?.length ?? 0) > 1 && activePackage && (
                      <>
                        <span className="text-[#8C8681]/40">•</span>
                        <span className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-wider text-blush truncate">
                          {activePackage.name}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Controle e Navegação de Mês / Ano */}
                  <div className="flex items-center justify-between max-w-sm mx-auto px-2">
                    <button 
                      disabled={!canPrevMonth()} 
                      onClick={handlePrevMonth} 
                      className="w-10 h-10 hover:bg-[#F5F2EC] active:scale-90 rounded-full transition-all text-[#2C2A29] flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed" 
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <h3 className="text-xl md:text-2xl font-serif italic text-[#2C2A29] tracking-tight">
                      {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                    </h3>

                    <button 
                      disabled={!canNextMonth()} 
                      onClick={handleNextMonth} 
                      className="w-10 h-10 hover:bg-[#F5F2EC] active:scale-90 rounded-full transition-all text-[#2C2A29] flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed" 
                      aria-label="Próximo mês"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Cabeçalho dos dias da semana (DOM, SEG, TER...) com maior nitidez */}
                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {dayNamesShort.map(d => (
                      <div key={d} className="text-[11px] md:text-[12px] uppercase tracking-wider font-extrabold text-[#736E6A] py-1">{d}</div>
                    ))}
                  </div>
                  
                  {/* Grade de dias com fontes grandes e excelente contraste */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((date, idx) => {
                      if (!date) return <div key={`empty-${idx}`} className="h-12 sm:h-14 md:h-20" />;
                      const dateStr = date.toISOString().split('T')[0];
                      const isAvailable = monthAvailability[dateStr];
                      const isSelected = selectedDate === dateStr;
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;
                      const isPast = date < new Date(new Date().setHours(0,0,0,0));

                      // Para serviços sazonais com data de início e fim definida (ex: Natal),
                      // os dias fora do período permitido ficam totalmente ocultos
                      const isOutOfSeason = Boolean(
                        (session?.start_date && dateStr < session.start_date) ||
                        (session?.end_date && dateStr > session.end_date)
                      );

                      if (isOutOfSeason) {
                        return <div key={`hidden-${dateStr}`} className="h-12 sm:h-14 md:h-20 pointer-events-none" />;
                      }

                      return (
                        <button
                          key={dateStr}
                          disabled={isPast || !isAvailable}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedTime("");
                          }}
                          className={`relative h-12 sm:h-14 md:h-20 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group
                            ${isSelected ? 'bg-blush text-white shadow-md z-10 scale-[1.04]' : 'hover:bg-[#F5F2EC]/80 active:bg-[#F5F2EC]'}
                            ${(!isAvailable || isPast) ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                            ${isToday && !isSelected ? 'text-blush font-bold' : 'text-[#1F1E1D] font-normal'}
                          `}
                        >
                          <span className="text-xl sm:text-2xl md:text-3xl font-serif leading-none tracking-tight">
                            {date.getDate()}
                          </span>
                          {isAvailable && !isSelected && !isPast && (
                            <span className="w-1.5 h-1.5 bg-blush rounded-full mt-1 group-hover:scale-125 transition-transform" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                {!isLoading && Object.keys(monthAvailability).length > 0 && !Object.values(monthAvailability).some(Boolean) && (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm italic font-serif text-[#8C8681]">Sem datas disponíveis neste mês.</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8681]/60">Navegue para o próximo mês →</p>
                  </div>
                )}
                </div>

                {/* ─── Popup Glassmorphism de Escolha de Horários ─── */}
                <AnimatePresence>
                  {selectedDate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                      {/* Backdrop com desfoque suave (Glassmorphism) */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setSelectedDate("")}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                      />

                      {/* Modal Card Glassmorphism */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-[#1E1B18]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl p-6 sm:p-8 overflow-hidden"
                      >
                        {/* Botão Fechar X */}
                        <button
                          type="button"
                          onClick={() => setSelectedDate("")}
                          aria-label="Fechar horários e voltar ao calendário"
                          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#595552] dark:text-[#D1CBC5] hover:text-[#2C2A29] dark:hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90"
                        >
                          <X size={18} />
                        </button>

                        {/* Cabeçalho do Popup (Com Navegadores de Dia Anterior e Posterior) */}
                        <div className="text-center space-y-1.5 mb-6 pt-2">
                          <div className="inline-flex items-center justify-center gap-2 text-blush text-[10px] font-bold uppercase tracking-[0.25em]">
                            <Clock size={13} />
                            <span>Horários Disponíveis</span>
                          </div>

                          {/* Linha com Setas Navegadoras e a Data por extenso */}
                          <div className="flex items-center justify-between gap-2 px-1 sm:px-2 pt-1">
                            <button
                              type="button"
                              disabled={!canPrevDay()}
                              onClick={handlePrevDay}
                              aria-label="Dia anterior"
                              className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#2C2A29] dark:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90 shrink-0"
                              title="Ver dia anterior"
                            >
                              <ChevronLeft size={20} />
                            </button>

                            <h4 className="text-lg sm:text-2xl font-serif italic text-[#2C2A29] dark:text-[#F5F2EC] capitalize truncate leading-tight">
                              {new Date(selectedDate + "T12:00:00").toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </h4>

                            <button
                              type="button"
                              disabled={!canNextDay()}
                              onClick={handleNextDay}
                              aria-label="Próximo dia"
                              className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#2C2A29] dark:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90 shrink-0"
                              title="Ver próximo dia"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>

                          <p className="text-[11px] text-[#8C8681] dark:text-[#A8A29D]">
                            Selecione o horário desejado ou navegue pelas datas.
                          </p>
                        </div>

                        {/* Lista de Horários Alinhada Verticalmente (Um abaixo do outro) */}
                        <div className="max-h-[55vh] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                          {isSlotsLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                              <Loader2 className="animate-spin text-blush" size={32} />
                              <span className="text-[11px] uppercase tracking-widest font-bold text-[#8C8681]">
                                Consultando horários...
                              </span>
                            </div>
                          ) : selectedDateSlots.filter(s => s.available).length > 0 ? (
                            <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
                              {selectedDateSlots.filter(s => s.available).map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTime(slot.time);
                                    setStep('details');
                                  }}
                                  className="group relative w-full py-3.5 px-6 rounded-2xl text-[14px] font-mono font-bold tracking-wider border border-[#E6DFD3]/80 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-blush hover:text-white hover:border-blush dark:hover:bg-blush dark:hover:border-blush text-[#2C2A29] dark:text-[#F5F2EC] transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-between"
                                >
                                  <span className="w-4" /> {/* Espaçador para manter o texto centralizado */}
                                  <span className="text-center">{slot.time.substring(0, 5)}h</span>
                                  <ArrowRight size={15} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-white" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 px-4 space-y-2">
                              <p className="text-base font-serif italic text-[#8C8681]">
                                Nenhum horário disponível nesta data.
                              </p>
                              <p className="text-[11px] text-[#8C8681]/70">
                                Por favor, feche e escolha outro dia no calendário.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl mx-auto space-y-12 py-8"
              >
                <button onClick={() => setStep('schedule')} className="text-[10px] uppercase tracking-widest text-[#8C8681] flex items-center gap-2 hover:text-blush transition-colors">
                  <ArrowLeft size={12} /> Voltar para a Agenda
                </button>

                <div className="text-center">
                   <h3 className="text-3xl font-serif italic text-[#2C2A29] mb-4">Quase lá!</h3>
                   <p className="text-sm text-[#8C8681] font-light">Informe seus dados para reservarmos seu espaço.</p>
                </div>

                {isDataAutoFilled && (
                  <div className="p-4 bg-blush/10 border border-blush/30 rounded-sm flex items-center justify-between text-xs text-[#2C2A29]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">✨</span>
                      <span>
                        <strong>Bem-vinda de volta!</strong> Preenchemos seus dados salvos neste dispositivo.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSavedData}
                      className="text-[10px] uppercase font-bold text-blush hover:underline shrink-0 ml-4 cursor-pointer"
                    >
                      Não é você? Limpar
                    </button>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681]">Nome Completo</label>
                     <input 
                      type="text" placeholder="Como podemos te chamar?"
                      className="w-full p-5 bg-white border border-[#E6DFD3] rounded-sm text-sm outline-none focus:border-blush transition-all"
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681]">E-mail</label>
                       <input 
                        type="email" placeholder="Para confirmação"
                        className="w-full p-5 bg-white border border-[#E6DFD3] rounded-sm text-sm outline-none focus:border-blush"
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681]">WhatsApp</label>
                       <input 
                        type="tel" placeholder="(00) 00000-0000"
                        className="w-full p-5 bg-white border border-[#E6DFD3] rounded-sm text-sm outline-none focus:border-blush"
                        value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681]">CPF</label>
                     <input 
                      type="text" placeholder="000.000.000-00"
                      className="w-full p-5 bg-white border border-[#E6DFD3] rounded-sm text-sm outline-none focus:border-blush"
                      value={formData.cpf} onChange={handleCpfChange}
                    />
                  </div>

                  {/* Seletor de Modalidade (Estúdio vs Externo) */}
                  {supportsLocationChoice && (
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681]">
                          Local do Ensaio
                        </label>
                        <span className="text-[11px] text-[#8C8681] font-light">
                          Selecione onde você deseja que o ensaio seja realizado.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setLocationType('estudio')}
                          className={`p-5 rounded-sm border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                            locationType === 'estudio'
                              ? 'border-blush bg-white ring-2 ring-blush/20 shadow-md'
                              : 'border-[#E6DFD3] bg-white hover:border-blush/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Home size={16} className={locationType === 'estudio' ? 'text-blush' : 'text-[#8C8681]'} />
                              <span className="text-xs font-bold uppercase tracking-wider text-[#2C2A29]">No Estúdio</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              locationType === 'estudio' ? 'border-blush bg-blush' : 'border-[#E6DFD3]'
                            }`}>
                              {locationType === 'estudio' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#8C8681] font-light leading-relaxed">
                            Ambiente privativo, climatizado e acervo de peças e figurinos incluso.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLocationType('externo')}
                          className={`p-5 rounded-sm border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                            locationType === 'externo'
                              ? 'border-blush bg-white ring-2 ring-blush/20 shadow-md'
                              : 'border-[#E6DFD3] bg-white hover:border-blush/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Trees size={16} className={locationType === 'externo' ? 'text-blush' : 'text-[#8C8681]'} />
                              <span className="text-xs font-bold uppercase tracking-wider text-[#2C2A29]">Locação Externa</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              locationType === 'externo' ? 'border-blush bg-blush' : 'border-[#E6DFD3]'
                            }`}>
                              {locationType === 'externo' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#8C8681] font-light leading-relaxed">
                            Parque, fazenda ou locação ao ar livre de sua preferência.
                          </p>
                        </button>
                      </div>

                      {locationType === 'externo' && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-2 space-y-1.5"
                        >
                          <label className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681] flex items-center gap-1.5">
                            <MapPin size={12} className="text-blush" />
                            Local pretendido (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Parque da Cidade, Fazenda ou 'alinhar com a Hellen'"
                            className="w-full p-4 bg-white border border-[#E6DFD3] rounded-sm text-xs outline-none focus:border-blush transition-all"
                            value={locationDetails}
                            onChange={(e) => setLocationDetails(e.target.value)}
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#E6DFD3] accent-blush cursor-pointer"
                      />
                      <span className="text-xs text-[#8C8681] font-light">
                        Salvar meus dados neste dispositivo para agendamentos futuros
                      </span>
                    </label>
                  </div>
                </div>

                <button 
                  disabled={!formData.name || !formData.email || !formData.whatsapp || formData.cpf.replace(/\D/g, '').length !== 11}
                  onClick={handleGoToPayment}
                  className="w-full py-6 bg-[#2C2A29] text-white rounded-sm text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all disabled:opacity-30 shadow-lg"
                >
                  Ir para o Pagamento
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl mx-auto space-y-12 py-8"
              >
                <button onClick={() => setStep('details')} className="text-[10px] uppercase tracking-widest text-[#8C8681] flex items-center gap-2 hover:text-blush transition-colors">
                  <ArrowLeft size={12} /> Voltar para Meus Dados
                </button>

                <div className="text-center">
                   <h3 className="text-3xl font-serif italic text-[#2C2A29] mb-4">Pagamento Seguro</h3>
                   <p className="text-sm text-[#8C8681] font-light max-w-md mx-auto leading-relaxed">Seu horário só será reservado definitivamente após a confirmação do pagamento.</p>
                </div>

                <div className="space-y-8">
                  {/* Resumo da Reserva */}
                  <div className="bg-[#FAF7F2] p-5 rounded-sm border border-[#E6DFD3] flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📸</span>
                      <div>
                        <p className="font-bold text-[#2C2A29] uppercase tracking-wider text-[11px]">{session?.name} • {activePackage?.name}</p>
                        <p className="text-[#8C8681] text-[11px]">
                          {selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : ''} às {selectedTime.substring(0, 5)}h
                        </p>
                      </div>
                    </div>
                    {supportsLocationChoice && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-[#E6DFD3] text-[11px] font-medium text-[#2C2A29]">
                        {locationType === 'externo' ? (
                          <>
                            <Trees size={13} className="text-blush" />
                            <span>Locação Externa{locationDetails ? `: ${locationDetails}` : ''}</span>
                          </>
                        ) : (
                          <>
                            <Home size={13} className="text-blush" />
                            <span>No Estúdio</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Escolha do Pacote */}
                  <div className="bg-linen/20 p-6 rounded-sm border border-sand/30">
                     <p className="text-[10px] uppercase tracking-widest text-text-light font-bold mb-4">Escolha seu pacote</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setPackageType('digital')}
                          className={`p-6 border rounded-sm text-left transition-all ${packageType === 'digital' ? 'border-blush bg-white ring-2 ring-blush/20' : 'border-sand bg-transparent hover:border-blush/30'}`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Apenas Digital</p>
                          <p className="text-3xl font-serif text-[#2C2A29] mt-2">R$ {activePackage?.price_digital}</p>
                        </button>
                        <button 
                          onClick={() => setPackageType('print')}
                          className={`p-6 border rounded-sm text-left transition-all ${packageType === 'print' ? 'border-blush bg-white ring-2 ring-blush/20' : 'border-sand bg-transparent hover:border-blush/30'}`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{activePackage?.upgrade_label || "Digital + Impressões"}</p>
                          <p className="text-3xl font-serif text-[#2C2A29] mt-2">R$ {activePackage?.price_print}</p>
                        </button>
                     </div>
                  </div>

                  {/* Forma de Pagamento */}
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-text-light font-bold">Quanto deseja pagar agora?</p>
                    
                    <button 
                      onClick={() => setPaymentType('deposit')}
                      className={`w-full p-8 border rounded-sm text-left transition-all flex justify-between items-center group ${paymentType === 'deposit' ? 'border-blush bg-white shadow-xl' : 'border-sand hover:border-blush bg-white/50'}`}
                    >
                      <div>
                        <h4 className="text-sm font-bold text-text-dark uppercase tracking-widest">Apenas a Reserva</h4>
                        <p className="text-sm text-[#2C2A29] font-medium mt-2">Pague o sinal de R$ {(session?.deposit_price || 0).toFixed(2).replace('.', ',')} para garantir a data.</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentType === 'deposit' ? 'border-blush bg-blush' : 'border-sand'}`}>
                          {paymentType === 'deposit' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>

                    <button 
                      onClick={() => setPaymentType('full')}
                      className={`w-full p-8 border rounded-sm text-left transition-all flex justify-between items-center group ${paymentType === 'full' ? 'border-blush bg-white shadow-xl' : 'border-sand hover:border-blush bg-white/50'}`}
                    >
                      <div>
                        <h4 className="text-sm font-bold text-text-dark uppercase tracking-widest">Valor Total</h4>
                        <p className="text-sm text-[#2C2A29] font-medium mt-2">Pague o valor integral e aproveite a tranquilidade.</p>
                        <p className="text-sm font-bold text-blush uppercase mt-2">
                          Total: R$ {packageType === 'digital' ? activePackage?.price_digital : activePackage?.price_print}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentType === 'full' ? 'border-blush bg-blush' : 'border-sand'}`}>
                          {paymentType === 'full' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>

                    {paymentType === 'deposit' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-5 bg-[#FAF9F7] border border-[#E6DFD3] rounded-sm">
                          <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                              <input 
                                type="checkbox" 
                                className="peer sr-only"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                              />
                              <div className="w-5 h-5 border-2 border-[#D1CCC5] rounded-sm peer-checked:bg-[#2C2A29] peer-checked:border-[#2C2A29] transition-all flex items-center justify-center">
                                {acceptedTerms && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                            </div>
                            <div className="text-xs text-[#595553] font-normal leading-relaxed">
                              Estou ciente de que o meu horário ficará reservado <strong className="text-[#2C2A29]">exclusivamente</strong> para mim. Entendo que, em caso de não comparecimento no dia e horário agendados, o valor da reserva não será reembolsado.
                            </div>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <button 
                  disabled={isLoading || (paymentType === 'deposit' && !acceptedTerms)}
                  onClick={handleFinalize}
                  className="w-full py-6 bg-blush text-white rounded-sm text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-[#C29088] transition-all disabled:opacity-30 shadow-xl flex items-center justify-center gap-4 mt-8"
                >
                  {isLoading ? "Processando..." : "Finalizar Agendamento"} <CreditCard size={18} />
                </button>
              </motion.div>
            )}

            {step === 'checkout' && (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-8 py-8"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-serif italic text-[#2C2A29]">Pagamento Seguro</h3>
                  <p className="text-sm text-[#8C8681] font-light">Escolha a melhor forma para você.</p>
                </div>

                <div id="paymentBrick_container">
                  {/* O Mercado Pago vai injetar o checkout aqui */}
                  <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-10 h-10 border-4 border-blush/20 border-t-blush rounded-full animate-spin" />
                     <p className="text-[10px] uppercase tracking-widest text-[#8C8681] mt-4 font-bold">Carregando Checkout Seguro...</p>
                  </div>
                </div>

                <button 
                  onClick={() => setStep('payment')}
                  className="w-full py-4 text-[10px] uppercase tracking-widest text-[#8C8681] hover:text-blush transition-colors"
                >
                  Alterar Opções de Pacote
                </button>
              </motion.div>
            )}

            {step === 'pix' && (
              <motion.div 
                key="pix"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto space-y-8 py-8 text-center"
              >
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif italic text-[#2C2A29]">Pagamento via Pix</h3>
                  <p className="text-sm text-[#8C8681] font-light">Escaneie o código abaixo ou copie o código Pix para finalizar seu agendamento.</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-[#E6DFD3] shadow-inner inline-block mx-auto">
                  {pixData?.qrCodeBase64 && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                      alt="QR Code Pix" 
                      className="w-64 h-64 mx-auto"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={copyPixCode}
                    className="w-full py-4 bg-[#F5F2EC] text-[#2C2A29] rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-[#E6DFD3] transition-all flex items-center justify-center gap-2"
                  >
                    Copiar Código Pix
                  </button>
                  
                  <div className="p-4 bg-blush/5 border border-blush/10 rounded-sm">
                    <p className="text-[10px] text-blush font-bold uppercase tracking-widest animate-pulse">Aguardando confirmação...</p>
                    <p className="text-[9px] text-[#8C8681] mt-2 uppercase tracking-widest">Assim que você pagar, esta tela atualizará automaticamente.</p>
                    {pixTimeLeft > 0 && (
                      <p className="text-[14px] font-bold text-amber-600 mt-3 font-mono">
                        {Math.floor(pixTimeLeft / 60)}:{String(pixTimeLeft % 60).padStart(2, '0')}
                      </p>
                    )}
                    {pixTimeLeft === 0 && (
                      <p className="text-[11px] font-bold text-red-500 mt-3 uppercase tracking-wider">QR Code expirado. Gere um novo pagamento.</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setStep('success')}
                  className="text-[10px] uppercase tracking-[0.4em] text-[#8C8681] border-b border-[#E6DFD3] pb-2 hover:text-blush transition-colors font-bold"
                >
                  Já realizei o pagamento
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success" 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-12 py-20"
              >
                <div className="w-24 h-24 bg-[#E8D8D5] rounded-full flex items-center justify-center text-blush">
                  <CheckCircle size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-serif text-text-dark italic">Tudo pronto, {formData.name.split(' ')[0]}!</h3>
                  <p className="text-sm text-text-light font-light max-w-sm mx-auto leading-loose uppercase tracking-[0.1em]">
                    Seu agendamento foi pré-confirmado com sucesso. <br/>
                    Confira seu WhatsApp em instantes! ✨🎞️
                  </p>
                </div>
                <Link href="/" className="text-[10px] uppercase tracking-[0.4em] text-text-light border-b border-sand/50 pb-2 hover:text-blush transition-colors font-bold">
                  Voltar para o Início
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

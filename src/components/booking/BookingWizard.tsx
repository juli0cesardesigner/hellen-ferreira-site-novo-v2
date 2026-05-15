"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, CheckCircle, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getAvailableSlots, createBooking, fetchSessionDetails, getMonthAvailability, processPayment } from "@/lib/actions/booking-actions";
import { useToast } from "@/components/ui/Toast";

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
    onSubmit: (paymentFormData: { formData: Record<string, unknown>; payment_method_id: string }) => Promise<void>;
    onError: (error: unknown) => void;
  };
}



interface BookingWizardProps {
  initialSessionId?: string;
  initialTier?: number;
}

export default function BookingWizard({ 
  initialSessionId = "be68f0ac-d486-4cad-8ea4-3eed090ffada", 
  initialTier = 1 
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
  const [packageType, setPackageType] = useState<'digital' | 'print'>('digital');
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [isLoading, setIsLoading] = useState(false);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode?: string; qrCodeBase64?: string; expiresAt?: string } | null>(null);
  const [pixTimeLeft, setPixTimeLeft] = useState<number>(30 * 60); // 30 min em segundos
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [mpLoaded, setMpLoaded] = useState(false);

  // Determinar o pacote ativo baseado no Tier selecionado
  const activePackage = session?.session_packages?.find((p: Package) => p.tier_order === selectedTier) || session?.session_packages?.[0];

  // Carregar Detalhes da Sessão
  useEffect(() => {
    async function loadSession() {
      const res = await fetchSessionDetails(sessionId);
      if (res.session) setSession(res.session);
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

      const renderPaymentBrick = async (bricksBuilder: { create: (type: string, id: string, settings: MercadoPagoBrickSettings) => Promise<void | { unmount: () => void }> }) => {
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
            onSubmit: async (paymentFormData: { formData: Record<string, unknown>; payment_method_id: string }) => {
              try {
                const formData = paymentFormData.formData;
                const cpf = (formData as { cpf?: string }).cpf;
                
                if (paymentFormData.payment_method_id === 'pix' && !cpf) {
                  showToast("CPF é obrigatório para pagamento via PIX. Volte para preencher.", "error");
                  return;
                }
                if (!bookingId) {
                  console.error("❌ Erro: bookingId está ausente no submit.");
                  showToast("Erro interno: ID do agendamento ausente.", "error");
                  return;
                }
                const res = await processPayment(formData, bookingId);
                
                if (res.success) {
                  if (formData.payment_method_id === 'pix') {
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
          setSelectedDateSlots(res.slots as { time: string; available: boolean; reason?: string }[]);
        }
        setIsSlotsLoading(false);
      }
      loadSlots();
    }
  }, [selectedDate, sessionId]);

  const handleNextMonth = () => {
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonthDate(next);
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonthDate);
    prev.setMonth(prev.getMonth() - 1);
    const today = new Date();
    if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) {
      return;
    }
    setCurrentMonthDate(prev);
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
      selectedTier
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
    <div className="min-h-screen bg-[#FCFBF9] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif text-[#2C2A29] italic underline decoration-blush/20 decoration-8 underline-offset-[-2px]">
            Agenda
          </h1>
          <p className="text-xs uppercase tracking-[0.4em] text-[#8C8681] font-light">Selecione seu momento</p>
        </div>

        <div className="bg-white rounded-lg p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-[#E6DFD3]/50">
          
          <AnimatePresence mode="wait">
            
            {step === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between border-b border-[#E6DFD3]/30 pb-8">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-[#F5F2EC] rounded-full transition-colors text-[#8C8681]" aria-label="Mês anterior">
                    <ChevronLeft size={24} />
                  </button>
                  <h3 className="text-2xl font-serif italic text-[#2C2A29]">
                    {session?.name || "Carregando..."} 
                    {(session?.session_packages?.length ?? 0) > 1 && (
                      <span className="text-blush text-lg ml-2">
                        — {activePackage?.name}
                      </span>
                    )}
                    <span className="text-blush opacity-30 mx-3">—</span> {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                  </h3>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-[#F5F2EC] rounded-full transition-colors text-[#8C8681]" aria-label="Próximo mês">
                    <ChevronRight size={24} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                    {dayNamesShort.map(d => (
                      <div key={d} className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681] py-2">{d}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((date, idx) => {
                      if (!date) return <div key={`empty-${idx}`} className="h-16 md:h-24" />;
                      const dateStr = date.toISOString().split('T')[0];
                      const isAvailable = monthAvailability[dateStr];
                      const isSelected = selectedDate === dateStr;
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;
                      const isPast = date < new Date(new Date().setHours(0,0,0,0));

                      return (
                        <button
                          key={dateStr}
                          disabled={isPast || !isAvailable}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedTime("");
                          }}
                          className={`relative h-16 md:h-24 flex flex-col items-center justify-center rounded-sm transition-all duration-300 group
                            ${isSelected ? 'bg-blush text-white shadow-lg z-10 scale-[1.02]' : 'hover:bg-[#F5F2EC]'}
                            ${(!isAvailable || isPast) ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                            ${isToday && !isSelected ? 'text-blush font-bold' : 'text-[#2C2A29]'}
                          `}
                        >
                          <span className="text-xl md:text-2xl font-serif">{date.getDate()}</span>
                          {isAvailable && !isSelected && !isPast && (
                            <span className="w-1 h-1 bg-blush/40 rounded-full mt-1 group-hover:bg-blush transition-colors" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                {!isLoading && Object.keys(monthAvailability).length > 0 && !Object.values(monthAvailability).some(Boolean) && (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-sm italic font-serif text-[#8C8681]">Sem datas disponíveis neste mês.</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8681]/60">Navegue para o próximo mês →</p>
                  </div>
                )}
                </div>

                {selectedDate && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="pt-10 border-t border-[#E6DFD3] space-y-8"
                  >
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C8681]">Horários para o dia</span>
                       <h4 className="text-2xl font-serif italic text-[#2C2A29]">
                         {new Date(selectedDate + "T12:00:00").toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                       </h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      {isSlotsLoading ? (
                        [1,2,3,4].map(i => <div key={i} className="h-14 bg-[#F5F1EE] animate-pulse rounded-sm" />)
                      ) : selectedDateSlots.filter(s => s.available).length > 0 ? (
                        selectedDateSlots.filter(s => s.available).map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-4 rounded-sm text-[11px] uppercase tracking-widest font-bold border transition-all
                              ${selectedTime === slot.time 
                                ? 'bg-[#2C2A29] text-white border-[#2C2A29] shadow-lg' 
                                : 'bg-white text-[#595552] border-[#E6DFD3] hover:border-blush hover:text-blush'}
                            `}
                          >
                            {slot.time.substring(0, 5)}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-sm italic text-[#8C8681]">
                          Não há horários disponíveis para este dia.
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center pt-8">
                       <button 
                        disabled={!selectedTime || !selectedDate}
                        onClick={() => setStep('details')}
                        className="group flex items-center gap-6 px-16 py-6 bg-[#2C2A29] text-white rounded-sm text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-black transition-all disabled:opacity-30 shadow-2xl"
                      >
                        Próximo Passo <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}
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
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#8C8681]">CPF (Opcional - Obrigatório apenas para PIX)</label>
                     <input 
                      type="text" placeholder="000.000.000-00"
                      className="w-full p-5 bg-white border border-[#E6DFD3] rounded-sm text-sm outline-none focus:border-blush"
                      value={formData.cpf} onChange={handleCpfChange}
                    />
                  </div>
                </div>

                <button 
                  disabled={!formData.name || !formData.whatsapp}
                  onClick={() => setStep('payment')}
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
                  {/* Escolha do Pacote */}
                  <div className="bg-linen/20 p-6 rounded-sm border border-sand/30">
                     <p className="text-[10px] uppercase tracking-widest text-text-light font-bold mb-4">Escolha seu pacote</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setPackageType('digital')}
                          className={`p-6 border rounded-sm text-left transition-all ${packageType === 'digital' ? 'border-blush bg-white ring-2 ring-blush/20' : 'border-sand bg-transparent hover:border-blush/30'}`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Apenas Digital</p>
                          <p className="text-2xl font-serif italic text-text-dark">R$ {activePackage?.price_digital}</p>
                        </button>
                        <button 
                          onClick={() => setPackageType('print')}
                          className={`p-6 border rounded-sm text-left transition-all ${packageType === 'print' ? 'border-blush bg-white ring-2 ring-blush/20' : 'border-sand bg-transparent hover:border-blush/30'}`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{activePackage?.upgrade_label || "Digital + Impressões"}</p>
                          <p className="text-2xl font-serif italic text-text-dark">R$ {activePackage?.price_print}</p>
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
                        <p className="text-xs text-text-light mt-2 italic font-serif">Pague o sinal de R$ {(session?.deposit_price || 0).toFixed(2).replace('.', ',')} para garantir a data.</p>
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
                        <p className="text-xs text-text-light mt-2 italic font-serif">Pague o valor integral e aproveite a tranquilidade.</p>
                        <p className="text-[10px] font-bold text-blush uppercase mt-1">
                          Total: R$ {packageType === 'digital' ? activePackage?.price_digital : activePackage?.price_print}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentType === 'full' ? 'border-blush bg-blush' : 'border-sand'}`}>
                          {paymentType === 'full' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  onClick={handleFinalize}
                  className="w-full py-6 bg-blush text-white rounded-sm text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-[#C29088] transition-all disabled:opacity-30 shadow-xl flex items-center justify-center gap-4"
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

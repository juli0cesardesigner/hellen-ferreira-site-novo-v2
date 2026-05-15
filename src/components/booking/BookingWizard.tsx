"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, Check, ArrowRight, CreditCard, QrCode, Mail, User, Smartphone, FileText, Info } from "lucide-react";
import Link from "next/link";
import { getAvailableSlots, createBooking, fetchSessionDetails, getMonthAvailability, processPayment } from "@/lib/actions/booking-actions";
import { useToast } from "@/components/ui/Toast";
import { fbEvent, fbInit } from "@/components/analytics/FacebookPixel";

import { SessionWithPackages, Package } from "@/types/database";

interface BookingWizardProps {
  sessionId: string;
}

type Step = 'date' | 'details' | 'checkout' | 'pix' | 'success';
type PaymentType = 'deposit' | 'full';
type PackageType = 'digital' | 'print';

export function BookingWizard({ sessionId }: BookingWizardProps) {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [packageType, setPackageType] = useState<PackageType>('digital');
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    cpf: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [session, setSession] = useState<SessionWithPackages | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string, qrCodeBase64: string, id: string } | null>(null);
  const [pixTimeLeft, setPixTimeLeft] = useState(3600); // 1 hora para o Pix
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { addToast } = useToast();

  // Carregar detalhes da sessão
  useEffect(() => {
    async function loadSession() {
      const { session: sessionData } = await fetchSessionDetails(sessionId);
      setSession(sessionData);
    }
    loadSession();
  }, [sessionId]);

  // Carregar slots quando a data for selecionada
  useEffect(() => {
    if (selectedDate) {
      async function loadSlots() {
        const slots = await getAvailableSlots(sessionId, selectedDate);
        setAvailableSlots(slots);
      }
      loadSlots();
    }
  }, [selectedDate, sessionId]);

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
    }
    if (step === 'checkout') {
      fbEvent('AddPaymentInfo', {
        content_name: session?.name,
        value: (paymentType === 'deposit' ? session?.deposit_price : (packageType === 'digital' ? activePackage?.price_digital : activePackage?.price_print)) ?? 0,
        currency: 'BRL'
      });
    }
    if (step === 'success') {
      fbEvent('Purchase', {
        content_name: session?.name,
        content_ids: [sessionId],
        content_type: 'product',
        value: (paymentType === 'deposit' ? session?.deposit_price : (packageType === 'digital' ? activePackage?.price_digital : activePackage?.price_print)) ?? 0,
        currency: 'BRL'
      });
    }
  }, [step, session?.name, sessionId, paymentType, packageType, activePackage, session?.deposit_price]);

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const activePackage = session?.session_packages?.find(p => p.tier_order === selectedTier);

  const handleNextStep = () => {
    if (step === 'date') setStep('details');
    else if (step === 'details') setStep('checkout');
  };

  const handlePrevStep = () => {
    if (step === 'details') setStep('date');
    else if (step === 'checkout') setStep('details');
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

    if (res.error) {
      addToast(res.error, "error");
      setIsLoading(false);
      return;
    }

    if (res.paymentMethod === 'pix') {
      setPixData({
        qrCode: res.pixCopiaECola || "",
        qrCodeBase64: res.pixQrCode || "",
        id: res.paymentId || ""
      });
      setStep('pix');
    } else if (res.preferenceId) {
      // Iniciar checkout do Mercado Pago
      // @ts-ignore
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
      mp.checkout({
        preference: {
          id: res.preferenceId
        },
        autoOpen: true
      });
    }

    setIsLoading(false);
  };
...

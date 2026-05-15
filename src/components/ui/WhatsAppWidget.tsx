"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";
import { fbEvent } from "@/components/analytics/FacebookPixel";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartConversation = () => {
    fbEvent('Contact', { 
      method: 'WhatsApp',
      content_name: 'Suporte/Agendamento via WhatsApp'
    });
    window.open(SITE_CONFIG.social.whatsappLink, "_blank");
    setIsOpen(false);
  };
...

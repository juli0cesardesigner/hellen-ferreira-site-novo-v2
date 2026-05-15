"use client";

import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

import { getSlugById } from "@/lib/data/sessions";
import { fbEvent } from "@/components/analytics/FacebookPixel";

interface BookingCTAProps {
  sessionName: string;
  sessionId: string;
}

export function BookingCTA({ sessionName, sessionId }: BookingCTAProps) {
  React.useEffect(() => {
    fbEvent('ViewContent', {
      content_name: sessionName,
      content_ids: [sessionId],
      content_type: 'product'
    });
  }, [sessionName, sessionId]);

  return (
...

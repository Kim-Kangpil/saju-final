"use client";
import { useEffect } from "react";

export default function PaymentClosePage() {
  useEffect(() => {
    window.close();
  }, []);
  return null;
}

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { CreditCard, Check, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

// Textos para soportar múltiples idiomas
const texts = {
  es: {
    backToRegister: "Volver al registro",
    title: "Finalizar su compra",
    standardPlan: "Plan Estándar",
    premiumPlan: "Plan Premium",
    standardDesc: "Ideal para conjuntos de hasta 50 unidades",
    premiumDesc: "Ideal para conjuntos de hasta 120 unidades",
    monthly: "por mes",
    orderSummary: "Resumen del pedido",
    plan: "Plan",
    subtotal: "Subtotal",
    tax: "IVA (19%)",
    total: "Total",
    paymentMethod: "Método de pago",
    creditCard: "Tarjeta de crédito/débito",
    cardNumber: "Número de tarjeta",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    expiryDate: "Fecha de expiración",
    expiryDatePlaceholder: "MM/AA",
    cvv: "CVV",
    cvvPlaceholder: "123",
    cardholderName: "Nombre del titular",
    cardholderNamePlaceholder: "Nombre como aparece en la tarjeta",
    securePayment: "Pago seguro",
    securePaymentDesc: "Su información es procesada de forma segura. Sus datos de pago nunca son almacenados.",
    cancelPayment: "Cancelar",
    completePayment: "Completar pago",
    processingPayment: "Procesando pago...",
    paymentSuccess: "¡Pago exitoso! Ahora complete su registro.",
    continueToRegister: "Continuar al registro",
    errorMessage: "Error al procesar el pago. Por favor, inténtelo de nuevo.",
    tryAgain: "Intentar de nuevo",
    transactionId: "ID de transacción:",
    testModeWarning: "MODO DE PRUEBA: Use cualquier número de tarjeta para simular un pago exitoso.",
    verifyingPayment: "Verificando el estado del pago..."
  },
  en: {
    backToRegister: "Back to registration",
    title: "Complete your purchase",
    standardPlan: "Standard Plan",
    premiumPlan: "Premium Plan",
    standardDesc: "Perfect for communities with up to 50 units",
    premiumDesc: "Perfect for communities with up to 120 units",
    monthly: "per month",
    orderSummary: "Order Summary",
    plan: "Plan",
    subtotal: "Subtotal",
    tax: "VAT (19%)",
    total: "Total",
    paymentMethod: "Payment Method",
    creditCard: "Credit/Debit Card",
    cardNumber: "Card Number",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    expiryDate: "Expiry Date",
    expiryDatePlaceholder: "MM/YY",
    cvv: "CVV",
    cvvPlaceholder: "123",
    cardholderName: "Cardholder Name",
    cardholderNamePlaceholder: "Name as it appears on card",
    securePayment: "Secure Payment",
    securePaymentDesc: "Your information is processed securely. We do not store your payment details.",
    cancelPayment: "Cancel",
    completePayment: "Complete Payment",
    processingPayment: "Processing payment...",
    paymentSuccess: "Payment successful! Now complete your registration.",
    continueToRegister: "Continue to Registration",
    errorMessage: "Error processing payment. Please try again.",
    tryAgain: "Try Again",
    transactionId: "Transaction ID:",
    testModeWarning: "TEST MODE: Use any card number to simulate a successful payment.",
    verifyingPayment: "Verifying payment status..."
  }
};

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = searchParams.get("plan") || "standard";
  const [language, setLanguage] = useState("Español");
  const [currency, setCurrency] = useState("Pesos");
  const [theme, setTheme] = useState("Claro");
  const [paymentStep, setPaymentStep] = useState("form"); // form, processing, verifying, success, error
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [transactionId, setTransactionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Obtener los textos traducidos
  const t = language === "Español" ? texts.es : texts.en;
  
  // Función para verificar el estado del pago usando la API
  const verifyPayment = async (txId: string) => {
    try {
      // Simulación de verificación de pago
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulamos una respuesta exitosa
      const response = { ok: true };
      
      if (response && response.ok) {
        localStorage.setItem("paymentCompleted", "true");
        localStorage.setItem("transactionId", txId);
        setPaymentStep("success");
      } else {
        setErrorMessage(t.errorMessage);
        setPaymentStep("error");
      }
    } catch (error: unknown) {
      console.error('Error al verificar pago:', error);
      setErrorMessage(((error as Error).message) || t.errorMessage);
      setPaymentStep("error");
    }
  };
  
  const handleCancel = () => {
    // Volver a la página de registro manteniendo el plan seleccionado
    router.push(`/register-complex?plan=${planType}`);
  };
  
  // Cálculo de precios basado en el plan y la moneda
  const getPriceDetails = () => {
    let basePrice = 0;
    if (planType === "standard") {
      basePrice = currency === "Dólares" ? 25 : 95000;
    } else if (planType === "premium") {
      basePrice = currency === "Dólares" ? 50 : 190000;
    }
    
    const tax = basePrice * 0.19;
    const total = basePrice + tax;
    
    return {
      basePrice,
      tax,
      total,
      symbol: currency === "Dólares" ? "$" : "$",
      Code: currency === "Dólares" ? "USD" : "COP"
    };
  };
  
  const priceDetails = getPriceDetails();
  
  return (
    <div className={`flex flex-col min-h-screen ${theme === "Oscuro" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header compartido */}
      <Header 
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        hideNavLinks={true}
      />

      <div className="pt-5 flex-grow">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              className="text-indigo-600 hover:bg-indigo-50"
              disabled={paymentStep === "processing" || paymentStep === "verifying"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToRegister}
            </Button>
          </div>
          
          <div className="mb-3 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{t.title}</h1>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Resumen del pedido */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold mb-4">{t.orderSummary}</h2>
                  
                  <div className="mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {planType === "standard" ? t.standardPlan : t.premiumPlan}
                        </div>
                        <div className="text-sm text-gray-500">
                          {planType === "standard" ? t.standardDesc : t.premiumDesc}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.subtotal}</span>
                      <span>{priceDetails.symbol}{priceDetails.basePrice.toLocaleString()} {priceDetails.Code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t.tax}</span>
                      <span>{priceDetails.symbol}{priceDetails.tax.toLocaleString()} {priceDetails.Code}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 mt-2">
                      <span>{t.total}</span>
                      <span>{priceDetails.symbol}{priceDetails.total.toLocaleString()} {priceDetails.Code}</span>
                    </div>
                    <div className="text-sm text-gray-500 text-center italic pt-2">
                      {t.monthly}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

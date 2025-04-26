"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { ArrowLeft, CreditCard, Check, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";

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
    verifyingPayment: "Verificando el estado del pago...",
    cardNumberRequired: "El número de tarjeta es obligatorio",
    invalidCardNumber: "El número de tarjeta no es válido",
    expiryDateRequired: "La fecha de expiración es obligatoria",
    invalidExpiryFormat: "Formato inválido (MM/AA)",
    cvvRequired: "El CVV es obligatorio",
    invalidCvv: "El CVV debe tener 3 o 4 dígitos",
    cardholderRequired: "El nombre del titular es obligatorio"
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
    verifyingPayment: "Verifying payment status...",
    cardNumberRequired: "Card number is required",
    invalidCardNumber: "Invalid card number",
    expiryDateRequired: "Expiry date is required",
    invalidExpiryFormat: "Invalid format (MM/YY)",
    cvvRequired: "CVV is required",
    invalidCvv: "CVV must be 3 or 4 digits",
    cardholderRequired: "Cardholder name is required"
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [complexData, setComplexData] = useState<any>(null);
  
  // Obtener los textos traducidos
  const t = language === "Español" ? texts.es : texts.en;
  
  // Función para validar el formulario de pago
  const validatePaymentForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validar número de tarjeta
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = t.cardNumberRequired;
      isValid = false;
    } else if (!/^[0-9\s]{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = t.invalidCardNumber;
      isValid = false;
    }

    // Validar fecha de expiración
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = t.expiryDateRequired;
      isValid = false;
    } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.expiryDate)) {
      errors.expiryDate = t.invalidExpiryFormat;
      isValid = false;
    }

    // Validar CVV
    if (!formData.cvv.trim()) {
      errors.cvv = t.cvvRequired;
      isValid = false;
    } else if (!/^[0-9]{3,4}$/.test(formData.cvv)) {
      errors.cvv = t.invalidCvv;
      isValid = false;
    }

    // Validar nombre del titular
    if (!formData.cardholderName.trim()) {
      errors.cardholderName = t.cardholderRequired;
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Guardar el estado del plan en localStorage y recuperar los datos del conjunto
  useEffect(() => {
    // Almacenar el tipo de plan para recuperarlo después del pago
    if (planType && (planType === "standard" || planType === "premium")) {
      localStorage.setItem("selectedPlan", planType);
      
      // Recuperar datos del conjunto si existen
      const storedFormData = localStorage.getItem("complexFormData");
      if (storedFormData) {
        try {
          const parsedData = JSON.parse(storedFormData);
          setComplexData(parsedData);
        } catch (error) {
          console.error('Error al recuperar datos del formulario:', error);
        }
      }
    }
  }, [planType]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar formato según el campo
    let formattedValue = value;
    
    // Formatear número de tarjeta (agrupar en bloques de 4)
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\D/g, '') // Eliminar cualquier caracter que no sea un número
        .replace(/(\d{4})(?=\d)/g, '$1 ') // Agrupar en bloques de 4 dígitos
        .substring(0, 19); // Limitar a 19 caracteres (16 números + 3 espacios)
    }
    
    // Formatear fecha de expiración (MM/AA)
    if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, '') // Eliminar cualquier caracter que no sea un número
        .replace(/^(\d{2})(\d)/, '$1/$2') // Añadir / después de los primeros 2 dígitos
        .substring(0, 5); // Limitar a 5 caracteres (MM/AA)
    }
    
    // Formatear CVV (solo números)
    if (name === "cvv") {
      formattedValue = value
        .replace(/\D/g, '') // Eliminar cualquier caracter que no sea un número
        .substring(0, 4); // Limitar a 4 caracteres
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Limpiar error de validación si el campo tiene uno
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated[name];
        return updated;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar el formulario antes de proceder
    if (!validatePaymentForm()) {
      return;
    }
    
    try {
      // Cambiar a estado de procesamiento
      setPaymentStep("processing");
      
      // Obtener los detalles del precio
      const priceDetails = getPriceDetails();
      
      // Preparar datos para enviar a la API
      const paymentData = {
        planCode: planType,
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName,
        amount: priceDetails.total,
        currency: priceDetails.currencyCode,
        // Incluir datos del conjunto si existen para crear un registro temporal
        complexData: complexData ? {
          complexName: complexData.complexName,
          totalUnits: parseInt(complexData.units || '0'),
          adminEmail: complexData.adminEmail,
          adminName: complexData.adminName
        } : null
      };
      
      // Enviar la solicitud de pago a la API
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar el pago');
      }
      
      // Guardar el ID de transacción
      setTransactionId(data.transactionId);
      
      if (data.success) {
        // Si el pago fue exitoso, almacenamos en localStorage
        localStorage.setItem("paymentCompleted", "true");
        localStorage.setItem("transactionId", data.transactionId);
        // Asegurar que el planCode también se almacene
        localStorage.setItem("selectedPlan", planType);
        
        // Si hay un complexId, lo almacenamos también
        if (data.complexId) {
          localStorage.setItem("tempComplexId", data.complexId.toString());
        }
        
        // Imprimir en consola para depuración
        console.log('Pago procesado correctamente', {
          transactionId: data.transactionId,
          planType: planType,
          paymentCompleted: true
        });
        
        // Cambiar al estado de éxito
        setPaymentStep("success");
      } else {
        // Si el pago falló
        setErrorMessage(data.message || t.errorMessage);
        setPaymentStep("error");
      }
      
    } catch (error: any) {
      console.error('Error de pago:', error);
      setErrorMessage(error.message || t.errorMessage);
      setPaymentStep("error");
    }
  };
  
  // Función para verificar el estado del pago usando la API
  const verifyPayment = async (txId: string) => {
    try {
      setPaymentStep("verifying");
      
      const response = await fetch(`/api/payment/verify?transactionId=${txId}`);
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem("paymentCompleted", "true");
        localStorage.setItem("transactionId", txId);
        setPaymentStep("success");
      } else {
        setErrorMessage(data.message || t.errorMessage);
        setPaymentStep("error");
      }
    } catch (error: any) {
      console.error('Error al verificar pago:', error);
      setErrorMessage(error.message || t.errorMessage);
      setPaymentStep("error");
    }
  };
  
  const handleCancel = () => {
    // Volver a la página de registro manteniendo el plan seleccionado
    router.push(`/register-complex?plan=${planType}`);
  };
  
  const handleContinue = () => {
    // Asegurarnos que tenemos todos los datos necesarios en localStorage
    const tId = localStorage.getItem("transactionId");
    
    if (!tId && transactionId) {
      localStorage.setItem("transactionId", transactionId);
    }
    
    localStorage.setItem("paymentCompleted", "true");
    localStorage.setItem("selectedPlan", planType);
    
    console.log('Redirigiendo a registro con plan pagado', {
      transactionId: tId || transactionId,
      planType: planType,
      paymentCompleted: true
    });
    
    // Continuar al registro con el plan ya pagado
    router.push(`/register-complex?plan=${planType}&paid=true`);
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
      currencyCode: currency === "Dólares" ? "USD" : "COP"
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
                      <span>{priceDetails.symbol}{priceDetails.basePrice.toLocaleString()} {priceDetails.currencyCode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t.tax}</span>
                      <span>{priceDetails.symbol}{priceDetails.tax.toLocaleString()} {priceDetails.currencyCode}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 mt-2">
                      <span>{t.total}</span>
                      <span>{priceDetails.symbol}{priceDetails.total.toLocaleString()} {priceDetails.currencyCode}</span>
                    </div>
                    <div className="text-sm text-gray-500 text-center italic pt-2">
                      {t.monthly}
                    </div>
                  </div>
                  
                  {/* Aviso de modo de prueba */}
                  <div className="mt-4 bg-blue-50 p-3 rounded-md text-blue-600 text-sm flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t.testModeWarning}</span>
                  </div>
                </div>
              </div>
              
              {/* Formulario de pago */}
              <div className="md:col-span-2">
                {paymentStep === "form" && (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">{t.paymentMethod}</h2>
                    
                    <div className="mb-4 p-3 border border-gray-200 rounded-md flex items-center">
                      <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="font-medium">{t.creditCard}</span>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          {t.cardNumber}
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder={t.cardNumberPlaceholder}
                          className={`w-full px-4 py-2 border ${validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          required
                          maxLength={19}
                        />
                        {validationErrors.cardNumber && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.cardNumber}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.expiryDate}
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder={t.expiryDatePlaceholder}
                            className={`w-full px-4 py-2 border ${validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                            required
                            maxLength={5}
                          />
                          {validationErrors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.expiryDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.cvv}
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder={t.cvvPlaceholder}
                            className={`w-full px-4 py-2 border ${validationErrors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                            required
                            maxLength={4}
                          />
                          {validationErrors.cvv && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.cvv}</p>
                          )}
                        </div>
                        
                        <div className="col-span-3">
                          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.cardholderName}
                          </label>
                          <input
                            type="text"
                            id="cardholderName"
                            name="cardholderName"
                            value={formData.cardholderName}
                            onChange={handleChange}
                            placeholder={t.cardholderNamePlaceholder}
                            className={`w-full px-4 py-2 border ${validationErrors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                            required
                          />
                          {validationErrors.cardholderName && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.cardholderName}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-start mt-4">
                        <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{t.securePayment}</h3>
                          <p className="text-xs text-gray-500">{t.securePaymentDesc}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                        >
                          {t.cancelPayment}
                        </Button>
                        
                        <Button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {t.completePayment}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                
                {(paymentStep === "processing" || paymentStep === "verifying") && (
                  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold">
                      {paymentStep === "processing" ? t.processingPayment : t.verifyingPayment}
                    </h2>
                    <p className="text-gray-500 mt-2">Por favor, no cierre esta ventana...</p>
                  </div>
                )}
                
                {paymentStep === "success" && (
                  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-64">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-center">{t.paymentSuccess}</h2>
                    
                    {transactionId && (
                      <p className="text-sm text-gray-500 mt-2">
                        {t.transactionId} <span className="font-mono font-medium">{transactionId}</span>
                      </p>
                    )}
                    
                    <Button
                      onClick={handleContinue}
                      className="mt-6 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {t.continueToRegister}
                    </Button>
                  </div>
                )}
                
                {paymentStep === "error" && (
                  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-64">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-red-600 text-2xl font-bold">✕</span>
                    </div>
                    <h2 className="text-xl font-semibold text-center text-red-600">{errorMessage || t.errorMessage}</h2>
                    <div className="flex space-x-4 mt-6">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                      >
                        {t.cancelPayment}
                      </Button>
                      <Button
                        onClick={() => setPaymentStep("form")}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {t.tryAgain}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Armonía. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

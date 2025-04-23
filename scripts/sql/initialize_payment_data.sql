-- Inicializar las tablas de pagos
-- Ejecutar después de create_payment_tables.sql

-- Inicializar algunos datos de prueba para probar la integración del checkout
-- y el registro con pagos

-- Asegurarse de que los planes estén creados con los precios correctos
UPDATE "armonia"."Plan" 
SET "monthlyPrice" = 25
WHERE code = 'standard';

UPDATE "armonia"."Plan" 
SET "monthlyPrice" = 50 
WHERE code = 'premium';

-- Insertar algunas transacciones de prueba
INSERT INTO "armonia"."PaymentTransaction" (
  "complexId", "planCode", amount, currency, status, 
  "paymentMethod", "transactionId", "paymentGateway", "gatewayResponse", "expiresAt"
) VALUES 
(NULL, 'standard', 29.75, 'USD', 'COMPLETED', 'CREDIT_CARD', 'TR-TEST-STANDARD-001', 'SIMULATION', 
 '{"success": true, "message": "Payment processed successfully", "date": "2025-04-23T10:00:00Z", "last4": "4242", "cardType": "VISA"}'::jsonb,
 NOW() + INTERVAL '30 days'),
 
(NULL, 'premium', 59.50, 'USD', 'COMPLETED', 'CREDIT_CARD', 'TR-TEST-PREMIUM-001', 'SIMULATION', 
 '{"success": true, "message": "Payment processed successfully", "date": "2025-04-23T11:30:00Z", "last4": "5555", "cardType": "MASTERCARD"}'::jsonb,
 NOW() + INTERVAL '30 days'),
 
(NULL, 'standard', 29.75, 'USD', 'FAILED', 'CREDIT_CARD', 'TR-TEST-FAILED-001', 'SIMULATION', 
 '{"success": false, "message": "Payment failed: insufficient funds", "date": "2025-04-23T12:15:00Z", "last4": "1234", "cardType": "VISA"}'::jsonb,
 NOW() + INTERVAL '30 days');

-- Crear cuentas de prueba en COP
INSERT INTO "armonia"."PaymentTransaction" (
  "complexId", "planCode", amount, currency, status, 
  "paymentMethod", "transactionId", "paymentGateway", "gatewayResponse", "expiresAt"
) VALUES 
(NULL, 'standard', 113050, 'COP', 'COMPLETED', 'CREDIT_CARD', 'TR-TEST-STANDARD-COP-001', 'SIMULATION', 
 '{"success": true, "message": "Pago procesado correctamente", "date": "2025-04-23T14:00:00Z", "last4": "4242", "cardType": "VISA"}'::jsonb,
 NOW() + INTERVAL '30 days'),
 
(NULL, 'premium', 226100, 'COP', 'COMPLETED', 'CREDIT_CARD', 'TR-TEST-PREMIUM-COP-001', 'SIMULATION', 
 '{"success": true, "message": "Pago procesado correctamente", "date": "2025-04-23T15:30:00Z", "last4": "5555", "cardType": "MASTERCARD"}'::jsonb,
 NOW() + INTERVAL '30 days');

-- Mostrar las transacciones de prueba
SELECT "transactionId", "planCode", amount, currency, status FROM "armonia"."PaymentTransaction";

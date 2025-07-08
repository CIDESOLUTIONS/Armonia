// src/lib/pdf/pdfGenerator.ts
// Este archivo ahora está vacío ya que la lógica de generación de PDF se ha centralizado en receipt-service.ts
export async function generatePDF(
  template: string,
  data: any,
  outputPath: string
): Promise<string> {
  console.warn('generatePDF en pdfGenerator.ts es un stub. Usa generateReceipt de receipt-service.ts en su lugar.');
  return outputPath;
}

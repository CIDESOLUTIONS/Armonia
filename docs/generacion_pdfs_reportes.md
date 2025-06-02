# Implementación de Generación de PDFs para Reportes - Proyecto Armonía

## Resumen Ejecutivo

Este documento detalla la implementación de la funcionalidad de generación de PDFs para reportes en el proyecto Armonía, como parte de la Fase 1 del Plan Integral de Desarrollo. El objetivo es reemplazar el stub existente con una solución robusta que permita generar reportes financieros y de pagos en formato PDF de alta calidad, utilizando plantillas HTML/CSS para mayor flexibilidad y personalización.

## Análisis de Requisitos y Selección de Librería

### Requisitos Identificados

1.  **Generación de PDFs**: El sistema debe poder generar documentos PDF para diversos tipos de reportes (financieros, de pagos, etc.).
2.  **Formato Personalizado**: Los reportes deben tener un formato profesional, incluyendo encabezados, pies de página, tablas, y potencialmente gráficos.
3.  **Basado en Plantillas**: La generación debe basarse en plantillas (preferiblemente HTML/CSS) para facilitar el diseño y mantenimiento.
4.  **Integración**: La solución debe integrarse con el backend existente (Node.js/Next.js).
5.  **Rendimiento**: La generación debe ser eficiente para no impactar negativamente la experiencia del usuario.
6.  **Soporte de Idiomas**: Considerar la posibilidad de generar reportes en diferentes idiomas (Español/Inglés según `CustomReportGenerator.tsx`).

### Bibliotecas Consideradas

-   **FPDF2**: Adecuada para PDFs simples basados en texto, pero limitada para layouts complejos y estilos CSS.
-   **xhtml2pdf**: Convierte HTML a PDF, pero tiene soporte limitado para CSS moderno.
-   **WeasyPrint**: Renderiza HTML/CSS moderno a PDF, ofreciendo gran flexibilidad en el diseño y buen soporte para estándares web, incluyendo fuentes personalizadas e idiomas.

### Selección

Se ha seleccionado **WeasyPrint** como la biblioteca principal para la generación de PDFs. Su capacidad para interpretar HTML y CSS modernos permite crear reportes visualmente atractivos y complejos utilizando tecnologías web estándar. Esto facilita la creación y mantenimiento de plantillas.

## Diseño de la Solución

1.  **Servicio de Generación PDF**: Se creará un servicio (`pdfGenerationService.ts`) que encapsulará la lógica de generación utilizando WeasyPrint. Este servicio se ejecutará en un entorno Python separado o se llamará a través de un endpoint API dedicado, ya que WeasyPrint es una biblioteca Python.
2.  **Plantillas HTML/CSS**: Se crearán plantillas HTML (posiblemente usando un motor de plantillas como Handlebars o EJS si se ejecuta en Node.js antes de pasar a Python, o Jinja2 si se usa Python directamente) para cada tipo de reporte. Las plantillas incluirán placeholders para los datos dinámicos y estilos CSS para el formato.
3.  **Endpoint API**: Se definirá un endpoint API (ej. `/api/reports/generate-pdf`) que recibirá los datos del reporte y el tipo de plantilla, invocará al servicio de generación y devolverá el PDF generado o una URL para descargarlo.
4.  **Integración con Frontend**: El componente `CustomReportGenerator.tsx` llamará a este endpoint API cuando el usuario solicite un reporte en formato PDF.

## Implementación (Ejemplo con WeasyPrint en Python)

Dado que WeasyPrint es una biblioteca Python, se propone un microservicio Python simple o una función serverless para manejar la generación de PDF.

### 1. Microservicio Python (Flask)

```python
# pdf_service.py
from flask import Flask, request, send_file
from weasyprint import HTML, CSS
import tempfile
import os
import jinja2

app = Flask(__name__)

# Configurar Jinja2 para cargar plantillas
template_loader = jinja2.FileSystemLoader(searchpath="./templates")
template_env = jinja2.Environment(loader=template_loader)

# Cargar CSS común
common_css = CSS(filename=\'./static/css/report_styles.css\')

@app.route("/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.json
        template_name = data.get("template")
        report_data = data.get("data")
        language = data.get("language", "Español") # Default a Español

        if not template_name or not report_data:
            return {"error": "Faltan datos: template o data"}, 400

        # Cargar plantilla Jinja2
        template_file = f"{template_name}_{language.lower()}.html"
        try:
            template = template_env.get_template(template_file)
        except jinja2.TemplateNotFound:
             # Fallback a plantilla genérica si no existe la específica del idioma
             template_file = f"{template_name}.html"
             template = template_env.get_template(template_file)
             
        # Renderizar HTML con los datos
        html_content = template.render(report_data)

        # Crear archivo temporal para el PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            output_path = temp_pdf.name
            
            # Generar PDF con WeasyPrint
            HTML(string=html_content, base_url=".").write_pdf(
                output_path,
                stylesheets=[common_css]
            )

        # Enviar el archivo PDF
        return send_file(
            output_path,
            as_attachment=True,
            download_name=f"{template_name}_report.pdf",
            mimetype=\'application/pdf\'
        )

    except jinja2.TemplateNotFound:
        return {"error": f"Plantilla no encontrada: {template_file}"}, 404
    except Exception as e:
        print(f"Error generando PDF: {e}")
        return {"error": "Error interno al generar el PDF"}, 500
    finally:
        # Limpiar archivo temporal si existe
        if \'output_path\' in locals() and os.path.exists(output_path):
            os.remove(output_path)

if __name__ == \'__main__\':
    # Escuchar en todas las interfaces para accesibilidad externa
    app.run(host=\'0.0.0.0\', port=5001)
```

### 2. Plantilla HTML de Ejemplo (Jinja2)

```html
<!-- templates/financial_report_español.html -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Financiero</title>
    <link rel="stylesheet" href="../static/css/report_styles.css">
</head>
<body>
    <header>
        <img src="../static/images/logo.png" alt="Logo Armonía" class="logo">
        <h1>Reporte Financiero</h1>
        <p>Periodo: {{ data.startDate }} - {{ data.endDate }}</p>
    </header>

    <section class="summary">
        <h2>Resumen Ejecutivo</h2>
        <table>
            <tr><th>Total Ingresos:</th><td>{{ data.totalIncome | format_currency }}</td></tr>
            <tr><th>Total Gastos:</th><td>{{ data.totalExpenses | format_currency }}</td></tr>
            <tr><th>Balance:</th><td>{{ data.balance | format_currency }}</td></tr>
            <tr><th>Tasa de Recaudo:</th><td>{{ data.collectionRate | format_percent }}</td></tr>
            <tr><th>Monto Vencido:</th><td>{{ data.overdueAmount | format_currency }}</td></tr>
            <tr><th>Ejecución Presupuestal:</th><td>{{ data.budgetExecution | format_percent }}</td></tr>
        </table>
    </section>

    <section class="details">
        <h2>Detalle de Unidades en Mora</h2>
        <table>
            <thead>
                <tr><th>Unidad</th><th>Monto Adeudado</th><th>Meses Vencidos</th></tr>
            </thead>
            <tbody>
                {% for unit in data.delinquentUnits %}
                <tr>
                    <td>{{ unit.unit }}</td>
                    <td>{{ unit.amount | format_currency }}</td>
                    <td>{{ unit.monthsOverdue }}</td>
                </tr>
                {% else %}
                <tr><td colspan="3">No hay unidades en mora.</td></tr>
                {% endfor %}
            </tbody>
        </table>
    </section>

    <footer>
        Generado el {{ generation_date }}
    </footer>
</body>
</html>
```

### 3. Archivo CSS de Ejemplo

```css
/* static/css/report_styles.css */
@font-face {
    font-family: 'NotoSansCJK';
    src: url('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc');
}

body {
    font-family: 'NotoSansCJK', 'Helvetica', sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    margin: 2cm;
}

header {
    text-align: center;
    margin-bottom: 1cm;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.5cm;
}

header h1 {
    font-size: 16pt;
    margin: 0;
}

header p {
    font-size: 9pt;
    color: #555;
}

.logo {
    max-width: 150px;
    max-height: 50px;
    margin-bottom: 0.5cm;
}

section {
    margin-bottom: 1cm;
}

section h2 {
    font-size: 12pt;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.2cm;
    margin-bottom: 0.5cm;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.5cm;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

thead th {
    background-color: #f2f2f2;
    font-weight: bold;
}

.summary table th {
    width: 40%;
    background-color: transparent;
    border: none;
    font-weight: bold;
}

.summary table td {
    border: none;
    text-align: right;
}

footer {
    position: fixed;
    bottom: -1cm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8pt;
    color: #888;
}

/* WeasyPrint specific page numbering */
@page {
    size: A4;
    margin: 2cm;
    @bottom-center {
        content: "Página " counter(page) " de " counter(pages);
        font-size: 8pt;
        color: #888;
    }
}
```

### 4. Integración en Next.js

El endpoint API en Next.js llamaría al microservicio Python.

```typescript
// src/app/api/reports/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';

// URL del microservicio de generación de PDF
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:5001/generate-pdf';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await authMiddleware(request);
    if (authResult.proceed !== true) return authResult;

    const { payload } = authResult;
    const body = await request.json();

    const { template, data, language } = body;

    if (!template || !data) {
      return NextResponse.json({ error: 'Faltan datos: template o data' }, { status: 400 });
    }

    ServerLogger.info('Solicitando generación de PDF', { template, userId: payload.id });

    // Llamar al microservicio Python
    const pdfResponse = await fetch(PDF_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template, data, language }),
    });

    if (!pdfResponse.ok) {
      const errorBody = await pdfResponse.text();
      ServerLogger.error('Error desde el servicio PDF', { status: pdfResponse.status, errorBody });
      throw new Error(`Error del servicio PDF: ${pdfResponse.statusText}`);
    }

    // Devolver el PDF directamente al cliente
    const pdfBlob = await pdfResponse.blob();
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${template}_report.pdf"`,
      },
    });

  } catch (error) {
    ServerLogger.error('Error en endpoint generate-pdf', error);
    return NextResponse.json({ error: 'Error interno al generar el PDF' }, { status: 500 });
  }
}
```

## Pruebas

1.  **Pruebas Unitarias**: Verificar la lógica de renderizado de plantillas y la llamada al servicio PDF.
2.  **Pruebas de Integración**: Probar el flujo completo desde el frontend hasta la generación y descarga del PDF.
3.  **Pruebas Visuales**: Verificar que los PDFs generados tengan el formato y contenido correctos.
4.  **Pruebas de Carga**: Evaluar el rendimiento del servicio PDF bajo carga.

## Consideraciones Adicionales

-   **Seguridad**: Asegurar que el microservicio Python esté protegido y solo sea accesible desde el backend de Armonía.
-   **Despliegue**: El microservicio Python debe desplegarse junto con la aplicación principal (ej. en un contenedor Docker).
-   **Manejo de Errores**: Implementar un manejo de errores robusto en ambos servicios.
-   **Alternativa sin Microservicio**: Si se prefiere no usar un microservicio Python, se podría explorar `puppeteer` en Node.js para generar PDFs desde HTML, aunque puede ser más intensivo en recursos.

## Conclusión

La implementación de la generación de PDFs utilizando WeasyPrint a través de un microservicio Python proporciona una solución flexible y potente para crear reportes de alta calidad en el proyecto Armonía. Esta aproximación permite aprovechar las capacidades avanzadas de renderizado de HTML/CSS de WeasyPrint y mantener separada la lógica de generación de PDF del backend principal.

---

Documento preparado el 2 de junio de 2025 como parte de la Fase 1 del Plan Integral de Desarrollo del proyecto Armonía.

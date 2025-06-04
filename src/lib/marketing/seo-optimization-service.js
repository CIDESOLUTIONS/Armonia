/**
 * Servicio de optimización SEO para la landing page de Armonía
 * 
 * Este servicio proporciona funcionalidades para optimizar el SEO de la landing page,
 * incluyendo metadatos, schema.org, optimización de imágenes y otras mejoras para
 * motores de búsqueda.
 */

const logger = require('../logging/server-logger');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

/**
 * Clase que implementa la optimización SEO para la landing page
 */
class SeoOptimizationService {
  /**
   * Constructor del servicio de optimización SEO
   */
  constructor() {
    this.metaTags = {
      title: 'Armonía - Gestión integral para comunidades y edificios',
      description: 'Plataforma completa para la gestión de comunidades, asambleas, pagos, comunicaciones y más. Simplifica la administración de tu edificio o conjunto residencial.',
      keywords: 'gestión comunidades, administración edificios, asambleas virtuales, pagos comunitarios, comunicación residentes',
      ogTitle: 'Armonía - Solución integral para comunidades',
      ogDescription: 'Transforma la gestión de tu comunidad con Armonía. Plataforma todo en uno para administración, comunicación y servicios comunitarios.',
      ogImage: '/images/armonia-social-share.jpg',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Armonía - Gestión comunitaria simplificada',
      twitterDescription: 'Administra tu comunidad de forma eficiente con Armonía. Asambleas, pagos, comunicaciones y más en una sola plataforma.',
      twitterImage: '/images/armonia-twitter-card.jpg'
    };
    
    this.schemaData = {
      organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Armonía',
        'url': 'https://armonia.app',
        'logo': 'https://armonia.app/images/logo.png',
        'sameAs': [
          'https://facebook.com/armoniaapp',
          'https://twitter.com/armoniaapp',
          'https://instagram.com/armoniaapp',
          'https://linkedin.com/company/armoniaapp'
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+573001234567',
          'contactType': 'customer service',
          'availableLanguage': ['Spanish', 'English']
        }
      },
      software: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Armonía',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web, iOS, Android',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      }
    };
    
    logger.info('SeoOptimizationService initialized');
  }
  
  /**
   * Genera los metadatos HTML para la landing page
   * @returns {string} Metadatos HTML
   */
  generateMetaTags() {
    return `
      <!-- Primary Meta Tags -->
      <title>${this.metaTags.title}</title>
      <meta name="title" content="${this.metaTags.title}">
      <meta name="description" content="${this.metaTags.description}">
      <meta name="keywords" content="${this.metaTags.keywords}">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://armonia.app/">
      <meta property="og:title" content="${this.metaTags.ogTitle}">
      <meta property="og:description" content="${this.metaTags.ogDescription}">
      <meta property="og:image" content="https://armonia.app${this.metaTags.ogImage}">
      
      <!-- Twitter -->
      <meta property="twitter:card" content="${this.metaTags.twitterCard}">
      <meta property="twitter:url" content="https://armonia.app/">
      <meta property="twitter:title" content="${this.metaTags.twitterTitle}">
      <meta property="twitter:description" content="${this.metaTags.twitterDescription}">
      <meta property="twitter:image" content="https://armonia.app${this.metaTags.twitterImage}">
      
      <!-- Canonical URL -->
      <link rel="canonical" href="https://armonia.app/">
      
      <!-- Favicon -->
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="manifest" href="/site.webmanifest">
      
      <!-- Language Alternates -->
      <link rel="alternate" hreflang="es" href="https://armonia.app/es/">
      <link rel="alternate" hreflang="en" href="https://armonia.app/en/">
      <link rel="alternate" hreflang="x-default" href="https://armonia.app/">
    `;
  }
  
  /**
   * Genera el marcado Schema.org para la landing page
   * @returns {string} Marcado Schema.org en formato JSON-LD
   */
  generateSchemaMarkup() {
    return `
      <script type="application/ld+json">
        ${JSON.stringify(this.schemaData.organization)}
      </script>
      <script type="application/ld+json">
        ${JSON.stringify(this.schemaData.software)}
      </script>
    `;
  }
  
  /**
   * Genera un sitemap XML para el sitio
   * @param {string} outputPath - Ruta donde guardar el sitemap
   * @returns {Promise<boolean>} true si se generó correctamente, false en caso contrario
   */
  async generateSitemap(outputPath) {
    try {
      const baseUrl = 'https://armonia.app';
      const pages = [
        { url: '/', priority: '1.0', changefreq: 'weekly' },
        { url: '/features', priority: '0.8', changefreq: 'monthly' },
        { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
        { url: '/about', priority: '0.7', changefreq: 'monthly' },
        { url: '/contact', priority: '0.7', changefreq: 'monthly' },
        { url: '/blog', priority: '0.6', changefreq: 'weekly' },
        { url: '/terms', priority: '0.4', changefreq: 'yearly' },
        { url: '/privacy', priority: '0.4', changefreq: 'yearly' }
      ];
      
      // Generar contenido del sitemap
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      pages.forEach(page => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += '  </url>\n';
      });
      
      sitemap += '</urlset>';
      
      // Guardar el sitemap
      await fs.writeFile(outputPath, sitemap);
      logger.info(`Sitemap generated at ${outputPath}`);
      
      return true;
    } catch (error) {
      logger.error(`Error generating sitemap: ${error.message}`, { error });
      return false;
    }
  }
  
  /**
   * Optimiza una imagen para web
   * @param {string} inputPath - Ruta de la imagen original
   * @param {string} outputPath - Ruta donde guardar la imagen optimizada
   * @param {Object} options - Opciones de optimización
   * @returns {Promise<boolean>} true si se optimizó correctamente, false en caso contrario
   */
  async optimizeImage(inputPath, outputPath, options = {}) {
    try {
      const defaultOptions = {
        quality: 80,
        width: null,
        height: null,
        format: 'webp'
      };
      
      const finalOptions = { ...defaultOptions, ...options };
      
      // Crear directorio de salida si no existe
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });
      
      // Procesar la imagen
      let sharpInstance = sharp(inputPath);
      
      // Redimensionar si se especifica ancho o alto
      if (finalOptions.width || finalOptions.height) {
        sharpInstance = sharpInstance.resize(finalOptions.width, finalOptions.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Convertir al formato especificado
      switch (finalOptions.format.toLowerCase()) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: finalOptions.quality });
          break;
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality: finalOptions.quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: finalOptions.quality });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality: finalOptions.quality });
          break;
        default:
          sharpInstance = sharpInstance.webp({ quality: finalOptions.quality });
      }
      
      // Guardar la imagen optimizada
      await sharpInstance.toFile(outputPath);
      
      logger.info(`Image optimized: ${inputPath} -> ${outputPath}`);
      return true;
    } catch (error) {
      logger.error(`Error optimizing image: ${error.message}`, { error, inputPath });
      return false;
    }
  }
  
  /**
   * Genera imágenes responsivas para diferentes tamaños de pantalla
   * @param {string} inputPath - Ruta de la imagen original
   * @param {string} outputDir - Directorio donde guardar las imágenes generadas
   * @param {string} baseName - Nombre base para las imágenes generadas
   * @param {Array} sizes - Tamaños de imagen a generar
   * @returns {Promise<Array>} Lista de rutas de las imágenes generadas
   */
  async generateResponsiveImages(inputPath, outputDir, baseName, sizes = []) {
    try {
      const defaultSizes = [
        { width: 320, suffix: 'xs' },
        { width: 640, suffix: 'sm' },
        { width: 1024, suffix: 'md' },
        { width: 1440, suffix: 'lg' },
        { width: 1920, suffix: 'xl' }
      ];
      
      const finalSizes = sizes.length > 0 ? sizes : defaultSizes;
      const generatedImages = [];
      
      // Crear directorio de salida si no existe
      await fs.mkdir(outputDir, { recursive: true });
      
      // Generar imágenes para cada tamaño
      for (const size of finalSizes) {
        const outputPath = path.join(outputDir, `${baseName}-${size.suffix}.webp`);
        
        await this.optimizeImage(inputPath, outputPath, {
          width: size.width,
          height: size.height,
          format: 'webp'
        });
        
        generatedImages.push({
          path: outputPath,
          width: size.width,
          height: size.height,
          suffix: size.suffix
        });
      }
      
      logger.info(`Generated ${generatedImages.length} responsive images for ${inputPath}`);
      return generatedImages;
    } catch (error) {
      logger.error(`Error generating responsive images: ${error.message}`, { error, inputPath });
      return [];
    }
  }
  
  /**
   * Genera el código HTML para imágenes responsivas con srcset
   * @param {Array} images - Lista de imágenes generadas
   * @param {string} alt - Texto alternativo para la imagen
   * @param {Object} options - Opciones adicionales
   * @returns {string} Código HTML para la imagen responsiva
   */
  generateResponsiveImageHtml(images, alt, options = {}) {
    if (!images || images.length === 0) {
      return '';
    }
    
    const defaultOptions = {
      className: '',
      loading: 'lazy',
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // Ordenar imágenes por ancho
    const sortedImages = [...images].sort((a, b) => a.width - b.width);
    
    // Imagen más grande para src por defecto
    const defaultImage = sortedImages[sortedImages.length - 1];
    
    // Generar srcset
    const srcset = sortedImages
      .map(img => `${img.path.replace(/^.*[\\\/]/, '/')} ${img.width}w`)
      .join(', ');
    
    return `
      <img 
        src="${defaultImage.path.replace(/^.*[\\\/]/, '/')}" 
        srcset="${srcset}" 
        sizes="${finalOptions.sizes}" 
        alt="${alt}" 
        loading="${finalOptions.loading}" 
        ${finalOptions.className ? `class="${finalOptions.className}"` : ''}
      >
    `;
  }
  
  /**
   * Analiza y optimiza la velocidad de carga de la landing page
   * @param {string} htmlPath - Ruta del archivo HTML de la landing page
   * @returns {Promise<Object>} Resultados del análisis y optimización
   */
  async optimizeLandingPageSpeed(htmlPath) {
    try {
      // Leer el HTML actual
      const html = await fs.readFile(htmlPath, 'utf-8');
      
      // Aplicar optimizaciones
      let optimizedHtml = html;
      
      // 1. Añadir metadatos SEO
      const metaTags = this.generateMetaTags();
      optimizedHtml = optimizedHtml.replace('</head>', `${metaTags}\n</head>`);
      
      // 2. Añadir Schema.org
      const schemaMarkup = this.generateSchemaMarkup();
      optimizedHtml = optimizedHtml.replace('</head>', `${schemaMarkup}\n</head>`);
      
      // 3. Añadir preload para recursos críticos
      const preloadTags = `
        <link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="/css/critical.css" as="style">
        <link rel="preload" href="/js/main.js" as="script">
      `;
      optimizedHtml = optimizedHtml.replace('</head>', `${preloadTags}\n</head>`);
      
      // 4. Añadir atributos de carga diferida para imágenes no críticas
      optimizedHtml = optimizedHtml.replace(/<img(?!\s+loading=)/g, '<img loading="lazy"');
      
      // 5. Añadir atributos de carga diferida para iframes
      optimizedHtml = optimizedHtml.replace(/<iframe(?!\s+loading=)/g, '<iframe loading="lazy"');
      
      // Guardar el HTML optimizado
      await fs.writeFile(htmlPath, optimizedHtml);
      
      logger.info(`Landing page optimized: ${htmlPath}`);
      
      return {
        success: true,
        optimizations: [
          'Added SEO meta tags',
          'Added Schema.org markup',
          'Added preload directives for critical resources',
          'Added lazy loading for non-critical images',
          'Added lazy loading for iframes'
        ]
      };
    } catch (error) {
      logger.error(`Error optimizing landing page: ${error.message}`, { error, htmlPath });
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Actualiza los metadatos SEO
   * @param {Object} metaTags - Nuevos metadatos
   */
  updateMetaTags(metaTags) {
    this.metaTags = { ...this.metaTags, ...metaTags };
    logger.info('SEO meta tags updated');
  }
  
  /**
   * Actualiza el marcado Schema.org
   * @param {Object} schemaData - Nuevo marcado Schema.org
   */
  updateSchemaData(schemaData) {
    this.schemaData = { ...this.schemaData, ...schemaData };
    logger.info('Schema.org data updated');
  }
  
  /**
   * Obtiene los metadatos SEO actuales
   * @returns {Object} Metadatos SEO
   */
  getMetaTags() {
    return this.metaTags;
  }
  
  /**
   * Obtiene el marcado Schema.org actual
   * @returns {Object} Marcado Schema.org
   */
  getSchemaData() {
    return this.schemaData;
  }
}

// Exportar instancia del servicio
module.exports = new SeoOptimizationService();

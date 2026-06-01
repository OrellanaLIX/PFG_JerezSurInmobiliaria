// Hook personalizado para gestionar los metadatos SEO de cada página.
//
// En React no podemos editar directamente el <head> del HTML como en PHP,
// así que usamos useEffect para manipular el DOM del documento manualmente.
// La alternativa profesional sería usar react-helmet-async, pero para evitar
// añadir más dependencias lo hice a mano con la API del navegador.
//
// Se usa en páginas como Home, Inmuebles e InmuebleDetalle para:
//   - Cambiar el <title> de la pestaña
//   - Actualizar el meta description (para Google)
//   - Actualizar el canonical (URL preferida para evitar duplicados en SEO)
//   - Añadir Open Graph (para previsualización en WhatsApp, Twitter, etc.)

import { useEffect } from 'react';

interface SEOOptions {
  title:        string;
  description?: string;
  canonical?:   string;
}

const BASE_TITLE = 'JerezSur Inmobiliaria';

export const useSEO = ({ title, description, canonical }: SEOOptions) => {
  useEffect(() => {
    // Actualizamos el <title> de la página (lo que aparece en la pestaña del navegador)
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    // Meta description: el texto que aparece debajo del título en Google
    // Si ya existe el meta lo reutilizamos, si no lo creamos de cero
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.content = description;

    // URL canónica: le dice a Google cuál es la URL "oficial" de esta página
    // Evita problemas de contenido duplicado si la misma página se puede acceder por varias URLs
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical || window.location.href;

    // Open Graph: metadatos que usan WhatsApp, Telegram, Twitter y Facebook
    // para generar la previsualización cuando alguien comparte un enlace
    const setOG = (property: string, content: string) => {
      let og = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', property);
        document.head.appendChild(og);
      }
      og.content = content;
    };

    setOG('og:title',     title ? `${title} | ${BASE_TITLE}` : BASE_TITLE);
    setOG('og:type',      'website');
    setOG('og:url',       canonical || window.location.href);
    setOG('og:site_name', BASE_TITLE);
    if (description) setOG('og:description', description);

  // El array de dependencias hace que se re-ejecute solo cuando cambian los metadatos
  }, [title, description, canonical]);
};

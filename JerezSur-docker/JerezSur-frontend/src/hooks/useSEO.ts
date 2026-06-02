// Hook personalizado para gestionar los metadatos SEO de cada página.
//
// Actualiza dinámicamente: <title>, meta description, canonical,
// Open Graph (Facebook/WhatsApp) y Twitter Card.

import { useEffect } from 'react';

interface SEOOptions {
  title:        string;
  description?: string;
  canonical?:   string;
  image?:       string;  // URL de imagen para OG/Twitter (ej: foto de portada del inmueble)
  type?:        'website' | 'article'; // tipo OG (website por defecto)
}

const BASE_TITLE    = 'JerezSur Inmobiliaria';
const DEFAULT_IMAGE = '/LogoCuadrado.png';

export const useSEO = ({ title, description, canonical, image, type = 'website' }: SEOOptions) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    const url       = canonical || window.location.href;
    const imgUrl    = image || DEFAULT_IMAGE;

    // Título de la pestaña
    document.title = fullTitle;

    // Helper para meta con name
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Helper para meta con property (Open Graph)
    const setOG = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // URL canónica
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;

    // Meta description
    if (description) setMeta('description', description);

    // Open Graph
    setOG('og:title',       fullTitle);
    setOG('og:type',        type);
    setOG('og:url',         url);
    setOG('og:site_name',   BASE_TITLE);
    setOG('og:image',       imgUrl);
    setOG('og:image:alt',   title || BASE_TITLE);
    setOG('og:locale',      'es_ES');
    if (description) setOG('og:description', description);

    // Twitter Card
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       fullTitle);
    setMeta('twitter:image',       imgUrl);
    setMeta('twitter:image:alt',   title || BASE_TITLE);
    if (description) setMeta('twitter:description', description);

  }, [title, description, canonical, image, type]);
};

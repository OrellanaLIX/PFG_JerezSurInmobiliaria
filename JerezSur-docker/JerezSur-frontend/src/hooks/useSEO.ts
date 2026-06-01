import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
  canonical?: string;
}

const BASE_TITLE = 'JerezSur Inmobiliaria';

export const useSEO = ({ title, description, canonical }: SEOOptions) => {
  useEffect(() => {
    // Título
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    // Meta description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.content = description;

    // Canonical
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical || window.location.href;

    // Open Graph básico
    const setOG = (property: string, content: string) => {
      let og = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', property);
        document.head.appendChild(og);
      }
      og.content = content;
    };

    setOG('og:title', title ? `${title} | ${BASE_TITLE}` : BASE_TITLE);
    if (description) setOG('og:description', description);
    setOG('og:type', 'website');
    setOG('og:url', canonical || window.location.href);
    setOG('og:site_name', BASE_TITLE);
  }, [title, description, canonical]);
};

'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'

export const FB_PIXEL_ID = '653557265355207'

/**
 * Utilitário para disparar eventos do Facebook Pixel
 */
export const fbEvent = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    console.log(`[FB Pixel] Event: ${name}`, options);
    window.fbq('track', name, options)
  } else {
    console.warn(`[FB Pixel] FAILED: ${name} (fbq not found)`);
  }
}

/**
 * Utilitário para inicializar o Pixel com dados do usuário (Advanced Matching)
 */
export const fbInit = (userData = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    console.log(`[FB Pixel] Init with Advanced Matching:`, userData);
    window.fbq('init', FB_PIXEL_ID, userData)
  }
}

export default function FacebookPixel() {
  const pathname = usePathname()

  useEffect(() => {
    // Não dispara PageView se estiver em rotas de admin
    if (pathname?.startsWith('/admin')) return;
    
    console.log(`[FB Pixel] Tracking PageView: ${pathname}`);
    fbEvent('PageView')
  }, [pathname])

  // Retorna nulo para rotas de admin mas APÓS os hooks para seguir as regras do React
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

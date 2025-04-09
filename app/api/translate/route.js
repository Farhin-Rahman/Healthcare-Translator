import { NextResponse } from 'next/server';

const medicalDictionary = new Map([
  // ... (keep your existing dictionary)
]);

// Alternative translation services
const TRANSLATION_SERVICES = [
  {
    name: 'LibreTranslate',
    url: 'https://libretranslate.de/translate',
    fallback: true
  },
  {
    name: 'MyMemory',
    url: 'https://api.mymemory.translated.net/get',
    params: (text, target) => `q=${encodeURIComponent(text)}&langpair=en|${target}`
  }
];

export async function POST(req) {
  const { text, targetLanguage } = await req.json();

  if (!text || !targetLanguage) {
    return NextResponse.json(
      { error: "Missing text or targetLanguage" },
      { status: 400 }
    );
  }

  try {
    // 1. Process medical terms first
    let processedText = text.toLowerCase();
    medicalDictionary.forEach((translation, term) => {
      processedText = processedText.replace(new RegExp(term, 'gi'), translation);
    });

    // 2. Try multiple translation services
    let translation;
    
    for (const service of TRANSLATION_SERVICES) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    
        const response = await fetch(
          service.params 
            ? `${service.url}?${service.params(processedText, targetLanguage)}`
            : service.url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: service.params ? undefined : JSON.stringify({
              q: processedText,
              source: 'en',
              target: targetLanguage,
              format: 'text'
            }),
            signal: controller.signal // Attach the AbortController signal
          }
        );
    
        clearTimeout(timeout); // Clear timeout if fetch succeeds
    
        if (response.ok) {
          const data = await response.json();
          translation = service.name === 'MyMemory' 
            ? data.responseData?.translatedText 
            : data.translatedText;
          break;
        }
      } catch (e) {
        console.warn(`${service.name} failed:`, e.message);
      }
    }
    
    if (!translation) {
      translation = processedText.split(' ').map(word => 
        medicalDictionary.get(word) || word
      ).join(' ');
    }

    return NextResponse.json({ translatedText: translation });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { 
        error: "Translation service unavailable",
        fallback: text.split(' ').map(word => 
          medicalDictionary.get(word.toLowerCase()) || word
        ).join(' ')
      },
      { status: 200 } // Still return 200 with fallback
    );
  }
}
export const runtime = 'edge';
import { NextResponse } from 'next/server';

const medicalDictionary = new Map([
  // ... (keep your existing dictionary)
]);

// Model mapping for Hugging Face
const HUGGINGFACE_MODELS = {
  es: "Helsinki-NLP/opus-mt-en-es",
  fr: "Helsinki-NLP/opus-mt-en-fr",
  de: "Helsinki-NLP/opus-mt-en-de",
  // For other languages, use NLLB:
  '*': "facebook/nllb-200-distilled-600M"
};

// Alternative translation services (fallbacks)
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

// 1. Add this new function above your POST handler
async function translateWithHuggingFace(text, targetLang) {
  const model = HUGGINGFACE_MODELS[targetLang] || HUGGINGFACE_MODELS['*'];
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    if (!response.ok) throw new Error("Hugging Face API error");
    const data = await response.json();
    return data[0].translation_text;
  } catch (error) {
    console.error("Hugging Face Error:", error);
    return null;
  }
}

// 2. Keep your existing fallback logic
async function yourExistingFallback(text, targetLanguage) {
  let processedText = text.toLowerCase();
  medicalDictionary.forEach((translation, term) => {
    processedText = processedText.replace(new RegExp(term, 'gi'), translation);
  });

  for (const service of TRANSLATION_SERVICES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
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
          signal: controller.signal
        }
      );
      
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        return service.name === 'MyMemory' 
          ? data.responseData?.translatedText 
          : data.translatedText;
      }
    } catch (e) {
      console.warn(`${service.name} failed:`, e.message);
    }
  }
  
  return processedText.split(' ').map(word => 
    medicalDictionary.get(word) || word
  ).join(' ');
}

// 3. Modified POST handler (now tries Hugging Face first)
export async function POST(req) {
  const { text, targetLanguage } = await req.json();

  if (!text || !targetLanguage) {
    return NextResponse.json(
      { error: "Missing text or targetLanguage" },
      { status: 400 }
    );
  }

  try {
    // Try Hugging Face first
    const translatedText = await translateWithHuggingFace(text, targetLanguage) 
                      || await yourExistingFallback(text, targetLanguage);

    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { 
        error: "Translation service unavailable",
        fallback: text.split(' ').map(word => 
          medicalDictionary.get(word.toLowerCase()) || word
        ).join(' ')
      },
      { status: 200 }
    );
  }
}

export const runtime = 'edge';
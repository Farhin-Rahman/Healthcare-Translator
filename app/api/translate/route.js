// Free medical translation using pre-generated dictionary + LibreTranslate
const medicalDictionary = {
    // English to Spanish medical terms (AI-generated)
    "headache": "cefalea",
    "fever": "fiebre",
    "chest pain": "dolor de pecho",
    "blood pressure": "presión arterial",
    "allergy": "alergia",
    "antibiotics": "antibióticos",
    "appointment": "cita médica",
    "dizziness": "mareo",
    "nausea": "náuseas",
    "prescription": "receta médica",
    // Add 30+ more terms as needed
  };
  
  export async function POST(req) {
    const { text, targetLanguage } = await req.json();
    
    // Step 1: Replace medical terms using AI dictionary
    const processedText = Object.keys(medicalDictionary).reduce((acc, term) => 
      acc.replace(new RegExp(term, "gi"), medicalDictionary[term]), 
      text
    );
  
    // Step 2: Fallback to LibreTranslate
    try {
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: processedText,
          source: "en",
          target: targetLanguage,
          api_key: "" // No key needed for free tier
        })
      });
      const data = await res.json();
      return Response.json({ translatedText: data.translatedText });
    } catch (error) {
      return Response.json(
        { error: "Translation failed. Please try again." },
        { status: 500 }
      );
    }
  }
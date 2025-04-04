'use client'
import { useState, useEffect } from 'react';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';

export default function HealthcareTranslator() {
  // State declarations
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');

  // ▼▼▼ Single, optimized translation handler ▼▼▼
  const handleTranslate = async () => {
    if (!transcript.trim()) return;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: transcript, 
          targetLanguage 
        })
      });
      
      if (!response.ok) throw new Error('Translation failed');
      
      const data = await response.json();
      setTranslation(data.translatedText || "No translation available");
    } catch (error) {
      console.error("Translation error:", error);
      setTranslation("Translation service error");
    }
  };

  // Auto-translation effect
  useEffect(() => {
    handleTranslate();
  }, [transcript, targetLanguage]);

  // Speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser does not support speech recognition. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .slice(-1)[0][0].transcript;
      setTranscript(text);
    };

    if (isListening) {
      recognition.start();
    }

    return () => recognition.stop();
  }, [isListening]);

  // Text-to-speech
  const speakTranslation = () => {
    if (!translation) return;
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = targetLanguage === 'es' ? 'es-ES' : 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Healthcare Translator</h1>
      
      <select
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>

      <button
        onClick={() => setIsListening(!isListening)}
        className={`p-3 rounded-full mb-4 ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white`}
      >
        {isListening ? <FaStop /> : <FaMicrophone />}
      </button>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold">Patient:</h2>
          <p>{transcript || "Speak now..."}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold">Translation:</h2>
          <p>{translation || "Translation will appear here"}</p>
          {translation && (
            <button
              onClick={speakTranslation}
              className="mt-2 p-2 bg-green-500 text-white rounded flex items-center gap-2"
            >
              <FaVolumeUp /> Speak
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
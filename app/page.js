'use client';
import dynamic from 'next/dynamic';
const HealthcareTranslator = dynamic(() => import('./components/HealthcareTranslator'), { ssr: false });

export default function Home() {
  return (
    <div>
      
      <HealthcareTranslator />
    </div>
  );
}

import { useState } from 'react';
import type { Screen, CarFormData, AnalysisResult } from '@/types';
import { generateMockResult, emptyForm } from '@/mockData';
import HomeScreen from '@/screens/HomeScreen';
import InputScreen from '@/screens/InputScreen';
import ResultScreen from '@/screens/ResultScreen';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [formData, setFormData] = useState<CarFormData>(emptyForm);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleStart = () => {
    setScreen('input');
  };

  const handleDemo = () => {
    const demo: CarFormData = {
      ...emptyForm,
      marca: 'Mercedes-Benz', modelo: 'GLC 220d 4MATIC', version: 'AMG Line',
      anio: '2016', kilometros: '370000', precio: '16900', precioReferencia: '14500',
      combustible: 'Diésel', cambio: 'Automático', potencia: '170', traccion: 'Total (4x4)', metodo: 'manual',
    };
    setFormData(demo);
    setResult(generateMockResult(demo));
    setScreen('result');
    window.scrollTo({ top: 0 });
  };

  const handleBack = () => {
    setScreen(screen === 'result' ? 'input' : 'home');
  };

  const handleAnalyze = (data: CarFormData) => {
    setFormData(data);
    setResult(generateMockResult(data));
    setScreen('result');
    window.scrollTo({ top: 0 });
  };

  const handleNewAnalysis = () => {
    setFormData(emptyForm);
    setResult(null);
    setScreen('home');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-ink-950">
      {screen === 'home' && <HomeScreen onStart={handleStart} onDemo={handleDemo} />}
      {screen === 'input' && <InputScreen onBack={handleBack} onAnalyze={handleAnalyze} />}
      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          formData={formData}
          onBack={handleBack}
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </div>
  );
}

export default App;

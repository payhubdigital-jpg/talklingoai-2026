
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  stream: MediaStream | null;
  mode?: 'user' | 'ai';
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, stream, mode = 'user' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isActive || !stream || !canvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({});
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    // Aumentamos o fftSize para capturar mais detalhes de frequências baixas
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    
    source.connect(analyser);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let phase = 0;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Calcular volume médio
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // --- CURVA DE SENSIBILIDADE ---
      // Usamos Math.sqrt para dar um "boost" em volumes baixos na visualização
      // Isso faz com que a onda se mova mesmo com pouco som.
      const volumeScale = Math.sqrt(average / 128);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const colorPrimary = mode === 'user' ? '#3b82f6' : '#f97316';

      // Desenhar 3 camadas de ondas
      for (let n = 0; n < 3; n++) {
        ctx.beginPath();
        ctx.lineWidth = n === 0 ? 3 : 1.5;
        ctx.strokeStyle = n === 0 ? colorPrimary : `${colorPrimary}44`;
        
        const frequency = 0.015 + (n * 0.008);
        const amplitude = (35 * volumeScale) + (n * 3);
        
        for (let x = 0; x < width; x += 2) {
          const y = centerY + Math.sin(x * frequency + phase + (n * 1.5)) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Velocidade de animação proporcional ao volume captado
      phase += 0.12 * volumeScale + 0.01;
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [isActive, stream, mode]);

  return (
    <div className="relative w-full flex items-center justify-center py-2">
      {isActive && (
        <div className={`absolute inset-0 blur-2xl opacity-10 ${mode === 'user' ? 'bg-blue-500' : 'bg-orange-500'}`} />
      )}
      <canvas 
        ref={canvasRef} 
        className="w-full h-16 relative z-10" 
        width={800} 
        height={100}
      />
    </div>
  );
};

export default AudioVisualizer;

"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function VideoShowcase({ theme, language }: { theme: string, language?: string }) {
  // Si no se pasa el idioma, asumimos español
  const currentLanguage = language || "Español";
  
  // Textos traducciones
  const texts = {
    es: {
      title: "Vea Armonía en acción",
      description: "Descubra cómo nuestra plataforma simplifica la gestión de conjuntos residenciales.",
      videoNote: "El video muestra todas las funcionalidades disponibles en los planes Estándar y Premium."
    },
    en: {
      title: "See Armonía in action",
      description: "Discover how our platform simplifies the management of residential complexes.",
      videoNote: "The video shows all features available in Standard and Premium plans."
    }
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Autoplay en view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <section className="py-16 bg-indigo-50" data-testid="video-showcase">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>
            {currentLanguage === "Español" ? texts.es.title : texts.en.title}
          </h2>
          <p className={`text-lg ${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
            {currentLanguage === "Español" ? texts.es.description : texts.en.description}
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative rounded-xl overflow-hidden shadow-2xl">
          {/* Overlay de controles */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity z-10">
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <button
                onClick={togglePlay}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 text-white focus:outline-none transition"
                aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                data-testid="video-play-button"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 text-white focus:outline-none transition"
                aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                data-testid="video-mute-button"
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Video */}
          <video
            ref={videoRef}
            className="w-full h-auto"
            poster="/images/landing-hero3.png"
            muted
            loop
            playsInline
            data-testid="showcase-video"
          >
            <source src="/videos/landing-video.mp4" type="video/mp4" />
            <p>Su navegador no soporta videos HTML5. Aquí hay un <a href="/videos/armonia-demo.mp4">enlace al video</a>.</p>
          </video>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-sm ${theme === "Oscuro" ? "text-gray-400" : "text-gray-500"}`}>
            {currentLanguage === "Español" ? texts.es.videoNote : texts.en.videoNote}
          </p>
        </div>
      </div>
    </section>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useInView } from 'motion/react';

const ScrollSequence = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const isInView = useInView(containerRef, { once: true, margin: "200px" });

    // Carga de imágenes diferida (Lazy Loading)
    useEffect(() => {
        if (!isInView) return;

        const totalFrames = 331;
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 0; i < totalFrames; i++) {
            const img = new Image();
            img.src = `/b2b/public/fotogramas/Oh%20sagrado%20coraz%C3%B3n%20de%20Jesus_${i}.jpg`;
            img.onload = () => {
                loadedCount++;
                setProgress(Math.round((loadedCount / totalFrames) * 100));
                if (loadedCount === totalFrames) {
                    setIsLoaded(true);
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalFrames) setIsLoaded(true);
            };
            loadedImages[i] = img;
        }

        setImages(loadedImages);
    }, [isInView]);

    // Seguimiento del scroll relativo al viewport
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Mapeo del progreso del scroll al índice del fotograma
    const frameIndex = useTransform(scrollYProgress, [0.1, 0.6], [0, 330]);

    useEffect(() => {
        const render = () => {
            if (!canvasRef.current || images.length === 0) return;
            const ctx = canvasRef.current.getContext('2d', { alpha: false });
            if (!ctx) return;

            const idx = Math.floor(frameIndex.get());
            const clampedIdx = Math.max(0, Math.min(idx, images.length - 1));
            const img = images[clampedIdx];

            if (img && img.complete) {
                const canvas = canvasRef.current;
                
                // Ajustar resolución del canvas al tamaño visual (con soporte DPI)
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                    canvas.width = rect.width * dpr;
                    canvas.height = rect.height * dpr;
                }

                // Lógica Object-fit: cover en Canvas
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio = Math.max(hRatio, vRatio);
                const shiftX = (canvas.width - img.width * ratio) / 2;
                const shiftY = (canvas.height - img.height * ratio) / 2;

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
            }
        };

        const unsubscribe = frameIndex.on("change", render);
        
        // Primera renderización una vez cargadas las imágenes
        if (isLoaded) {
            // Un pequeño delay para asegurar que el canvas tenga su tamaño rect correcto
            setTimeout(render, 50);
        }

        window.addEventListener('resize', render);
        return () => {
            unsubscribe();
            window.removeEventListener('resize', render);
        };
    }, [images, frameIndex, isLoaded]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-gray-50">
            {!isLoaded && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white">
                    <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4" />
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">
                        PREPARANDO EXPERIENCIA {progress}%
                    </span>
                </div>
            )}
            <canvas 
                ref={canvasRef}
                className="w-full h-full pointer-events-none transition-opacity duration-700"
                style={{ opacity: isLoaded ? 1 : 0 }}
            />
        </div>
    );
};

export default ScrollSequence;

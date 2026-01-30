import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ProjectImageCarouselProps {
    images: string[];
    title: string;
}

export const ProjectImageCarousel: React.FC<ProjectImageCarouselProps> = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
            </div>
        );
    }

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative w-full h-full group/carousel">
            <img
                src={images[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 z-10"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 z-10"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

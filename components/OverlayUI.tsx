import React from 'react';
import { WISHES } from '../constants';

interface OverlayUIProps {
  isExploded: boolean;
  selectedWishIndex: number;
  textOpacity: number;
  onToggleExplosion: () => void;
  onWishChange: (direction: 'next' | 'prev') => void;
}

export const OverlayUI: React.FC<OverlayUIProps> = ({
  isExploded,
  selectedWishIndex,
  textOpacity,
  onToggleExplosion,
  onWishChange,
}) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden">
      {/* Dynamic Wish Text */}
      <div className="absolute top-[18%] md:top-[20%] left-0 w-full px-4 flex justify-center">
        <div 
          className={`
            max-w-[90%] md:max-w-4xl text-center transition-all duration-700 ease-in-out
            ${isExploded ? 'scale-110' : 'scale-100'}
          `}
          style={{ opacity: isExploded ? textOpacity : textOpacity * 0.7 }}
        >
          <p className="font-serif italic text-2xl md:text-5xl text-pink-100 drop-shadow-[0_0_15px_rgba(255,105,180,0.8)] leading-relaxed">
            “ {WISHES[selectedWishIndex].text} ”
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-start">
        <header className="text-center md:text-left pointer-events-auto">
          <h1 className="text-3xl md:text-6xl font-bold text-white tracking-tighter drop-shadow-lg">
            <span className="text-red-500">MERRY</span> <span className="text-green-500">CHRISTMAS</span>
          </h1>
          <p className="text-gray-400 mt-2 text-[10px] md:text-sm tracking-widest uppercase opacity-80">
            Interactive 3D Experience
          </p>
        </header>
        <div className="hidden md:block text-right">
           <p className="text-xs text-gray-500">Drag to Rotate • Scroll to Zoom</p>
        </div>
      </div>

      {/* Sidebar / Wish Cycler */}
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="pointer-events-auto group relative flex items-center justify-center">
          {/* Collapsed/Expanded Background */}
          <div className="
            bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-[0_0_20px_rgba(255,105,180,0.3)]
            transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
            w-12 h-12 md:w-14 md:h-14 rounded-full
            group-hover:w-64 md:group-hover:w-80 group-hover:h-16 md:group-hover:h-20 group-hover:rounded-[2rem]
            group-hover:bg-black/60 group-hover:border-pink-500/30
          "></div>

          {/* Icon (Heart) - Visible when collapsed */}
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-50">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-pink-400 animate-pulse">
               <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
             </svg>
          </div>

          {/* Expanded Controls - Visible on Hover/Tap */}
          <div className="absolute inset-0 flex items-center justify-between px-4 md:px-6 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 delay-75">
             <button 
                onClick={(e) => { e.stopPropagation(); onWishChange('prev'); }}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors active:scale-95"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
             </button>

             <div className="flex flex-col items-center justify-center w-full px-1 overflow-hidden">
                <span className="text-[8px] md:text-[10px] text-pink-400 uppercase tracking-[0.2em] font-bold mb-0.5">
                   WISH {selectedWishIndex + 1}
                </span>
                <span className="text-xs md:text-base text-white font-serif italic truncate w-32 md:w-full text-center">
                   {WISHES[selectedWishIndex].title}
                </span>
             </div>

             <button 
                onClick={(e) => { e.stopPropagation(); onWishChange('next'); }}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors active:scale-95"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
             </button>
          </div>
        </div>
      </div>

      {/* Main Action Button */}
      <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center pointer-events-auto">
        <button
          onClick={onToggleExplosion}
          className={`
            relative group px-8 py-4 md:px-10 md:py-5 bg-white/10 backdrop-blur-xl border border-white/20 
            rounded-full text-white font-bold tracking-[0.2em] uppercase transition-all duration-300
            hover:bg-white/20 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)]
            overflow-hidden text-sm md:text-base
          `}
        >
          <span className="relative z-10">
            {isExploded ? "Gather Magic" : "Make a Wish"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-pink-600/50 to-purple-600/50 opacity-0 ${isExploded ? 'opacity-100' : 'group-hover:opacity-100'} transition-opacity duration-500 blur-md`}></div>
        </button>
      </div>
    </div>
  );
};
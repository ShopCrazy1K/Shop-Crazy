"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      {/* Try to load the logo image, fallback to text if not found */}
      <div className="relative w-full max-w-3xl">
        <Image
          src="/images/shop-crazy-market-logo.png"
          alt="Shop Crazy Market"
          width={800}
          height={400}
          className="w-full h-auto object-contain"
          priority
          onError={(e) => {
            // Fallback to text logo if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.logo-fallback');
            if (fallback) {
              (fallback as HTMLElement).style.display = 'block';
            }
          }}
        />
        
        {/* Fallback text logo (hidden by default, shown if image fails to load) */}
        <div className="logo-fallback hidden relative" style={{ background: 'black', minHeight: '300px', borderRadius: '12px' }}>
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12">
            {/* "SHOP" - Yellow text at top */}
            <div className="relative mb-2 md:mb-4">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase"
                style={{
                  color: '#FFEB3B',
                  textShadow: `
                    -2px -2px 0 white,
                    2px -2px 0 white,
                    -2px 2px 0 white,
                    2px 2px 0 white,
                    3px 3px 0 rgba(255, 152, 0, 0.8),
                    0 0 10px rgba(255, 235, 59, 0.5)
                  `,
                  transform: 'perspective(500px) rotateX(-5deg)',
                  letterSpacing: '0.05em',
                }}
              >
                SHOP
              </h1>
              {/* Lime green dripping shape */}
              <div 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-8 md:w-48 md:h-12"
                style={{
                  background: 'linear-gradient(to bottom, #CDDC39, #8BC34A)',
                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 90% 100%, 85% 80%, 70% 90%, 50% 70%, 30% 90%, 15% 80%, 10% 100%, 0% 100%)',
                  zIndex: 1,
                }}
              ></div>
            </div>

            {/* "CRAZY" - Large colorful letters */}
            <div className="relative flex items-center justify-center gap-1 md:gap-2 mb-4 md:mb-6" style={{ zIndex: 2 }}>
              {/* C - Hot Pink/Magenta */}
              <span 
                className="text-6xl md:text-8xl lg:text-9xl font-black uppercase"
                style={{
                  color: '#E91E63',
                  textShadow: `
                    -3px -3px 0 white,
                    3px -3px 0 white,
                    -3px 3px 0 white,
                    3px 3px 0 white,
                    4px 4px 0 rgba(156, 39, 176, 0.8),
                    0 0 15px rgba(233, 30, 99, 0.6)
                  `,
                  transform: 'rotate(-2deg)',
                }}
              >
                C
              </span>
              
              {/* R - Bright Yellow */}
              <span 
                className="text-6xl md:text-8xl lg:text-9xl font-black uppercase"
                style={{
                  color: '#FFEB3B',
                  textShadow: `
                    -3px -3px 0 white,
                    3px -3px 0 white,
                    -3px 3px 0 white,
                    3px 3px 0 white,
                    4px 4px 0 rgba(255, 152, 0, 0.8),
                    0 0 15px rgba(255, 235, 59, 0.6)
                  `,
                  transform: 'rotate(1deg)',
                }}
              >
                R
              </span>
              
              {/* A - Vivid Green */}
              <span 
                className="text-6xl md:text-8xl lg:text-9xl font-black uppercase"
                style={{
                  color: '#4CAF50',
                  textShadow: `
                    -3px -3px 0 white,
                    3px -3px 0 white,
                    -3px 3px 0 white,
                    3px 3px 0 white,
                    4px 4px 0 rgba(76, 175, 80, 0.8),
                    0 0 15px rgba(76, 175, 80, 0.6)
                  `,
                  transform: 'rotate(-1deg)',
                }}
              >
                A
              </span>
              
              {/* Z - Bright Orange */}
              <span 
                className="text-6xl md:text-8xl lg:text-9xl font-black uppercase"
                style={{
                  color: '#FF9800',
                  textShadow: `
                    -3px -3px 0 white,
                    3px -3px 0 white,
                    -3px 3px 0 white,
                    3px 3px 0 white,
                    4px 4px 0 rgba(255, 152, 0, 0.8),
                    0 0 15px rgba(255, 152, 0, 0.6)
                  `,
                  transform: 'rotate(2deg)',
                }}
              >
                Z
              </span>
              
              {/* Y - Light Blue */}
              <span 
                className="text-6xl md:text-8xl lg:text-9xl font-black uppercase"
                style={{
                  color: '#03A9F4',
                  textShadow: `
                    -3px -3px 0 white,
                    3px -3px 0 white,
                    -3px 3px 0 white,
                    3px 3px 0 white,
                    4px 4px 0 rgba(3, 169, 244, 0.8),
                    0 0 15px rgba(3, 169, 244, 0.6)
                  `,
                  transform: 'rotate(-1deg)',
                }}
              >
                Y
              </span>
            </div>

            {/* Decorative Elements Around CRAZY */}
            {/* Dark purple spiky shape behind C */}
            <div 
              className="absolute left-8 md:left-16 top-24 md:top-32 w-12 h-16 md:w-16 md:h-24"
              style={{
                background: '#7B1FA2',
                clipPath: 'polygon(50% 0%, 0% 100%, 30% 80%, 50% 100%, 70% 80%, 100% 100%)',
                zIndex: 0,
              }}
            ></div>

            {/* Light blue splash behind Y */}
            <div 
              className="absolute right-8 md:right-16 top-28 md:top-36 w-16 h-12 md:w-20 md:h-16"
              style={{
                background: '#81D4FA',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
                zIndex: 0,
              }}
            ></div>

            {/* Orange splash on right */}
            <div 
              className="absolute right-4 md:right-8 top-16 md:top-20 w-12 h-12 md:w-16 md:h-16"
              style={{
                background: '#FF9800',
                borderRadius: '50% 30% 50% 30%',
                zIndex: 0,
              }}
            ></div>

            {/* Checkered flag below C */}
            <div 
              className="absolute left-12 md:left-20 top-40 md:top-52 w-8 h-6 md:w-12 md:h-8"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, black 25%, white 25%, white 50%, black 50%, black 75%, white 75%),
                  linear-gradient(45deg, black 25%, white 25%, white 50%, black 50%, black 75%, white 75%)
                `,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px',
                zIndex: 1,
              }}
            ></div>

            {/* "MARKET" - Purple ribbon banner */}
            <div className="relative mt-2 md:mt-4" style={{ zIndex: 3 }}>
              <div 
                className="relative px-6 md:px-12 py-2 md:py-3"
                style={{
                  background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 50%, #7B1FA2 100%)',
                  transform: 'perspective(200px) rotateX(5deg)',
                  borderRadius: '8px',
                  boxShadow: `
                    0 4px 8px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.2),
                    inset 0 -1px 0 rgba(0,0,0,0.2)
                  `,
                }}
              >
                {/* Ribbon fold effect */}
                <div 
                  className="absolute left-0 top-0 w-4 h-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(123, 31, 162, 0.8), transparent)',
                    clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)',
                  }}
                ></div>
                <div 
                  className="absolute right-0 top-0 w-4 h-full"
                  style={{
                    background: 'linear-gradient(-90deg, rgba(123, 31, 162, 0.8), transparent)',
                    clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
                  }}
                ></div>
                
                <h2 
                  className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase relative z-10"
                  style={{
                    color: '#FFF8E1',
                    textShadow: `
                      -2px -2px 0 #FF9800,
                      2px -2px 0 #FF9800,
                      -2px 2px 0 #FF9800,
                      2px 2px 0 #FF9800,
                      3px 3px 0 rgba(0,0,0,0.3)
                    `,
                    letterSpacing: '0.05em',
                  }}
                >
                  MARKET
                </h2>
              </div>
            </div>

            {/* Decorative Icons */}
            {/* Yellow arrow pointing right - left side */}
            <div className="absolute left-0 top-8 text-yellow-400 text-xl md:text-2xl" style={{ zIndex: 4 }}>→</div>
            
            {/* White circle with black flower design - left */}
            <div className="absolute left-4 top-12 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full border-2 border-black flex items-center justify-center" style={{ zIndex: 4 }}>
              <div className="w-4 h-4 md:w-6 md:h-6 bg-black rounded-full relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 md:w-2 md:h-2 bg-black rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 md:w-2 md:h-2 bg-black rounded-full"></div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 md:w-2 md:h-2 bg-black rounded-full"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 md:w-2 md:h-2 bg-black rounded-full"></div>
              </div>
            </div>

            {/* Pink heart below Market banner */}
            <div className="absolute left-16 md:left-24 bottom-8 md:bottom-12 text-2xl md:text-3xl" style={{ zIndex: 4 }}>💖</div>
            
            {/* Yellow lightning/arrows below Market */}
            <div className="absolute left-1/2 bottom-4 md:bottom-6 transform -translate-x-1/2 flex gap-2" style={{ zIndex: 4 }}>
              <span className="text-yellow-400 text-xl md:text-2xl">⚡</span>
              <span className="text-yellow-400 text-xl md:text-2xl">⚡</span>
            </div>

            {/* Pink musical note */}
            <div className="absolute right-16 md:right-24 bottom-8 md:bottom-12 text-2xl md:text-3xl" style={{ zIndex: 4 }}>🎵</div>
            
            {/* Yellow star */}
            <div className="absolute right-12 md:right-20 bottom-16 md:bottom-20 text-xl md:text-2xl" style={{ zIndex: 4 }}>⭐</div>

            {/* Yellow arrow pointing left - right side */}
            <div className="absolute right-0 top-8 text-yellow-400 text-xl md:text-2xl" style={{ zIndex: 4 }}>←</div>

            {/* Small decorative dots */}
            <div className="absolute left-4 bottom-4 w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full" style={{ zIndex: 4 }}></div>
            <div className="absolute right-4 bottom-4 w-2 h-2 md:w-3 md:h-3 bg-gray-400 rounded-full" style={{ zIndex: 4 }}></div>
            <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 w-2 h-2 md:w-3 md:h-3 bg-blue-300 rounded-full" style={{ zIndex: 4 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

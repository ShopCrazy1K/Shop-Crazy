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
        <div className="logo-fallback hidden relative" style={{ background: 'black', minHeight: '300px' }}>
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12">
            {/* "Shop" - Yellow text at top */}
            <div className="relative mb-2 md:mb-4">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-black italic"
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
                Shop
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
                className="text-6xl md:text-8xl lg:text-9xl font-black"
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
                className="text-6xl md:text-8xl lg:text-9xl font-black"
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
                className="text-6xl md:text-8xl lg:text-9xl font-black"
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
                className="text-6xl md:text-8xl lg:text-9xl font-black"
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
                className="text-6xl md:text-8xl lg:text-9xl font-black"
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

            {/* "Market" - Purple ribbon banner */}
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
                <h2 
                  className="text-3xl md:text-5xl lg:text-6xl font-black italic relative z-10"
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
                  Market
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

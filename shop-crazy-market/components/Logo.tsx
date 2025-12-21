"use client";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Dark background with glow */}
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-black rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
        {/* Subtle purple glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent"></div>
        
        {/* Decorative elements - Left side */}
        <div className="absolute left-4 top-8">
          {/* Dice */}
          <div className="bg-white rounded-lg p-2 shadow-lg transform rotate-12">
            <div className="grid grid-cols-3 gap-0.5 w-8 h-8">
              <div className="bg-black rounded-full w-1.5 h-1.5"></div>
              <div></div>
              <div className="bg-black rounded-full w-1.5 h-1.5"></div>
              <div></div>
              <div className="bg-purple-500 rounded-full w-1.5 h-1.5"></div>
              <div></div>
              <div className="bg-black rounded-full w-1.5 h-1.5"></div>
              <div></div>
              <div className="bg-black rounded-full w-1.5 h-1.5"></div>
            </div>
          </div>
          
          {/* Checkered flag */}
          <div className="mt-4 grid grid-cols-4 gap-0.5 w-12 h-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`${i % 2 === 0 ? "bg-black" : "bg-white"}`}
              ></div>
            ))}
          </div>
          
          {/* Heart */}
          <div className="mt-2 text-pink-500 text-2xl">❤️</div>
        </div>

        {/* Decorative elements - Right side */}
        <div className="absolute right-4 top-8">
          {/* Star */}
          <div className="text-yellow-400 text-2xl">⭐</div>
          
          {/* Musical note */}
          <div className="mt-2 text-pink-500 text-2xl">♪</div>
          
          {/* Lightning bolts */}
          <div className="mt-4 flex gap-1">
            <div className="text-yellow-400 text-xl">⚡</div>
            <div className="text-yellow-400 text-xl">⚡</div>
          </div>
        </div>

        {/* Spiky shape left of C */}
        <div className="absolute left-16 top-20">
          <div className="text-purple-400 text-3xl">✦</div>
        </div>

        {/* Splash/starburst right of Y */}
        <div className="absolute right-16 top-20">
          <div className="text-orange-400 text-3xl">✧</div>
        </div>

        {/* Main Logo Text */}
        <div className="relative z-10 text-center">
          {/* SHOP - Yellow bubbly text */}
          <div className="mb-2">
            <span className="text-4xl md:text-6xl font-black text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,1)] [text-shadow:_4px_4px_0_rgb(0,0,0),_6px_6px_0_rgba(0,0,0,0.5),_0_0_15px_rgba(250,204,21,0.8)] transform -rotate-1">
              Shop
            </span>
          </div>

          {/* Green slime drip under Shop */}
          <div className="relative -mt-2 mb-4 flex justify-center">
            <div className="bg-green-400 rounded-b-full w-32 h-8 opacity-80"></div>
            <div className="absolute left-1/4 bg-green-400 rounded-b-full w-12 h-6 opacity-60"></div>
          </div>

          {/* CRAZY - Colorful letters */}
          <div className="flex justify-center items-center gap-1 md:gap-2 mb-4">
            {/* C - Pink */}
            <span className="text-6xl md:text-8xl font-black text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,1)] [text-shadow:_5px_5px_0_rgb(0,0,0),_7px_7px_0_rgba(0,0,0,0.5),_0_0_20px_rgba(236,72,153,0.8)] transform hover:scale-110 transition-transform">
              C
            </span>
            
            {/* R - Yellow */}
            <span className="text-6xl md:text-8xl font-black text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,1)] [text-shadow:_5px_5px_0_rgb(0,0,0),_7px_7px_0_rgba(0,0,0,0.5),_0_0_20px_rgba(250,204,21,0.8)] transform hover:scale-110 transition-transform">
              R
            </span>
            
            {/* A - Green */}
            <span className="text-6xl md:text-8xl font-black text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,1)] [text-shadow:_5px_5px_0_rgb(0,0,0),_7px_7px_0_rgba(0,0,0,0.5),_0_0_20px_rgba(74,222,128,0.8)] transform hover:scale-110 transition-transform">
              A
            </span>
            
            {/* Z - Orange */}
            <span className="text-6xl md:text-8xl font-black text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,1)] [text-shadow:_5px_5px_0_rgb(0,0,0),_7px_7px_0_rgba(0,0,0,0.5),_0_0_20px_rgba(251,146,60,0.8)] transform hover:scale-110 transition-transform">
              Z
            </span>
            
            {/* Y - Blue */}
            <span className="text-6xl md:text-8xl font-black text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,1)] [text-shadow:_5px_5px_0_rgb(0,0,0),_7px_7px_0_rgba(0,0,0,0.5),_0_0_20px_rgba(96,165,250,0.8)] transform hover:scale-110 transition-transform">
              Y
            </span>
          </div>

          {/* Green drip under A */}
          <div className="relative -mt-4 mb-4 flex justify-center">
            <div className="bg-green-400 rounded-b-full w-16 h-6 opacity-80"></div>
          </div>

          {/* MARKET - White text on purple banner */}
          <div className="relative mt-4">
            {/* Purple banner */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg px-6 py-3 md:px-8 md:py-4 shadow-xl transform -rotate-1">
              <div className="relative">
                {/* Ribbon fold effect */}
                <div className="absolute -right-2 top-0 w-4 h-full bg-purple-800 transform skew-y-12"></div>
                
                {/* Market text */}
                <span className="text-3xl md:text-5xl font-black text-white [text-shadow:_4px_4px_0_rgb(0,0,0),_0_0_15px_rgba(255,255,255,0.5)] relative z-10">
                  Market
                </span>
              </div>
            </div>
          </div>

          {/* Scattered shapes at bottom */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-around items-end opacity-60">
            <div className="text-yellow-400 text-xl">▲</div>
            <div className="text-blue-400 text-lg">■</div>
            <div className="text-pink-400 text-xl">●</div>
            <div className="text-green-400 text-lg">▲</div>
            <div className="text-orange-400 text-xl">●</div>
          </div>
        </div>
      </div>
    </div>
  );
}


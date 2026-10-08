import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'light',
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }[size];

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-0.5',
    xl: 'text-xs px-3 py-1'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Java + Code Vector Insignia */}
      <div className={`relative ${iconDimensions} shrink-0 rounded-xl overflow-hidden shadow-xs flex items-center justify-center transition-transform hover:scale-105`}>
        {/* Rich background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-indigo-950 to-indigo-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.35),transparent_65%)]" />

        {/* SVG Graphic */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full p-1.5 drop-shadow-sm"
        >
          {/* Dual Steam Waves styled as curly braces and coffee steam */}
          <path
            d="M13.5 8C13.5 11 16 12 16 15"
            stroke="url(#steam-grad-1)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M20 6.5C20 9.5 22.5 11 22.5 14"
            stroke="url(#steam-grad-2)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Stylized Coffee Cup Bowl with Code Chevron Accent */}
          <path
            d="M10 16H24C24 21 21 24.5 17 24.5C13 24.5 10 21 10 16Z"
            fill="url(#cup-grad)"
          />

          {/* Cup Handle */}
          <path
            d="M23.5 17.5C26 17.5 27.5 19 27.5 20.5C27.5 22 25.5 23 23 23"
            stroke="#FDBA74"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Saucer / Platform Base */}
          <path
            d="M8.5 26.5C13 27.5 21 27.5 25.5 26.5"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Code Chevron `< / >` glow inside cup */}
          <path
            d="M14.5 19.5L16 21L14.5 22.5"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 19.5L18 21L19.5 22.5"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="steam-grad-1" x1="13.5" y1="8" x2="16" y2="15" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316" />
              <stop offset="1" stopColor="#FB923C" />
            </linearGradient>
            <linearGradient id="steam-grad-2" x1="20" y1="6.5" x2="22.5" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FB923C" />
              <stop offset="1" stopColor="#FDBA74" />
            </linearGradient>
            <linearGradient id="cup-grad" x1="10" y1="16" x2="24" y2="24.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#3730A3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography Wordmark */}
      {showText && (
        <div className="flex items-center">
          <span
            className={`font-black tracking-tight font-sans ${textSizes} ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Java <span className={theme === 'dark' ? 'text-orange-400' : 'text-indigo-600'}>Quiz</span>
          </span>
        </div>
      )}
    </div>
  );
};

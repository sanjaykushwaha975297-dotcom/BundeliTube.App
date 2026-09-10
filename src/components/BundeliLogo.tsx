import React from 'react';

interface BundeliLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  variant?: 'emblem' | 'horizontal' | 'badge';
  className?: string;
  logoUrl?: string;
  appName?: string;
  animated?: boolean;
}

export const BundeliLogo: React.FC<BundeliLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'horizontal',
  className = '',
  logoUrl,
  appName = 'BundeliTube'
}) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeMap = {
    xs: { icon: 28, maxH: 'max-h-7', maxW: 'max-w-[120px]', text: 'text-sm sm:text-base', badge: 'h-8' },
    sm: { icon: 36, maxH: 'max-h-9', maxW: 'max-w-[150px]', text: 'text-base sm:text-lg', badge: 'h-10' },
    md: { icon: 46, maxH: 'max-h-12', maxW: 'max-w-[180px]', text: 'text-lg sm:text-xl', badge: 'h-12' },
    lg: { icon: 64, maxH: 'max-h-16', maxW: 'max-w-[220px]', text: 'text-xl sm:text-2xl', badge: 'h-16' },
    xl: { icon: 92, maxH: 'max-h-24', maxW: 'max-w-[300px]', text: 'text-2xl sm:text-3xl', badge: 'h-24' },
    '2xl': { icon: 130, maxH: 'max-h-36', maxW: 'max-w-[420px]', text: 'text-4xl sm:text-5xl', badge: 'h-36' }
  };

  const dim = sizeMap[size];
  const effectiveLogoUrl = !imgError && logoUrl && logoUrl.trim().length > 0 ? logoUrl.trim() : null;

  // Hyper-realistic 3D Red & Black Aerodynamic Play Emblem (Matching BundeliTube official logo)
  const renderEmblemSVG = (iconSize: number) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_4px_14px_rgba(220,38,38,0.45)] transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        {/* Glow and Shadow Filters */}
        <filter id="outerGlowRed" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="drop3DShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#000000" floodOpacity="0.65" />
        </filter>

        {/* 3D Glossy Cherry Red Outer Shell Gradient */}
        <linearGradient id="glossyRedShell" x1="120" y1="40" x2="440" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4b4b" />
          <stop offset="18%" stopColor="#e60000" />
          <stop offset="55%" stopColor="#b30000" />
          <stop offset="85%" stopColor="#7a0000" />
          <stop offset="100%" stopColor="#400000" />
        </linearGradient>

        {/* Top Rim Specular Red Highlight */}
        <linearGradient id="topRedHighlight" x1="180" y1="20" x2="460" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#ff9999" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#ff1a1a" stopOpacity="0" />
        </linearGradient>

        {/* Piano Black Aerodynamic Wing Gradient */}
        <linearGradient id="pianoBlackWing" x1="60" y1="100" x2="300" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2c303b" />
          <stop offset="25%" stopColor="#15171d" />
          <stop offset="65%" stopColor="#08090d" />
          <stop offset="100%" stopColor="#010203" />
        </linearGradient>

        {/* Glossy Black Specular Curved Reflection */}
        <linearGradient id="blackSpecGlaze" x1="50" y1="160" x2="200" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="35%" stopColor="#94a3b8" stopOpacity="0.2" />
          <stop offset="80%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>

        {/* Chrome Metallic Trim Gradient */}
        <linearGradient id="chromeTrimGrad" x1="120" y1="120" x2="360" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="75%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Inner Red Frame Bezel Gradient */}
        <linearGradient id="innerRedBezel" x1="160" y1="120" x2="360" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2a2a" />
          <stop offset="50%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#800000" />
        </linearGradient>

        {/* Center White Play Triangle Gradient (High Gloss Pearl White) */}
        <linearGradient id="pearlWhitePlay" x1="180" y1="140" x2="330" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Glass Sheen on Play Triangle */}
        <linearGradient id="playGlassSheen" x1="180" y1="140" x2="280" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g filter="url(#drop3DShadow)">
        {/* 1. Main Outer 3D Triangular Aerodynamic Body (Red Top-Right Wing + Black Left-Bottom Wing) */}
        {/* Outer Red Top Shell */}
        <path
          d="M 180 28
             C 270 12, 400 90, 465 210
             C 500 275, 480 340, 410 385
             C 350 425, 270 475, 175 480
             C 120 482, 65 440, 48 375
             C 32 315, 38 220, 75 140
             C 105 80, 140 34, 180 28 Z"
          fill="url(#glossyRedShell)"
        />

        {/* Outer Red Shell Highlights & Specular Reflections */}
        <path
          d="M 185 36
             C 265 22, 385 96, 448 208
             C 475 258, 465 310, 420 350
             C 375 390, 310 435, 220 455
             C 310 405, 395 345, 425 285
             C 458 218, 410 120, 305 70
             C 255 45, 215 40, 185 36 Z"
          fill="url(#topRedHighlight)"
        />

        {/* 2. Sleek Glossy Piano Black Left Curved Body Shell */}
        <path
          d="M 180 34
             C 135 42, 95 90, 68 152
             C 35 225, 30 310, 48 370
             C 60 412, 95 450, 145 465
             C 195 480, 260 460, 320 430
             C 230 460, 150 445, 105 400
             C 65 355, 60 270, 85 200
             C 108 140, 145 80, 180 34 Z"
          fill="url(#pianoBlackWing)"
        />

        {/* Specular Highlight on Black Wing Edge */}
        <path
          d="M 170 48
             C 130 65, 95 110, 75 168
             C 52 230, 48 305, 62 360
             C 72 398, 100 432, 140 448
             C 105 425, 80 385, 72 340
             C 60 280, 65 210, 90 155
             C 112 108, 142 68, 170 48 Z"
          fill="url(#blackSpecGlaze)"
        />

        {/* 3. Aerodynamic Silver/Chrome Transition Ridge */}
        <path
          d="M 195 75
             C 155 115, 120 180, 108 250
             C 95 320, 115 385, 165 425
             C 215 465, 290 440, 360 395
             C 400 370, 428 325, 420 280
             C 410 235, 365 190, 320 150
             C 275 110, 235 85, 195 75 Z"
          fill="#0f1218"
          stroke="url(#chromeTrimGrad)"
          strokeWidth="6"
        />

        {/* Chrome Bottom Reflection Line */}
        <path
          d="M 112 260
             C 102 320, 120 375, 165 415
             C 210 455, 280 435, 345 395"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* 4. Inner Recessed Triangular Core Casing */}
        <path
          d="M 172 135
             L 360 240
             C 382 252, 382 268, 360 280
             L 172 385
             C 150 397, 130 385, 130 360
             L 130 160
             C 130 135, 150 123, 172 135 Z"
          fill="#06070a"
          stroke="url(#innerRedBezel)"
          strokeWidth="12"
          strokeLinejoin="round"
        />

        {/* Glowing Neon Red Bezel Outline */}
        <path
          d="M 180 148
             L 348 245
             C 365 255, 365 265, 348 275
             L 180 372
             C 162 382, 146 372, 146 352
             L 146 168
             C 146 148, 162 138, 180 148 Z"
          fill="#d90404"
          stroke="#ff4d4d"
          strokeWidth="4"
          strokeLinejoin="round"
          filter="drop-shadow(0 0 8px rgba(255,0,0,0.8))"
        />

        {/* 5. Center 3D Pearl White Glossy Play Triangle */}
        <path
          d="M 190 165
             L 335 248
             C 348 255, 348 265, 335 272
             L 190 355
             C 176 363, 162 355, 162 338
             L 162 182
             C 162 165, 176 157, 190 165 Z"
          fill="url(#pearlWhitePlay)"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Play Triangle Top Glass Specular Reflection */}
        <path
          d="M 164 182
             L 164 260
             L 280 258
             L 332 252
             C 335 250, 332 248, 328 245
             L 190 165
             C 176 157, 164 165, 164 182 Z"
          fill="url(#playGlassSheen)"
        />

        {/* Bottom Chrome Bevel Edge of Play Button */}
        <path
          d="M 166 338
             C 166 350, 176 356, 188 350
             L 330 268"
          stroke="#94a3b8"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Star Specular Glints */}
        <circle cx="410" cy="290" r="3" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
        <circle cx="95" cy="385" r="2.5" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
        <circle cx="395" cy="145" r="2" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
      </g>
    </svg>
  );

  // If custom logo image is provided by Admin / Remote config
  if (effectiveLogoUrl) {
    if (variant === 'emblem') {
      return (
        <div className={`inline-flex flex-col items-center justify-center ${className}`}>
          <img
            src={effectiveLogoUrl}
            alt={appName}
            onError={() => setImgError(true)}
            className={`object-contain ${dim.maxH} ${dim.maxW} w-auto h-auto max-h-[160px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105`}
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    if (variant === 'badge') {
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-red-600/50 shadow-[0_0_15px_rgba(239,68,68,0.25)] ${className}`}>
          <img
            src={effectiveLogoUrl}
            alt={appName}
            onError={() => setImgError(true)}
            className={`object-contain ${dim.maxH} ${dim.maxW} w-auto h-auto`}
            referrerPolicy="no-referrer"
          />
          {showText && (
            <div className="flex flex-col text-left">
              <span className="font-extrabold tracking-tight text-white font-sans text-xs uppercase">
                {appName}
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 sm:gap-3 group select-none ${className}`}>
        <div className="relative flex items-center justify-center shrink-0">
          <img
            src={effectiveLogoUrl}
            alt={appName}
            onError={() => setImgError(true)}
            className={`object-contain ${dim.maxH} ${dim.maxW} w-auto h-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]`}
            referrerPolicy="no-referrer"
          />
        </div>

        {showText && (
          <div className="flex items-center">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white group-hover:text-red-500 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans ${dim.text}`}>
              Bundeli<span className="text-red-600 font-black drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">Tube</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // If emblem variant requested
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        {renderEmblemSVG(dim.icon * 2.2)}
      </div>
    );
  }

  // If badge variant requested (compact 3D badge)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-red-600/50 shadow-[0_0_15px_rgba(239,68,68,0.25)] ${className}`}>
        {renderEmblemSVG(dim.icon)}
        {showText && (
          <div className="flex flex-col text-left">
            <span className="font-extrabold tracking-tight text-white font-sans text-xs uppercase">
              Bundeli<span className="text-red-500 font-black">Tube</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default horizontal navigation brand layout (No subtitle underneath BundeliTube as requested)
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 group select-none ${className}`}>
      {/* 3D Aerodynamic Play Badge Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {renderEmblemSVG(dim.icon)}
      </div>

      {/* Brand Title Text without any subtitle underneath */}
      {showText && (
        <div className="flex items-center">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-sans ${dim.text}`}>
            Bundeli<span className="text-red-600 font-black drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">Tube</span>
          </span>
        </div>
      )}
    </div>
  );
};


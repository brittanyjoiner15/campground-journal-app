interface CampingLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const CampingLoader = ({ message = 'Loading...', size = 'medium' }: CampingLoaderProps) => {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Animated Campervan with Cat Driver */}
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full animate-bounce-gentle"
          style={{
            animation: 'bounce-gentle 2s ease-in-out infinite, drive-wobble 3s ease-in-out infinite',
          }}
        >
          {/* Ground/Road */}
          <line
            x1="0"
            y1="100"
            x2="200"
            y2="100"
            stroke="#E5D4C1"
            strokeWidth="2"
            strokeDasharray="10 5"
            className="animate-road-dash"
          />

          {/* Dust clouds */}
          <circle cx="40" cy="105" r="3" fill="#E5D4C1" opacity="0.6" className="animate-puff-1" />
          <circle cx="50" cy="107" r="4" fill="#E5D4C1" opacity="0.4" className="animate-puff-2" />
          <circle cx="120" cy="105" r="3" fill="#E5D4C1" opacity="0.6" className="animate-puff-1" style={{ animationDelay: '0.5s' }} />

          {/* Campervan Body */}
          <g transform="translate(0, 0)">
            {/* Main body */}
            <rect
              x="30"
              y="50"
              width="120"
              height="45"
              rx="8"
              fill="#F25C2A"
              stroke="#2D2821"
              strokeWidth="2"
            />

            {/* Roof */}
            <path
              d="M 35 50 L 50 35 L 130 35 L 145 50 Z"
              fill="#D94D20"
              stroke="#2D2821"
              strokeWidth="2"
            />

            {/* Windows */}
            <rect x="55" y="40" width="30" height="18" rx="3" fill="#87CEEB" stroke="#2D2821" strokeWidth="1.5" opacity="0.8" />
            <rect x="100" y="40" width="30" height="18" rx="3" fill="#87CEEB" stroke="#2D2821" strokeWidth="1.5" opacity="0.8" />

            {/* Cat Driver! */}
            <g transform="translate(60, 45)">
              {/* Cat head */}
              <circle cx="10" cy="8" r="6" fill="#2D2821" />
              {/* Ears */}
              <path d="M 6 4 L 4 0 L 8 4 Z" fill="#2D2821" />
              <path d="M 14 4 L 16 0 L 12 4 Z" fill="#2D2821" />
              {/* Eyes (looking ahead) */}
              <circle cx="8" cy="8" r="1.5" fill="white" />
              <circle cx="12" cy="8" r="1.5" fill="white" />
              <circle cx="8.5" cy="8" r="0.8" fill="#2D2821" />
              <circle cx="12.5" cy="8" r="0.8" fill="#2D2821" />
              {/* Steering wheel */}
              <circle cx="10" cy="15" r="3" fill="none" stroke="#2D2821" strokeWidth="1" />
            </g>

            {/* Door */}
            <rect x="105" y="60" width="25" height="30" rx="3" fill="#D94D20" stroke="#2D2821" strokeWidth="1.5" />
            <circle cx="125" cy="75" r="1.5" fill="#2D2821" />

            {/* Side stripes */}
            <line x1="35" y1="70" x2="145" y2="70" stroke="white" strokeWidth="2" />
            <line x1="35" y1="75" x2="145" y2="75" stroke="white" strokeWidth="1" />

            {/* Front bumper */}
            <rect x="145" y="65" width="8" height="25" rx="2" fill="#C43D15" stroke="#2D2821" strokeWidth="1.5" />

            {/* Headlight */}
            <circle cx="149" cy="73" r="3" fill="#FFE66D" stroke="#2D2821" strokeWidth="1" opacity="0.9" />

            {/* Wheels */}
            <g className="animate-spin-wheel" style={{ transformOrigin: '50px 95px' }}>
              <circle cx="50" cy="95" r="12" fill="#2D2821" stroke="#4A4A4A" strokeWidth="2" />
              <circle cx="50" cy="95" r="6" fill="#6B6560" />
              <line x1="50" y1="83" x2="50" y2="107" stroke="#4A4A4A" strokeWidth="2" />
              <line x1="38" y1="95" x2="62" y2="95" stroke="#4A4A4A" strokeWidth="2" />
            </g>

            <g className="animate-spin-wheel" style={{ transformOrigin: '130px 95px' }}>
              <circle cx="130" cy="95" r="12" fill="#2D2821" stroke="#4A4A4A" strokeWidth="2" />
              <circle cx="130" cy="95" r="6" fill="#6B6560" />
              <line x1="130" y1="83" x2="130" y2="107" stroke="#4A4A4A" strokeWidth="2" />
              <line x1="118" y1="95" x2="142" y2="95" stroke="#4A4A4A" strokeWidth="2" />
            </g>
          </g>
        </svg>
      </div>

      {/* Loading text with dots animation */}
      <div className="flex items-center gap-2">
        <p className="text-ink text-lg font-medium">{message}</p>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-0.5deg); }
        }

        @keyframes drive-wobble {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
        }

        @keyframes spin-wheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes puff-1 {
          0% { transform: scale(0) translateX(0); opacity: 0.6; }
          50% { opacity: 0.4; }
          100% { transform: scale(2) translateX(-20px); opacity: 0; }
        }

        @keyframes puff-2 {
          0% { transform: scale(0) translateX(0); opacity: 0.4; }
          50% { opacity: 0.3; }
          100% { transform: scale(2.5) translateX(-25px); opacity: 0; }
        }

        @keyframes road-dash {
          to { stroke-dashoffset: -30; }
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-spin-wheel {
          animation: spin-wheel 1s linear infinite;
        }

        .animate-puff-1 {
          animation: puff-1 2s ease-out infinite;
        }

        .animate-puff-2 {
          animation: puff-2 2.5s ease-out infinite;
        }

        .animate-road-dash {
          animation: road-dash 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

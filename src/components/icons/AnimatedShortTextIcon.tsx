import React from 'react';

interface AnimatedShortTextIconProps {
  size?: number;
  className?: string;
  isAnimating?: boolean;
}

export const AnimatedShortTextIcon: React.FC<AnimatedShortTextIconProps> = ({ 
  size = 20, 
  className = '',
  isAnimating = false 
}) => {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size, overflow: 'visible' }}>
      <svg
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        width={size}
        height={size}
        viewBox="0 0 35 35"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Left chain link */}
        <g 
          className={isAnimating ? 'animate-[chain-left_2s_ease-in-out_infinite]' : ''}
          style={{ transformOrigin: '10.5px 17.5px' }}
        >
          <path d="M12.72,26.43H9.18a8.93,8.93,0,0,1,0-17.86h3.54a1.25,1.25,0,0,1,0,2.5H9.18a6.43,6.43,0,0,0,0,12.86h3.54a6.44,6.44,0,0,0,6.43-6.43,1.25,1.25,0,0,1,2.5,0A8.94,8.94,0,0,1,12.72,26.43Z"/>
        </g>
        
        {/* Right chain link */}
        <g 
          className={isAnimating ? 'animate-[chain-right_2s_ease-in-out_infinite]' : ''}
          style={{ transformOrigin: '24.5px 17.5px' }}
        >
          <path d="M25.82,26.43H22.28a1.25,1.25,0,0,1,0-2.5h3.54a6.43,6.43,0,0,0,0-12.86H22.28a6.44,6.44,0,0,0-6.43,6.43,1.25,1.25,0,0,1-2.5,0,8.94,8.94,0,0,1,8.93-8.93h3.54a8.93,8.93,0,0,1,0,17.86Z"/>
        </g>
      </svg>

      <style>{`
        @keyframes chain-left {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-3px);
          }
        }

        @keyframes chain-right {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }
      `}</style>
    </div>
  );
};

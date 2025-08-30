import React from 'react'

interface IQLogoProps {
  size?: number
  className?: string
}

export const IQLogo: React.FC<IQLogoProps> = ({ size = 120, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo circular */}
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Círculo base */}
          <circle cx="60" cy="60" r="60" fill="#2E3A8C" />
          
          {/* Segmentos del logo circular */}
          <path
            d="M60 10 A50 50 0 0 1 95 35 L75 55 A25 25 0 0 0 60 35 Z"
            fill="#F59E0B"
          />
          <path
            d="M95 35 A50 50 0 0 1 95 85 L75 65 A25 25 0 0 0 75 55 Z"
            fill="#06B6D4"
          />
          <path
            d="M95 85 A50 50 0 0 1 60 110 L60 85 A25 25 0 0 0 75 65 Z"
            fill="#10B981"
          />
          <path
            d="M60 110 A50 50 0 0 1 25 85 L45 65 A25 25 0 0 0 60 85 Z"
            fill="#8B5CF6"
          />
          <path
            d="M25 85 A50 50 0 0 1 25 35 L45 55 A25 25 0 0 0 45 65 Z"
            fill="#EF4444"
          />
          <path
            d="M25 35 A50 50 0 0 1 60 10 L60 35 A25 25 0 0 0 45 55 Z"
            fill="#84CC16"
          />
          
          {/* Centro */}
          <circle cx="60" cy="60" r="15" fill="white" />
        </svg>
      </div>
      
      {/* Texto del logo */}
      <div className="flex flex-col">
        <div className="text-2xl font-bold text-primary-600" style={{ fontSize: size * 0.2 }}>
          <span className="text-primary-600">i</span>
          <span className="text-primary-600">Q</span>
        </div>
        <div 
          className="text-secondary-500 font-semibold tracking-wider"
          style={{ fontSize: size * 0.12 }}
        >
          OUTSOURCING
        </div>
      </div>
    </div>
  )
}

// Versión compacta solo del círculo
export const IQLogoCircle: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => {
  return (
    <div style={{ width: size, height: size }} className={`relative ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo base */}
        <circle cx="60" cy="60" r="60" fill="#2E3A8C" />
        
        {/* Segmentos del logo circular */}
        <path
          d="M60 10 A50 50 0 0 1 95 35 L75 55 A25 25 0 0 0 60 35 Z"
          fill="#F59E0B"
        />
        <path
          d="M95 35 A50 50 0 0 1 95 85 L75 65 A25 25 0 0 0 75 55 Z"
          fill="#06B6D4"
        />
        <path
          d="M95 85 A50 50 0 0 1 60 110 L60 85 A25 25 0 0 0 75 65 Z"
          fill="#10B981"
        />
        <path
          d="M60 110 A50 50 0 0 1 25 85 L45 65 A25 25 0 0 0 60 85 Z"
          fill="#8B5CF6"
        />
        <path
          d="M25 85 A50 50 0 0 1 25 35 L45 55 A25 25 0 0 0 45 65 Z"
          fill="#EF4444"
        />
        <path
          d="M25 35 A50 50 0 0 1 60 10 L60 35 A25 25 0 0 0 45 55 Z"
          fill="#84CC16"
        />
        
        {/* Centro */}
        <circle cx="60" cy="60" r="15" fill="white" />
      </svg>
    </div>
  )
}

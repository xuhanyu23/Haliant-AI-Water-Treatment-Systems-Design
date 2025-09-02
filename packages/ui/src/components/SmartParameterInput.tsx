import React, { useState, useEffect } from 'react';

interface ValidationResult {
  warnings: string[];
}

interface SmartParameterInputProps {
  label: string;
  name: string;
  type?: 'number' | 'text' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: string;
  options?: Array<{ value: string | number; label: string }>;
  unit?: string;
  helpText?: string;
  currentParameters?: any;
  systemType?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export function SmartParameterInput({
  label,
  name,
  type = 'number',
  value,
  onChange,
  onBlur,
  placeholder,
  min,
  max,
  step = '0.1',
  options,
  unit,
  helpText,
  currentParameters,
  systemType = 'cip-ro',
  className = '',
  error,
  disabled = false,
}: SmartParameterInputProps) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (!currentParameters || !value) return;

    const timeoutId = setTimeout(async () => {
      await validateParameter();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [value, currentParameters]);

  const validateParameter = async () => {
    if (!currentParameters) return;

    setIsValidating(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      
      const response = await fetch(`${API_BASE}/api/ai/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters: currentParameters,
          systemType,
        }),
      });

      if (response.ok) {
        const result: ValidationResult = await response.json();
        
        // Filter warnings relevant to this parameter
        const relevantWarnings = result.warnings.filter(warning =>
          warning.toLowerCase().includes(name.toLowerCase()) ||
          warning.toLowerCase().includes(label.toLowerCase())
        );
        
        setWarnings(relevantWarnings);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];
    
    if (systemType === 'cip-ro') {
      switch (name) {
        case 'perVesselFlowGPM':
          if (typeof value === 'number') {
            if (value < 35) recommendations.push('💡 Consider 35-50 GPM for optimal cleaning efficiency');
            if (value > 60) recommendations.push('⚠️ High flow rates may damage membranes - consider multiple stages');
          }
          break;
        case 'targetTempC':
          if (typeof value === 'number') {
            if (value > 35 && value <= 40) recommendations.push('✅ Good temperature for enhanced cleaning');
            if (value > 45) recommendations.push('🔥 Temperature too high - may damage RO membranes');
          }
          break;
        case 'vesselsStage1':
          recommendations.push('📊 Stage 1 typically handles 60-70% of total flow');
          break;
        case 'vesselsStage2':
          recommendations.push('📊 Stage 2 completes the cleaning cycle');
          break;
      }
    }
    
    return recommendations;
  };

  const getInputClassName = () => {
    let baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors";
    
    if (error) {
      baseClass += " border-red-300 focus:border-red-500 focus:ring-red-500";
    } else if (warnings.length > 0) {
      baseClass += " border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500";
    } else {
      baseClass += " border-gray-300 focus:border-blue-500 focus:ring-blue-500";
    }
    
    if (disabled) {
      baseClass += " bg-gray-100 cursor-not-allowed";
    }
    
    return baseClass;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const recommendations = getRecommendations();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Help Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {unit && <span className="text-gray-500">({unit})</span>}
          {error && <span className="text-red-500 ml-1">*</span>}
          {warnings.length > 0 && <span className="text-yellow-500 ml-1">⚠️</span>}
        </label>
        
        {(helpText || recommendations.length > 0) && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Show help"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Input Field */}
      <div className="relative">
        {type === 'select' && options ? (
          <select
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            disabled={disabled}
            className={getInputClassName()}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={getInputClassName()}
          />
        )}

        {/* Validation Loading Indicator */}
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm flex items-start space-x-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Warnings */}
      {warnings.map((warning, index) => (
        <div key={index} className="text-yellow-600 text-sm flex items-start space-x-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span dangerouslySetInnerHTML={{ __html: warning.replace(/[⚠️🌡️📊💡✅🔥]/g, '') }} />
        </div>
      ))}

      {/* Help Text and Recommendations */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          {helpText && (
            <div className="text-sm text-blue-800">
              <strong>About this parameter:</strong> {helpText}
            </div>
          )}
          
          {recommendations.length > 0 && (
            <div className="text-sm text-blue-800">
              <strong>Recommendations:</strong>
              <ul className="mt-1 space-y-1 ml-4 list-disc">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
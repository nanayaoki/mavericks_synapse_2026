import React from 'react';

interface BrandLogoProps {
  onClick?: () => void;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 text-left focus:outline-none group ${className}`}
    >
      {/* Subtle geometric symbol: Person node + Skill graph edges + Verification check */}
      <span className="w-7 h-7 rounded-[6px] bg-[#1D4ED8] flex items-center justify-center text-white shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.08)] group-hover:bg-[#1E3A8A] transition-colors">
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Person top node */}
          <circle cx="6.5" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.75" />
          {/* Skill graph connecting lines */}
          <path
            d="M6.5 7.7V13.5M6.5 10.5L11.5 7.5M6.5 13.5L11.5 15.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Secondary graph node */}
          <circle cx="6.5" cy="14.5" r="1.5" fill="currentColor" />
          {/* Verification check node on right */}
          <path
            d="M11.5 11.2L13.4 13.1L17.2 9.1"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] whitespace-nowrap">
        SkillTwin
      </span>
    </button>
  );
};

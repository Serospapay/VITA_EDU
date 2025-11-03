import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Simple V# - no block, large and clear */}
      <span className={`${size === 'sm' ? 'text-3xl' : size === 'md' ? 'text-4xl' : 'text-5xl'} font-black leading-none`}>
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-purple-300 transition-all">
          V
        </span>
        <span className="text-white/90">#</span>
      </span>
      
      {showText && (
        <div className="flex items-baseline gap-1">
          <span className={`${textSizes[size]} font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-purple-300 transition-all`}>
            VITA
          </span>
          <span className={`${textSizes[size]} font-bold text-white/90`}>
            -Edu
          </span>
          <span className="ml-1 text-xs font-semibold text-purple-400/70 hidden sm:inline">
            IT
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;



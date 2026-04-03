import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: 'h-7 w-7 rounded-lg', icon: 'h-4 w-4', text: 'text-base' },
  md: { box: 'h-8 w-8 rounded-lg', icon: 'h-[18px] w-[18px]', text: 'text-lg' },
  lg: { box: 'h-11 w-11 rounded-xl', icon: 'h-6 w-6', text: 'text-xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          s.box,
          'inline-flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-400 shadow-md shadow-violet-500/20'
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={s.icon}
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </span>
      {showText && (
        <span className={cn(s.text, 'font-bold tracking-tight')}>
          MedicalPower
        </span>
      )}
    </span>
  );
}

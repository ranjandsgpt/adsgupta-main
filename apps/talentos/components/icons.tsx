import type React from "react";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function DotIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

export const AlertCircle = DotIcon;
export const AlertTriangle = DotIcon;
export const ArrowRight = DotIcon;
export const ArrowUpDown = DotIcon;
export const Bookmark = DotIcon;
export const BookmarkCheck = DotIcon;
export const Bot = DotIcon;
export const Brain = DotIcon;
export const Briefcase = DotIcon;
export const Building2 = DotIcon;
export const Check = DotIcon;
export const CheckCircle2 = DotIcon;
export const Compass = DotIcon;
export const Crown = DotIcon;
export const Download = DotIcon;
export const ExternalLink = DotIcon;
export const FileText = DotIcon;
export const HelpCircle = DotIcon;
export const Loader2 = DotIcon;
export const MapPin = DotIcon;
export const Mic = DotIcon;
export const MicOff = DotIcon;
export const PlayCircle = DotIcon;
export const Search = DotIcon;
export const Send = DotIcon;
export const Sparkles = DotIcon;
export const Star = DotIcon;
export const Target = DotIcon;
export const TrendingUp = DotIcon;
export const Upload = DotIcon;
export const UploadCloud = DotIcon;
export const User = DotIcon;
export const X = DotIcon;

export type LucideIcon = (props: IconProps) => React.ReactElement;

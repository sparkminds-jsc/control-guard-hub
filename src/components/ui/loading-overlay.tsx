import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isVisible: boolean;
  className?: string;
}

export const LoadingOverlay = ({ isVisible, className }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-sm cursor-wait",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      style={{ pointerEvents: 'all' }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    </div>
  );
};
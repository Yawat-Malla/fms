interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  fileType?: string;  // e.g., 'pdf', 'docx', 'xlsx'
  fileSize?: string;  // e.g., '1.2 MB'
  interactive?: boolean; // Whether card should have hover/active animations
  onClick?: () => void;
}

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  footer,
  icon,
  actions,
  fileType,
  fileSize,
  interactive = false,
  onClick,
}: CardProps) {
  
  // File type icon rendering
  const renderFileTypeIcon = () => {
    const iconClasses = "w-10 h-10 rounded flex items-center justify-center";
    
    switch(fileType?.toLowerCase()) {
      case 'pdf':
        return (
          <div className={`${iconClasses} bg-red-100/10 text-red-400`}>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18H17V16H7V18Z" fill="currentColor" />
              <path d="M17 14H7V12H17V14Z" fill="currentColor" />
              <path d="M7 10H11V8H7V10Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
            </svg>
          </div>
        );
      case 'docx':
      case 'doc':
        return (
          <div className={`${iconClasses} bg-blue-100/10 text-blue-400`}>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18H17V16H7V18Z" fill="currentColor" />
              <path d="M17 14H7V12H17V14Z" fill="currentColor" />
              <path d="M7 10H11V8H7V10Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
            </svg>
          </div>
        );
      case 'xlsx':
      case 'xls':
        return (
          <div className={`${iconClasses} bg-green-100/10 text-green-400`}>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18H17V16H7V18Z" fill="currentColor" />
              <path d="M17 14H7V12H17V14Z" fill="currentColor" />
              <path d="M7 10H11V8H7V10Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
            </svg>
          </div>
        );
      default:
        if (icon) return icon;
        return null;
    }
  };

  // Build the card classes based on props
  const cardClasses = [
    'bg-white',
    'border',
    'border-dark-600',
    'rounded-lg',
    'shadow-sm',
    'overflow-visible',
    'transition-all',
    'duration-300',
    'ease-out',
    'hover:border-primary-500/50',
    interactive && 'cursor-pointer card-hover active:scale-[0.99]',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
    >
      {/* Card header */}
      {(title || subtitle || icon || actions || fileType) && (
        <div className="px-4 py-4 sm:px-6 flex justify-between items-start border-b border-dark-600/50">
          <div className="flex items-center">
            {(icon || fileType) && (
              <div className="mr-3 flex-shrink-0">
                {renderFileTypeIcon()}
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-medium text-dark-100">{title}</h3>}
              <div className="flex items-center">
                {subtitle && <p className="text-sm text-dark-300">{subtitle}</p>}
                {fileSize && <p className="text-xs text-dark-400 ml-2">{fileSize}</p>}
              </div>
            </div>
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      )}
      
      {/* Card body */}
      <div className="px-4 py-4 sm:p-6">{children}</div>
      
      {/* Card footer */}
      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-dark-800/5 border-t border-dark-600/50 transition-colors duration-300">
          {footer}
        </div>
      )}
    </div>
  );
} 
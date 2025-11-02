import { useEffect } from 'react';

/**
 * Reusable Toast Notification Component
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - Type of toast: 'success', 'error', 'warning', 'info'
 * @param {function} props.onDismiss - Callback when toast is dismissed
 * @param {number} props.duration - Auto-dismiss duration in milliseconds (default: 4000)
 */
const Toast = ({ message, type = 'info', onDismiss, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✖';
      case 'warning':
        return '⚠';
      default:
        return 'i';
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>

      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          animation: 'slideIn 0.3s ease-out',
          minWidth: '300px',
          maxWidth: '400px',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          gap: '12px'
        }}>
          {/* Icon */}
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: getTypeColor()
          }}>
            {getTypeIcon()}
          </div>
          
          {/* Message */}
          <div style={{
            flex: 1,
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message}
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        
        {/* Progress Bar */}
        <div style={{
          height: '4px',
          backgroundColor: '#f3f4f6',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            backgroundColor: getTypeColor(),
            animation: `progress ${duration}ms linear forwards`
          }} />
        </div>
      </div>
    </>
  );
};

export default Toast;

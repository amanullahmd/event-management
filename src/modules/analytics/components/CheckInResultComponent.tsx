import React, { useState, useEffect } from 'react';

interface AttendeeInfo {
  name: string;
  email: string;
  ticketType: string;
  ticketNumber: string;
}

interface CheckInResult {
  success: boolean;
  message: string;
  attendeeInfo?: AttendeeInfo;
  errorCode?: string;
  errorMessage?: string;
  checkInTime?: string;
  isDuplicate?: boolean;
}

interface CheckInResultComponentProps {
  result: CheckInResult | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

/**
 * Check-In Result Component for displaying check-in outcomes.
 * Shows success/failure feedback with attendee information.
 */
export const CheckInResultComponent: React.FC<CheckInResultComponentProps> = ({
  result,
  onDismiss,
  onRetry,
}) => {
  const [isVisible, setIsVisible] = useState(!!result);

  useEffect(() => {
    setIsVisible(!!result);
    
    if (result?.success && !result?.isDuplicate) {
      // Auto-dismiss successful check-ins after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [result, onDismiss]);

  if (!result || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className={`check-in-result-overlay ${result.success ? 'success' : 'error'}`}>
      <div className="result-card">
        <div className="result-header">
          <div className={`result-icon ${result.success ? 'success' : 'error'}`}>
            {result.success ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          <h2 className="result-title">
            {result.success ? 'Check-In Successful' : 'Check-In Failed'}
          </h2>
        </div>

        {result.isDuplicate && (
          <div className="duplicate-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>This ticket has already been checked in</span>
          </div>
        )}

        {result.attendeeInfo && (
          <div className="attendee-info">
            <div className="info-section">
              <label>Attendee Name</label>
              <p className="info-value">{result.attendeeInfo.name}</p>
            </div>
            <div className="info-section">
              <label>Email</label>
              <p className="info-value">{result.attendeeInfo.email}</p>
            </div>
            <div className="info-section">
              <label>Ticket Type</label>
              <p className="info-value">{result.attendeeInfo.ticketType}</p>
            </div>
            <div className="info-section">
              <label>Ticket Number</label>
              <p className="info-value">{result.attendeeInfo.ticketNumber}</p>
            </div>
            {result.checkInTime && (
              <div className="info-section">
                <label>Check-In Time</label>
                <p className="info-value">{new Date(result.checkInTime).toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        )}

        {result.errorMessage && (
          <div className="error-details">
            <div className="error-code">{result.errorCode}</div>
            <div className="error-message">{result.errorMessage}</div>
          </div>
        )}

        <div className="result-message">
          {result.message}
        </div>

        <div className="result-actions">
          {!result.success && onRetry && (
            <button className="btn btn-primary" onClick={onRetry}>
              Retry
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleDismiss}>
            {result.success ? 'Next' : 'Dismiss'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .check-in-result-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .result-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease-out;
        }

        .result-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .result-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          color: white;
          font-size: 32px;
        }

        .result-icon.success {
          background: #4caf50;
        }

        .result-icon.error {
          background: #f44336;
        }

        .result-title {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          text-align: center;
        }

        .duplicate-warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #856404;
          font-size: 14px;
        }

        .duplicate-warning svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .attendee-info {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .info-section {
          margin-bottom: 12px;
        }

        .info-section:last-child {
          margin-bottom: 0;
        }

        .info-section label {
          display: block;
          font-size: 12px;
          color: #666;
          font-weight: 600;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .info-value {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }

        .error-details {
          background: #ffebee;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .error-code {
          font-size: 12px;
          color: #c62828;
          font-weight: 600;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .error-message {
          font-size: 14px;
          color: #d32f2f;
          margin: 0;
        }

        .result-message {
          text-align: center;
          font-size: 16px;
          color: #333;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .result-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #2196f3;
          color: white;
        }

        .btn-primary:hover {
          background: #1976d2;
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CheckInResultComponent;


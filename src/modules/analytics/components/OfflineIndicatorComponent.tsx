import React, { useState, useEffect } from 'react';

interface OfflineIndicatorComponentProps {
  isOnline: boolean;
  isSyncing?: boolean;
  syncProgress?: number;
  pendingSyncs?: number;
  onSyncClick?: () => void;
}

/**
 * Offline Indicator Component for displaying connectivity status.
 * Shows offline mode indicators and sync status.
 */
export const OfflineIndicatorComponent: React.FC<OfflineIndicatorComponentProps> = ({
  isOnline,
  isSyncing = false,
  syncProgress = 0,
  pendingSyncs = 0,
  onSyncClick,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusMessage = (): string => {
    if (isSyncing) {
      return `Syncing ${pendingSyncs} items...`;
    }
    if (!isOnline) {
      return `Offline (${pendingSyncs} pending)`;
    }
    return 'Online';
  };

  const getStatusColor = (): string => {
    if (isSyncing) return '#ff9800';
    if (!isOnline) return '#f44336';
    return '#4caf50';
  };

  useEffect(() => {
    // Auto-hide details after 5 seconds
    if (showDetails) {
      const timer = setTimeout(() => setShowDetails(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showDetails]);

  return (
    <div className="offline-indicator-container">
      <div
        className={`offline-status ${!isOnline ? 'offline' : 'online'} ${isSyncing ? 'syncing' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
        style={{ borderColor: getStatusColor() }}
      >
        <div className="status-icon">
          {isSyncing ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 2.2" />
            </svg>
          ) : isOnline ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.94 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 3.02a8.94 8.94 0 0 1 5.32 5.32M5.64 5.64a9 9 0 0 0 12.72 12.72" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          )}
        </div>
        <span className="status-text">{getStatusMessage()}</span>
      </div>

      {isSyncing && (
        <div className="sync-progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${syncProgress}%` }}
          />
        </div>
      )}

      {showDetails && (
        <div className="status-details">
          <div className="details-header">
            <h3>Connectivity Status</h3>
            <button
              className="close-btn"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </button>
          </div>

          <div className="details-content">
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {pendingSyncs > 0 && (
              <div className="detail-item">
                <span className="detail-label">Pending Syncs:</span>
                <span className="detail-value">{pendingSyncs}</span>
              </div>
            )}

            {isSyncing && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Sync Progress:</span>
                  <span className="detail-value">{syncProgress}%</span>
                </div>
                <div className="sync-progress-bar-details">
                  <div
                    className="progress-fill"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </>
            )}

            {!isOnline && pendingSyncs > 0 && (
              <div className="offline-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>
                  {pendingSyncs} check-in{pendingSyncs !== 1 ? 's' : ''} waiting to sync
                </span>
              </div>
            )}

            {onSyncClick && !isOnline && pendingSyncs > 0 && (
              <button className="sync-btn" onClick={onSyncClick}>
                Sync Now
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .offline-indicator-container {
          position: relative;
        }

        .offline-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 2px solid;
          background: rgba(255, 255, 255, 0.95);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .offline-status:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .offline-status.offline {
          color: #f44336;
        }

        .offline-status.online {
          color: #4caf50;
        }

        .offline-status.syncing {
          color: #ff9800;
        }

        .status-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .status-icon svg {
          width: 100%;
          height: 100%;
          stroke: currentColor;
        }

        .offline-status.syncing .status-icon svg {
          animation: spin 1s linear infinite;
        }

        .status-text {
          white-space: nowrap;
        }

        .sync-progress-bar {
          height: 3px;
          background: #e0e0e0;
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff9800, #ffc107);
          transition: width 0.3s ease;
        }

        .status-details {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 280px;
          animation: slideDown 0.2s ease-out;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e0e0e0;
        }

        .details-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #333;
        }

        .details-content {
          padding: 12px 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          color: #666;
          font-weight: 500;
        }

        .detail-value {
          font-weight: 600;
        }

        .detail-value.online {
          color: #4caf50;
        }

        .detail-value.offline {
          color: #f44336;
        }

        .sync-progress-bar-details {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }

        .offline-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          padding: 10px;
          margin-top: 12px;
          font-size: 12px;
          color: #856404;
        }

        .offline-warning svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .sync-btn {
          width: 100%;
          padding: 8px;
          margin-top: 12px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .sync-btn:hover {
          background: #1976d2;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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

export default OfflineIndicatorComponent;


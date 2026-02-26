import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface ScanResult {
  valid: boolean;
  message: string;
  data?: string;
  error?: string;
}

interface QRScannerComponentProps {
  onScanSuccess: (qrData: string) => void;
  onScanError: (error: string) => void;
  isScanning?: boolean;
}

/**
 * QR Scanner Component for check-in operations.
 * Provides real-time QR code scanning with visual feedback.
 */
export const QRScannerComponent: React.FC<QRScannerComponentProps> = ({
  onScanSuccess,
  onScanError,
  isScanning = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    if (!isScanning) return;

    const initializeScanner = async () => {
      try {
        readerRef.current = new BrowserMultiFormatReader();
        
        // Get available video input devices
        const videoInputDevices = await readerRef.current.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          setCameraError('No camera devices found');
          onScanError('No camera devices found');
          return;
        }

        // Use the first available camera
        const selectedDeviceId = videoInputDevices[0].deviceId;
        
        // Start decoding
        await readerRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              handleScanSuccess(result.getText());
            }
            if (err && !(err instanceof Error && err.message.includes('NotFoundException'))) {
              console.error('Scan error:', err);
            }
          }
        );

        setIsInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize camera';
        setCameraError(errorMessage);
        onScanError(errorMessage);
      }
    };

    initializeScanner();

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [isScanning, onScanError]);

  const handleScanSuccess = (qrData: string) => {
    if (scanningRef.current) return; // Prevent multiple scans
    
    scanningRef.current = true;
    setScanResult({
      valid: true,
      message: 'QR Code scanned successfully',
      data: qrData,
    });

    playSuccessSound();
    onScanSuccess(qrData);

    // Reset scanning after 2 seconds
    setTimeout(() => {
      scanningRef.current = false;
      setScanResult(null);
    }, 2000);
  };

  const playSuccessSound = () => {
    // Play a beep sound on successful scan
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  return (
    <div className="qr-scanner-container">
      <div className="scanner-wrapper">
        {cameraError ? (
          <div className="camera-error">
            <p>Camera Error: {cameraError}</p>
            <p>Please ensure camera permissions are granted.</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="scanner-video"
              style={{ width: '100%', height: '100%' }}
            />
            <canvas
              ref={canvasRef}
              className="scanner-canvas"
              style={{ display: 'none' }}
            />
            <div className="scanner-overlay">
              <div className="scan-frame" />
              <div className="corner corner-top-left" />
              <div className="corner corner-top-right" />
              <div className="corner corner-bottom-left" />
              <div className="corner corner-bottom-right" />
            </div>
          </>
        )}
      </div>

      {scanResult && (
        <div className={`scan-feedback ${scanResult.valid ? 'success' : 'error'}`}>
          <div className="feedback-icon">
            {scanResult.valid ? '✓' : '✗'}
          </div>
          <div className="feedback-message">{scanResult.message}</div>
        </div>
      )}

      <style jsx>{`
        .qr-scanner-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #000;
          position: relative;
        }

        .scanner-wrapper {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #000;
        }

        .scanner-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #fff;
          text-align: center;
          padding: 20px;
        }

        .scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .scan-frame {
          width: 250px;
          height: 250px;
          border: 2px solid #00ff00;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
          position: relative;
        }

        .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid #00ff00;
        }

        .corner-top-left {
          top: 50%;
          left: 50%;
          transform: translate(-100%, -100%);
          border-right: none;
          border-bottom: none;
        }

        .corner-top-right {
          top: 50%;
          right: 50%;
          transform: translate(100%, -100%);
          border-left: none;
          border-bottom: none;
        }

        .corner-bottom-left {
          bottom: 50%;
          left: 50%;
          transform: translate(-100%, 100%);
          border-right: none;
          border-top: none;
        }

        .corner-bottom-right {
          bottom: 50%;
          right: 50%;
          transform: translate(100%, 100%);
          border-left: none;
          border-top: none;
        }

        .scan-feedback {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 15px 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: bold;
          animation: slideUp 0.3s ease-out;
        }

        .scan-feedback.success {
          background: rgba(0, 255, 0, 0.9);
          color: #000;
        }

        .scan-feedback.error {
          background: rgba(255, 0, 0, 0.9);
          color: #fff;
        }

        .feedback-icon {
          font-size: 20px;
          font-weight: bold;
        }

        .feedback-message {
          font-size: 14px;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default QRScannerComponent;

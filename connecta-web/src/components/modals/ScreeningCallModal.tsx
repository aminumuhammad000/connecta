import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, Copy, Check } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ScreeningCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  participantRole?: string;
}

export const ScreeningCallModal: React.FC<ScreeningCallModalProps> = ({
  isOpen,
  onClose,
  participantName,
  participantRole = 'Candidate'
}) => {
  const { success } = useToast();
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      // Start local media stream for video call preview
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Could not access camera/mic:', err);
        });

      // Call timer
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled;
      });
    }
    setMicEnabled(!micEnabled);
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
    }
    setVideoEnabled(!videoEnabled);
  };

  const handleCopyCallLink = () => {
    const link = `${window.location.origin}/screening-room?room=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    success('Call Link Copied', 'Disposable screening call link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(11, 15, 25, 0.95)',
        backdropFilter: 'blur(12px)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            width: '100%',
            maxWidth: '940px',
            height: '85vh',
            maxHeight: '680px',
            background: '#111827',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Top Bar */}
          <div style={{
            padding: '16px 24px',
            background: 'rgba(17, 24, 39, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981'
              }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F9FAFB', margin: 0 }}>
                  Screening Interview with {participantName}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                  Connecta Native WebRTC HD Call • {formatTimer(callDuration)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyCallLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E5E7EB',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copiedLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              {copiedLink ? 'Link Copied' : 'Copy Call Link'}
            </button>
          </div>

          {/* Main Video Grid */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            padding: '20px',
            background: '#0B0F19',
            position: 'relative'
          }}>
            {/* Participant Main Card */}
            <div style={{
              background: '#1F2937',
              borderRadius: '16px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FD6730 0%, #E5521B 100%)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(253, 103, 48, 0.3)'
              }}>
                {participantName.substring(0, 1)}
              </div>
              <div style={{ marginTop: '14px', color: '#F9FAFB', fontWeight: 700, fontSize: '1.1rem' }}>
                {participantName}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#9CA3AF', marginTop: '2px' }}>
                {participantRole} (Connecting HD Audio...)
              </span>
            </div>

            {/* Local Host Video Preview */}
            <div style={{
              background: '#1F2937',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {videoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                  <VideoOff size={44} style={{ marginBottom: '8px' }} />
                  <div>Your Camera is Off</div>
                </div>
              )}

              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '0.78rem',
                fontWeight: 600
              }}>
                You (Host) {!micEnabled && '• Muted'}
              </div>
            </div>
          </div>

          {/* Bottom Call Control Bar */}
          <div style={{
            padding: '20px 24px',
            background: '#111827',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}>
            {/* Toggle Mic */}
            <button
              onClick={toggleMic}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: micEnabled ? 'rgba(255, 255, 255, 0.1)' : '#EF4444',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
            </button>

            {/* Toggle Video */}
            <button
              onClick={toggleVideo}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: videoEnabled ? 'rgba(255, 255, 255, 0.1)' : '#EF4444',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
            </button>

            {/* Toggle Screen Share */}
            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: isScreenSharing ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Share Screen"
            >
              <Monitor size={22} />
            </button>

            {/* End Call Button */}
            <button
              onClick={onClose}
              style={{
                width: '64px',
                height: '52px',
                borderRadius: '26px',
                background: '#EF4444',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
              }}
              title="End Screening Call"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

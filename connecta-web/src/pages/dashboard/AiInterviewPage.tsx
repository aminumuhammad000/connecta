import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, Video, VideoOff, Play, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, Bot, ShieldCheck,
  Send, Check
} from 'lucide-react';
import { aiInterviewAPI, proposalAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

// Web Speech API interface definitions for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const AiInterviewPage: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Wizard Steps: 1: Mic Check, 2: Speaker Check, 3: Camera Check, 4: Rules/Screening, 5: Interview Session, 6: Completion
  const [step, setStep] = useState<number>(1);

  // Device & Stream States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micVerified, setMicVerified] = useState<boolean>(false);
  const [speakerVerified, setSpeakerVerified] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  // Audio testing
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

  // Interview Data
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [interviewSession, setInterviewSession] = useState<any | null>(null);
  const [jobInfo, setJobInfo] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [interviewResult, setInterviewResult] = useState<any | null>(null);

  // AI Interviewer State Machine: 'speaking' | 'listening' | 'processing' | 'idle'
  const [aiState, setAiState] = useState<'speaking' | 'listening' | 'processing' | 'idle'>('idle');

  // Speech Recognition & Video Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch job & proposal info on mount
  useEffect(() => {
    if (!proposalId) return;
    proposalAPI.getProposalById(proposalId)
      .then((res) => {
        if (res?.success && res.data?.jobId) {
          setJobInfo(res.data.jobId);
        } else {
          proposalAPI.getMyProposals().then((myRes) => {
            const list = Array.isArray(myRes) ? myRes : myRes?.data || [];
            const found = list.find((p: any) => p._id === proposalId);
            if (found?.jobId) setJobInfo(found.jobId);
          }).catch(() => null);
        }
      })
      .catch(() => null);
  }, [proposalId]);

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopMediaStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => null);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 1: Microphone Test & Audio Meter
  // ---------------------------------------------------------------------------
  const testMicrophone = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setStream(mediaStream);
      setMicPermission(true);

      // Web Audio API Meter setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        if (normalized > 8) {
          setMicVerified(true);
        }
        requestAnimationFrame(updateMeter);
      };
      updateMeter();

      showToast('Microphone connected successfully!', 'success');
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      setMicPermission(false);
      showToast('Microphone permission denied or device not found.', 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 2: Speaker Test via ElevenLabs or Web Speech Synthesis
  // ---------------------------------------------------------------------------
  const playTestAudio = async () => {
    setIsPlayingTestAudio(true);
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    // Safety timeout to reset button if browser audio gets stuck
    const safetyTimeout = setTimeout(() => {
      setIsPlayingTestAudio(false);
    }, 12000);

    try {
      const response = await fetch(`${backendUrl}/api/ai/interview/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Welcome to your Connecta AI interview. If you can hear this audio sample clearly, click yes to continue.',
          voiceId: 'JBFqnCBsd6RMkjVDRZzb'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          clearTimeout(safetyTimeout);
          setIsPlayingTestAudio(false);
        };
        audio.onerror = () => {
          clearTimeout(safetyTimeout);
          fallbackPlayTestAudio();
        };

        await audio.play();
        return;
      } else {
        clearTimeout(safetyTimeout);
        fallbackPlayTestAudio();
      }
    } catch (err) {
      clearTimeout(safetyTimeout);
      fallbackPlayTestAudio();
    }
  };

  const fallbackPlayTestAudio = () => {
    if (!window.speechSynthesis) {
      showToast('Audio output test fallback not supported on this browser.', 'error');
      setIsPlayingTestAudio(false);
      setSpeakerVerified(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      'Welcome to your Connecta AI interview. If you can hear this audio sample clearly, click yes to continue.'
    );
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingTestAudio(false);
    utterance.onerror = () => setIsPlayingTestAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // ---------------------------------------------------------------------------
  // STEP 3: Camera Check
  // ---------------------------------------------------------------------------
  const testCamera = async () => {
    try {
      stopMediaStream();
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setStream(mediaStream);
      setCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      showToast('Camera feed connected!', 'success');
    } catch (err) {
      console.warn('Camera permission optional/denied:', err);
      setCameraPermission(false);
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setStream(audioOnlyStream);
      } catch {
        // continue
      }
    }
  };

  useEffect(() => {
    if (step === 3) {
      testCamera();
    }
  }, [step]);

  // ---------------------------------------------------------------------------
  // STEP 4: Fetch Interview & Prepare Session
  // ---------------------------------------------------------------------------
  const prepareInterviewSession = async () => {
    if (!proposalId) return;
    setLoadingInterview(true);
    try {
      const res = await aiInterviewAPI.start(proposalId);
      if (res?.success && res.data) {
        setInterviewSession(res.data);
        setJobInfo((res as any).job);
        setStep(5);
        speakQuestion(res.data.questions[0]?.question || 'Please introduce yourself.');
      } else {
        showToast(res?.message || 'Failed to start interview session.', 'error');
      }
    } catch (err: any) {
      console.error('Error starting interview session:', err);
      showToast(err.response?.data?.message || 'Failed to initialize AI interview.', 'error');
    } finally {
      setLoadingInterview(false);
    }
  };

  // ---------------------------------------------------------------------------
  // ElevenLabs Text-to-Speech & Speech Recognition in Session
  // ---------------------------------------------------------------------------
  const speakQuestion = async (text: string) => {
    setAiState('speaking');
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      // Stream high-quality AI voice audio from ElevenLabs endpoint
      const response = await fetch(`${backendUrl}/api/ai/interview/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: 'JBFqnCBsd6RMkjVDRZzb' })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setAiState('listening');
          startVoiceRecognition();
        };

        audio.onerror = () => {
          fallbackWebSpeech(text);
        };

        await audio.play();
        return;
      } else {
        fallbackWebSpeech(text);
      }
    } catch (err) {
      console.warn('ElevenLabs play fallback to WebSpeech:', err);
      fallbackWebSpeech(text);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setAiState('listening');
        startVoiceRecognition();
      };
      utterance.onerror = () => {
        setAiState('listening');
        startVoiceRecognition();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setAiState('listening');
      startVoiceRecognition();
    }
  };

  const candidateAnswerRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        let hasFinalResult = false;

        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            hasFinalResult = true;
          }
        }
        const trimmed = fullTranscript.trim();
        if (trimmed) {
          candidateAnswerRef.current = trimmed;
          setCandidateAnswer(trimmed);

          // Reset silence timer every time user speaks
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          
          // Snappy auto-submit after 1.8s of silence OR 1.2s when final sentence detected
          const timeoutDuration = hasFinalResult ? 1200 : 1800;
          silenceTimerRef.current = setTimeout(() => {
            if (candidateAnswerRef.current.trim()) {
              handleNextQuestion(candidateAnswerRef.current.trim());
            }
          }, timeoutDuration);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition status:', e.error);
        }
      };

      recognition.onend = () => {
        // If user finished a spoken sentence and recognition ended, auto-submit if text exists
        if (candidateAnswerRef.current.trim() && !submittingAnswer) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (candidateAnswerRef.current.trim()) {
              handleNextQuestion(candidateAnswerRef.current.trim());
            }
          }, 600);
        } else if (step === 5 && !submittingAnswer) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not start Web Speech Recognition:', err);
    }
  };

  const stopVoiceRecognition = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Submit Answer & Move Next
  // ---------------------------------------------------------------------------
  const handleNextQuestion = async (overrideText?: string) => {
    const textToSubmit = (overrideText || candidateAnswerRef.current || candidateAnswer).trim();
    if (!textToSubmit) {
      showToast('Please speak or type your answer before proceeding.', 'error');
      return;
    }

    if (!interviewSession) return;
    stopVoiceRecognition();
    setSubmittingAnswer(true);
    setAiState('processing');

    const currentQ = interviewSession.questions[currentQuestionIdx];

    try {
      await aiInterviewAPI.submitAnswer(interviewSession._id, {
        questionId: currentQ.id,
        question: currentQ.question,
        answerText: textToSubmit
      });

      const nextIdx = currentQuestionIdx + 1;
      candidateAnswerRef.current = '';
      setCandidateAnswer('');

      if (nextIdx < interviewSession.questions.length) {
        setCurrentQuestionIdx(nextIdx);
        setSubmittingAnswer(false);
        const nextQ = interviewSession.questions[nextIdx];
        speakQuestion(nextQ.question);
      } else {
        finishInterview();
      }
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      showToast('Error saving answer. Please try again.', 'error');
      setSubmittingAnswer(false);
      setAiState('listening');
    }
  };

  // ---------------------------------------------------------------------------
  // Finish & Evaluate Interview
  // ---------------------------------------------------------------------------
  const finishInterview = async () => {
    if (!interviewSession) return;
    setCompleting(true);
    setAiState('processing');

    const closingSpeech = 'Thank you for completing the interview. Your responses have been recorded and will be evaluated as part of your application.';
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(closingSpeech));
    }

    try {
      const res = await aiInterviewAPI.complete(interviewSession._id);
      if (res?.success && res.data) {
        setInterviewResult(res.data.result);
        setStep(6);
      } else {
        setStep(6);
      }
    } catch (err) {
      console.error('Error completing interview:', err);
      setStep(6);
    } finally {
      setCompleting(false);
      stopMediaStream();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-primary, #090A0F)',
      color: 'var(--text-primary, #FFFFFF)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Standard App Navbar */}
      <Navbar />



      {/* Main Full Screen Canvas */}
      <main style={{
        flex: 1,
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '40px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 160px)'
      }}>
        {/* Minimalist Tree-Line Stepper */}
        {step <= 4 && (
          <div style={{
            maxWidth: '540px',
            margin: '0 auto 48px',
            width: '100%',
            position: 'relative'
          }}>
            {/* Background Connector Line */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '20px',
              right: '20px',
              height: '2px',
              background: 'var(--border-color, rgba(255,255,255,0.1))',
              zIndex: 1
            }} />

            {/* Active Progress Connector Line */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '20px',
              width: step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%',
              height: '2px',
              background: 'var(--primary, #FD6730)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 2
            }} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 3
            }}>
              {[
                { id: 1, label: 'Microphone' },
                { id: 2, label: 'Audio Check' },
                { id: 3, label: 'Camera Check' },
                { id: 4, label: 'Guidelines' }
              ].map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => { if (isDone) setStep(s.id); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: isDone ? 'pointer' : 'default'
                    }}
                  >
                    {/* Stepper Node Circle */}
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: isActive
                        ? 'var(--primary, #FD6730)'
                        : isDone
                        ? '#10B981'
                        : 'var(--bg-primary, #090A0F)',
                      border: isActive
                        ? '3px solid rgba(253,103,48,0.3)'
                        : isDone
                        ? '2px solid #10B981'
                        : '2px solid var(--border-color, rgba(255,255,255,0.15))',
                      color: isActive || isDone ? '#FFFFFF' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 15px rgba(253,103,48,0.4)' : 'none'
                    }}>
                      {isDone ? <Check size={14} /> : s.id}
                    </div>

                    {/* Step Label */}
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 800 : isDone ? 600 : 500,
                      color: isActive ? 'var(--primary, #FD6730)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                      marginTop: '8px',
                      transition: 'color 0.3s ease'
                    }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 1: MICROPHONE TEST ================= */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px 0',
              borderRadius: '0px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(253,103,48,0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Mic size={26} />
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Microphone Verification
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.45 }}>
                Ensure your microphone is active and capturing sound clearly.
              </p>

              {!micPermission ? (
                <button
                  onClick={testMicrophone}
                  className="btn-primary"
                  style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem' }}
                >
                  Enable Microphone Access
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
                  
                  {/* Minimalist Live Equalizer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    height: '28px',
                    padding: '8px 16px'
                  }}>
                    {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5].map((multiplier, i) => {
                      const h = Math.max(4, Math.min(28, Math.round(audioLevel * multiplier)));
                      return (
                        <div
                          key={i}
                          style={{
                            width: '4px',
                            height: `${h}px`,
                            borderRadius: '2px',
                            background: audioLevel > 10 ? 'var(--primary, #FD6730)' : 'rgba(255,255,255,0.2)',
                            transition: 'height 0.1s ease',
                            opacity: audioLevel > 10 ? 1 : 0.4
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Clean Test Phrase */}
                  <div style={{ textAlign: 'center', margin: '4px 0' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Speak this test phrase:
                    </span>
                    <span style={{ fontSize: '0.92rem', color: 'var(--primary, #FD6730)', fontWeight: 600, fontStyle: 'italic' }}>
                      "I am ready for my Connecta interview."
                    </span>
                  </div>

                  {micVerified ? (
                    <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={15} /> Microphone detected ✓
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Listening...
                    </span>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    disabled={!micVerified}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      opacity: micVerified ? 1 : 0.5,
                      cursor: micVerified ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    Continue to Audio Check <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: SPEAKER TEST ================= */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px 0',
              borderRadius: '0px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(253,103,48,0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Volume2 size={26} />
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Audio Output Verification
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.45 }}>
                Play the AI voice test sample below to confirm your audio output is working clearly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={playTestAudio}
                  disabled={isPlayingTestAudio}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(253,103,48,0.3)',
                    background: 'rgba(253,103,48,0.08)',
                    color: 'var(--primary, #FD6730)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isPlayingTestAudio ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  {isPlayingTestAudio ? 'Playing AI Voice Sample...' : 'Play Test Audio'}
                </button>

                <div style={{ width: '100%', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                    Can you hear the audio sample clearly?
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => { setSpeakerVerified(true); setStep(3); }}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700 }}
                    >
                      Yes, I can hear it
                    </button>
                    <button
                      onClick={() => showToast('Please check your speaker volume or output settings.', 'info')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      No, I can't hear it
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: CAMERA CHECK ================= */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px 0',
              borderRadius: '0px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(253,103,48,0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Video size={26} />
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Camera Framing Preview
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.45 }}>
                Ensure your camera is positioned comfortably before entering the interview stage.
              </p>

              {/* Minimal Video Preview */}
              <div style={{
                width: '100%',
                height: '210px',
                background: '#090A0F',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '20px',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {cameraPermission === true && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    color: '#10B981',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} /> Live Feed
                  </div>
                )}
                {cameraPermission === false && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '20px'
                  }}>
                    <VideoOff size={28} style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.78rem' }}>Camera optional. Voice interview will proceed cleanly.</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(4)}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Proceed to Guidelines <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 4: GUIDELINES & PREPARATION ================= */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px 0',
              borderRadius: '0px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(253,103,48,0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Bot size={26} />
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                You're Ready for Your AI Interview
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.45 }}>
                Review session details before launching the interview.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Session Overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    10 Contextual Questions
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    ~10 Minutes Duration
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    Voice & Text Supported
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    Client Encrypted Results
                  </div>
                </div>
              </div>

              <button
                onClick={prepareInterviewSession}
                disabled={loadingInterview}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {loadingInterview ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {loadingInterview ? 'Initializing Session...' : 'Start AI Interview'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 5: INTERVIEW SESSION ================= */}
        {step === 5 && interviewSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px 0',
              borderRadius: '0px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Prominent Centered AI Avatar Character Header */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '16px 0 8px',
              gap: '12px'
            }}>
              {/* Dynamic Animated AI Humanoid Character Avatar - Large Centered */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: aiState === 'speaking'
                  ? 'linear-gradient(135deg, #FD6730, #FF8C00)'
                  : aiState === 'processing'
                  ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                  : 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: aiState === 'listening' ? 'rotate(-5deg) scale(1)' : aiState === 'speaking' ? 'scale(1.08)' : 'scale(1)',
                boxShadow: aiState === 'speaking'
                  ? '0 0 40px rgba(253,103,48,0.6)'
                  : aiState === 'processing'
                  ? '0 0 40px rgba(139,92,246,0.6)'
                  : '0 0 25px rgba(16,185,129,0.35)',
                position: 'relative',
                margin: '0 auto'
              }}>
                {/* Humanoid Head Face SVG - Scaled larger */}
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {/* Head contour */}
                  <path d="M12 2a7 7 0 0 0-7 7c0 4.5 3 7.5 7 11 4-3.5 7-6.5 7-11a7 7 0 0 0-7-7z" />
                  
                  {/* Eyes - Animated expressions */}
                  {aiState === 'processing' ? (
                    <>
                      <line x1="8.5" y1="9" x2="10.5" y2="9" strokeWidth="2" />
                      <line x1="13.5" y1="9" x2="15.5" y2="9" strokeWidth="2" />
                    </>
                  ) : (
                    <>
                      <circle cx="9.5" cy="8.5" r="1.2" fill="#FFFFFF" />
                      <circle cx="14.5" cy="8.5" r="1.2" fill="#FFFFFF" />
                    </>
                  )}

                  {/* Mouth Expression - Animated wave when speaking, curve when listening, line when thinking */}
                  {aiState === 'speaking' ? (
                    <path d="M9 13c1 1.8 4 1.8 6 0" strokeWidth="2.4" />
                  ) : aiState === 'processing' ? (
                    <line x1="9.5" y1="13" x2="14.5" y2="13" strokeWidth="2" />
                  ) : (
                    <path d="M9.5 12.5c1.5 1.2 3.5 1.2 5 0" strokeWidth="2" />
                  )}
                </svg>

                {/* Dynamic Speech Wave Ping Indicator when Speaking */}
                {aiState === 'speaking' && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }} />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                {jobInfo?.title && (
                  <span style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    letterSpacing: '-0.01em'
                  }}>
                    {jobInfo.title}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: aiState === 'speaking' ? 'rgba(253,103,48,0.15)' : aiState === 'processing' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
                    color: aiState === 'speaking' ? 'var(--primary, #FD6730)' : aiState === 'processing' ? '#8B5CF6' : '#10B981'
                  }}>
                    {aiState === 'speaking' ? 'Speaking...' : aiState === 'processing' ? 'Thinking & Evaluating...' : 'Leaning & Listening'}
                  </span>
                </div>
              </div>
            </div>

            {/* Minimal Progress Track Line */}
            <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((currentQuestionIdx + 1) / (interviewSession.questions?.length || 10)) * 100}%`,
                  height: '100%',
                  background: 'var(--primary, #FD6730)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            {/* Main Stage Spoken Response Box & Auto-submit / Manual Submit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '12px' }}>

              {/* Minimalist Response Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Spoken / Transcribed Response:
                  </span>
                </div>

                <textarea
                  rows={4}
                  placeholder="Speak into your microphone... Spoken answers auto-transcribe here."
                  value={candidateAnswer}
                  onChange={(e) => {
                    setCandidateAnswer(e.target.value);
                    candidateAnswerRef.current = e.target.value;
                  }}
                  className="input-field"
                  style={{
                    width: '100%',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mic size={14} color={aiState === 'listening' ? '#10B981' : 'var(--text-muted)'} />
                    {aiState === 'listening' ? (
                      <span style={{ color: '#10B981', fontWeight: 600 }}>
                        Auto-submits 3s after pause...
                      </span>
                    ) : (
                      'Evaluating response...'
                    )}
                  </div>

                  {/* Minimal Manual Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleNextQuestion()}
                    disabled={!candidateAnswer.trim() || submittingAnswer}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      background: candidateAnswer.trim() ? 'var(--primary, #FD6730)' : 'rgba(255,255,255,0.05)',
                      color: candidateAnswer.trim() ? '#FFFFFF' : 'var(--text-muted)',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: candidateAnswer.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {submittingAnswer ? 'Submitting...' : 'Submit Response'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Picture-in-Picture Live Candidate Camera Feed (Bottom Right) */}
            {stream && (
              <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '180px',
                height: '120px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#090A0F',
                border: '2px solid var(--border-color, rgba(255,255,255,0.15))',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                zIndex: 99,
                transition: 'all 0.3s ease'
              }}>
                <video
                  ref={(el) => {
                    if (el && stream) el.srcObject = stream;
                  }}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '6px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(4px)',
                  color: '#10B981',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} /> You (Live)
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ================= STEP 6: COMPLETION ================= */}
        {step === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '40px 32px',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid rgba(16,185,129,0.2)'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Interview Completed ✓
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>
                Your responses have been recorded and evaluated for <strong>{jobInfo?.title || 'this role'}</strong>.
              </p>

              {interviewResult && (
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '22px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '28px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="var(--primary)" /> Performance Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{interviewResult.score}/100</div>
                    </div>
                    <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tech Fit</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>{interviewResult.technicalFit}%</div>
                    </div>
                    <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Comm.</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{interviewResult.communicationScore}%</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    {interviewResult.summary}
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate('/proposals')}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '14px', fontWeight: 800, fontSize: '0.92rem' }}
              >
                Return to My Proposals
              </button>
            </div>
          </motion.div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default AiInterviewPage;

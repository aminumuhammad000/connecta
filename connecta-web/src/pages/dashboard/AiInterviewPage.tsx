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

          // Reset silence timer every time user speaks (5 seconds pause threshold)
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          
          silenceTimerRef.current = setTimeout(() => {
            if (candidateAnswerRef.current.trim()) {
              handleNextQuestion(candidateAnswerRef.current.trim());
            }
          }, 5000);
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
              maxWidth: '680px',
              margin: '0 auto',
              width: '100%'
            }}
          >
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Before starting the interview
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
                Please note that this interview will take <strong>~10 minutes</strong> with contextual AI questions. You will answer by speaking naturally into your microphone. Ensure you're in a quiet spot with a stable internet connection.
              </p>

              {/* Topics & Skills Box (Micro1 style) */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  You will be interviewed on these topics ({jobInfo?.title || 'Selected Role'})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(jobInfo?.skillsRequired?.length ? jobInfo.skillsRequired : [
                    'Role & Experience Overview',
                    'Technical & Design Problem Solving',
                    'Workflow & Collaboration Mindset',
                    'Custom Questions defined for this job'
                  ]).map((topic: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: 'rgba(253,103,48,0.08)',
                        border: '1px solid rgba(253,103,48,0.2)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary, #FD6730)' }} />
                      {topic}
                    </div>
                  ))}
                </div>
              </div>

              {/* Guidelines Rules Card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '28px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55
              }}>
                <div><strong>1. Response Recording:</strong> Your spoken responses will be automatically recorded and evaluated for the hiring client.</div>
                <div><strong>2. Quiet & Focused Environment:</strong> Please remain on this tab during the interview for optimal speech recognition.</div>
                <div><strong>3. Automatic Submission:</strong> A 5-second pause in your speech indicates to Connecta AI that you've completed your response.</div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Please don't refresh the page during the interview.
              </p>

              <button
                onClick={prepareInterviewSession}
                disabled={loadingInterview}
                className="btn-primary"
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                {loadingInterview ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                {loadingInterview ? 'Initializing Session...' : 'Sounds good, start interview'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 5: INTERVIEW SESSION ================= */}
        {step === 5 && interviewSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '10px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative'
            }}
          >
            {/* Top Bar: Minimal Question Topic Pills (Micro1 style) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              margin: '0 auto 10px',
              maxWidth: '700px'
            }}>
              {interviewSession.questions?.map((q: any, idx: number) => {
                const isActive = idx === currentQuestionIdx;
                const isPast = idx < currentQuestionIdx;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '12px',
                      background: isActive
                        ? 'rgba(253,103,48,0.18)'
                        : isPast
                        ? 'rgba(16,185,129,0.12)'
                        : 'rgba(255,255,255,0.03)',
                      border: isActive
                        ? '1px solid var(--primary, #FD6730)'
                        : isPast
                        ? '1px solid rgba(16,185,129,0.3)'
                        : '1px solid var(--border-color, rgba(255,255,255,0.08))',
                      color: isActive
                        ? 'var(--primary, #FD6730)'
                        : isPast
                        ? '#10B981'
                        : 'var(--text-muted)',
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 800 : 600,
                      transition: 'all 0.3s ease',
                      maxWidth: '130px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {q.category || `Question ${idx + 1}`}
                  </div>
                );
              })}
            </div>

            {/* Main Stage: Centered Micro1 Orb + Right Transcript Box */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '30px',
              alignItems: 'center',
              minHeight: '380px'
            }}>
              {/* Left Column: Prominent Centered AI Orb */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: aiState === 'speaking'
                    ? 'radial-gradient(circle, #FD6730 0%, #FF8C00 60%, rgba(253,103,48,0.2) 100%)'
                    : aiState === 'processing'
                    ? 'radial-gradient(circle, #8B5CF6 0%, #EC4899 60%, rgba(139,92,246,0.2) 100%)'
                    : 'radial-gradient(circle, #10B981 0%, #059669 60%, rgba(16,185,129,0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: aiState === 'listening' ? 'scale(1)' : aiState === 'speaking' ? 'scale(1.08)' : 'scale(0.96)',
                  boxShadow: aiState === 'speaking'
                    ? '0 0 60px rgba(253,103,48,0.55)'
                    : aiState === 'processing'
                    ? '0 0 60px rgba(139,92,246,0.55)'
                    : '0 0 35px rgba(16,185,129,0.3)',
                  position: 'relative'
                }}>
                  {/* Inner Glowing Core Avatar (Micro1 'm.' style for Connecta) */}
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#090A0F',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }}>
                    c.
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginTop: '16px',
                  padding: '4px 14px',
                  borderRadius: '12px',
                  background: aiState === 'speaking' ? 'rgba(253,103,48,0.15)' : aiState === 'processing' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
                  color: aiState === 'speaking' ? 'var(--primary, #FD6730)' : aiState === 'processing' ? '#8B5CF6' : '#10B981'
                }}>
                  {aiState === 'speaking' ? 'Connecta AI Speaking...' : aiState === 'processing' ? 'Thinking & Evaluating...' : 'Listening to Candidate...'}
                </span>
              </div>

              {/* Right Column: Micro1 Floating AI Prompt + Candidate Speech Card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: '20px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                  {interviewSession.questions[currentQuestionIdx]?.question}
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: candidateAnswer ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: candidateAnswer ? '#10B981' : 'var(--primary, #FD6730)',
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }} />
                  <span style={{ fontSize: '0.78rem', color: candidateAnswer ? '#10B981' : 'var(--text-muted)', fontWeight: 600 }}>
                    {candidateAnswer ? 'Recording spoken response...' : 'Listening for response...'}
                  </span>
                </div>

                {candidateAnswer && (
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    lineHeight: 1.45,
                    maxHeight: '100px',
                    overflowY: 'auto'
                  }}>
                    "{candidateAnswer}"
                  </div>
                )}
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

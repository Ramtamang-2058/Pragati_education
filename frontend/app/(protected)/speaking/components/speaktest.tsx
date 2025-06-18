import React, { useRef, useState, useEffect } from "react";

interface SpeakTestProps {
  selectedTopic: string;
  firstIntroQuestion?: string;
  onBack: () => void;
}

const VoiceWaveform = ({ listening }: { listening: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!listening) {
      // Clear canvas when not listening
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      // Stop audio context and stream
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      cancelAnimationFrame(animationRef.current!);
      return;
    }

    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;
    let source: MediaStreamAudioSourceNode;

    const setup = async () => {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      dataArrayRef.current = dataArray;

      draw();
    };

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      const WIDTH = canvasRef.current.width;
      const HEIGHT = canvasRef.current.height;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const barWidth = WIDTH / dataArrayRef.current.length;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const value = dataArrayRef.current[i];
        const barHeight = (value / 255) * HEIGHT;
        ctx.fillStyle = "#4B5563"; // Tailwind gray-700
        ctx.fillRect(
          i * barWidth + barWidth * 0.2,
          HEIGHT - barHeight,
          barWidth * 0.6,
          barHeight
        );
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    setup();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      cancelAnimationFrame(animationRef.current!);
    };
  }, [listening]);

  return (
    <div className="flex justify-center items-center my-4">
      <canvas
        ref={canvasRef}
        width={220}
        height={60}
        style={{
          background: "transparent",
          display: listening ? "block" : "none",
        }}
      />
    </div>
  );
};

const SpeakTest = ({ selectedTopic, firstIntroQuestion, onBack }: SpeakTestProps) => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Add a simple speech-to-text box for manual input as a fallback
  const [manualTranscript, setManualTranscript] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        // @ts-ignore
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        if (!recognitionRef.current) {
          const recognition = new SpeechRecognition();
          // Try to improve accuracy:
          recognition.lang = "en-IN"; // You can try "en-GB" or "en-IN" for Indian accents, or "en" for general
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 10; // Allow more alternatives for better matching

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let liveTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
              // Choose the best alternative with highest confidence
              const alternatives = event.results[i];
              let best = alternatives[0];
              for (let j = 1; j < alternatives.length; j++) {
                if (alternatives[j].confidence > best.confidence) {
                  best = alternatives[j];
                }
              }
              liveTranscript += best.transcript + " ";
            }
            setTranscript(liveTranscript.trim());
          };
          recognition.onerror = () => {
            setListening(false);
          };
          recognition.onend = () => {
            setListening(false);
          };

          recognitionRef.current = recognition;
        }
      } else {
        setSpeechSupported(false);
      }
    }
    // Cleanup on unmount
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  // Web Speech API: Text-to-Speech
  const handleListen = () => {
    if (!firstIntroQuestion) return;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new window.SpeechSynthesisUtterance(firstIntroQuestion);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start/stop using the persistent recognition instance and record audio
  const handleStartRecording = async () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    setTranscript("");
    setListening(true);
    setAudioUrl(null);

    // Start speech recognition
    recognitionRef.current.start();

    // Start audio recording
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioUrl(URL.createObjectURL(audioBlob));
          // Clean up stream
          stream.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
      } catch (err) {
        // fallback: just speech recognition
      }
    }
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
    setListening(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  // Split transcript into words for "voice typing" effect
  const transcriptWords = transcript ? transcript.split(/\s+/).filter(Boolean) : [];

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-4">
      <div className="mb-4">
        <div className="text-md text-gray-600 mb-1">
          Topic: <span className="font-semibold text-gray-900">{selectedTopic}</span>
        </div>
        {firstIntroQuestion && (
          <div className="text-lg text-gray-800 mb-6">{firstIntroQuestion}</div>
        )}
        {/* Voice waveform animation */}
        {listening && <VoiceWaveform listening={listening} />}
        {/* Show every word as soon as it is detected */}
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 min-h-[40px]">
          <div className="text-sm text-gray-700 font-semibold mb-1">Your Answer (Voice Typing):</div>
          <div className="flex flex-wrap gap-1 text-gray-900">
            {transcriptWords.map((word, idx) => (
              <span
                key={idx}
                className="inline-block px-1 py-0.5 bg-blue-100 rounded text-base"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
        {/* Audio replay */}
        {audioUrl && (
          <div className="mt-4 flex items-center gap-2">
            <audio controls src={audioUrl} />
            <span className="text-xs text-gray-500">Replay your answer</span>
          </div>
        )}
        {/* Manual speech-to-text fallback */}
        {!speechSupported && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Speech-to-Text (type your answer):
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              value={manualTranscript}
              onChange={e => setManualTranscript(e.target.value)}
              placeholder="Type your answer here..."
            />
          </div>
        )}
      </div>
      <div className="flex gap-4 mb-2">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-200 hover:bg-gray-200"
          onClick={handleListen}
        >
          <span role="img" aria-label="listen">🔊</span>
          Listen
        </button>
      </div>
      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border ${
          listening
            ? "bg-blue-200 text-blue-900 border-blue-300"
            : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
        } ${!speechSupported ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={
          !speechSupported
            ? undefined
            : listening
            ? handleStopRecording
            : handleStartRecording
        }
        disabled={!speechSupported}
      >
        <span role="img" aria-label="mic">🎤</span>
        {listening ? "Stop Recording" : "Start Recording"}
      </button>
      {!speechSupported && (
        <div className="mt-4 text-sm text-red-500">
          Speech recognition is not supported in this browser.<br />
          Please use Google Chrome or Microsoft Edge for this feature.
        </div>
      )}
      <div className="mt-8">
        <button
          className="text-sm text-gray-500 underline"
          onClick={onBack}
        >
          ← Back to topics
        </button>
      </div>
    </div>
  );
};

export default SpeakTest;
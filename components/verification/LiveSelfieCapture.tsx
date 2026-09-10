"use client";

import { useEffect, useRef, useState } from "react";

import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface LiveSelfieCaptureProps {
  onCapture?: (imageData: string) => void;
  onCancel?: () => void;
}

type VerificationState =
  | "loading"
  | "no-face"
  | "position"
  | "blink"
  | "steady"
  | "countdown"
  | "captured"
  | "error";

export default function LiveSelfieCapture({
  onCapture,
  onCancel,
}: LiveSelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const countdownTimerRef = useRef<number | null>(null);

  const lastVideoTimeRef = useRef(-1);

  const blinkDetectedRef = useRef(false);

  const countdownStartedRef = useRef(false);

  // =====================================
  // Steady Face Tracking
  // =====================================

  const lastFaceCenterRef = useRef<{ x: number; y: number } | null>(null);

  const lastFaceSizeRef = useRef<{ width: number; height: number } | null>(
    null,
  );

  const steadyStartTimeRef = useRef<number | null>(null);

  // =====================================
  // State
  // =====================================

  const [state, setState] = useState<VerificationState>("loading");

  const [message, setMessage] = useState("Starting camera...");

  const [countdown, setCountdown] = useState<number | null>(null);

  const [error, setError] = useState("");

  // =====================================
  // Start Camera
  // =====================================

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        setState("loading");
        setMessage("Starting camera...");

        // =====================================
        // Camera Permission
        // =====================================

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },
          },

          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;

        if (!video) {
          throw new Error("Video element not available.");
        }

        video.srcObject = stream;

        await video.play();

        // =====================================
        // Load MediaPipe
        // =====================================

        setMessage("Loading face detection...");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },

          runningMode: "VIDEO",

          numFaces: 1,

          minFaceDetectionConfidence: 0.6,

          minFacePresenceConfidence: 0.6,

          minTrackingConfidence: 0.6,

          outputFaceBlendshapes: true,
        });

        if (!mounted) {
          faceLandmarker.close();

          return;
        }

        faceLandmarkerRef.current = faceLandmarker;

        setState("no-face");

        setMessage("Position your face inside the frame.");

        detectFace();
      } catch (err) {
        console.error("LIVE SELFIE CAMERA ERROR:", err);

        if (!mounted) return;

        setState("error");

        const errorName = err instanceof DOMException ? err.name : "";

        if (errorName === "NotAllowedError") {
          setError(
            "Camera permission was denied. Please allow camera access and try again.",
          );
        } else if (errorName === "NotFoundError") {
          setError("No camera was found on this device.");
        } else if (errorName === "NotReadableError") {
          setError("Camera is already being used by another application.");
        } else if (errorName === "OverconstrainedError") {
          setError("This camera does not support the requested settings.");
        } else {
          setError(
            `Verification camera/face detection failed: ${
              err instanceof Error ? err.message : "Unknown error"
            }`,
          );
        }
      }
    }

    startCamera();

    // =====================================
    // Cleanup
    // =====================================

    return () => {
      mounted = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();

        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  // =====================================
  // Reset Countdown
  // =====================================

  function resetCountdown() {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);

      countdownTimerRef.current = null;
    }

    countdownStartedRef.current = false;

    setCountdown(null);

    steadyStartTimeRef.current = null;

    lastFaceCenterRef.current = null;

    lastFaceSizeRef.current = null;
  }

  // =====================================
  // Face Detection Loop
  // =====================================

  function detectFace() {
    const video = videoRef.current;

    const landmarker = faceLandmarkerRef.current;

    if (!video || !landmarker) {
      animationFrameRef.current = requestAnimationFrame(detectFace);

      return;
    }

    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectFace);

      return;
    }

    if (video.currentTime === lastVideoTimeRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFace);

      return;
    }

    lastVideoTimeRef.current = video.currentTime;

    try {
      const result = landmarker.detectForVideo(video, performance.now());

      const faces = result.faceLandmarks;

      // =====================================
      // No Face
      // =====================================

      if (!faces || faces.length === 0) {
        if (countdownStartedRef.current) {
          resetCountdown();
        }

        blinkDetectedRef.current = false;

        setState("no-face");

        setMessage("No face detected. Please look at the camera.");

        animationFrameRef.current = requestAnimationFrame(detectFace);

        return;
      }

      const face = faces[0];

      // =====================================
      // Face Bounding Box
      // =====================================

      const xs = face.map((point) => point.x);

      const ys = face.map((point) => point.y);

      const minX = Math.min(...xs);

      const maxX = Math.max(...xs);

      const minY = Math.min(...ys);

      const maxY = Math.max(...ys);

      const faceWidth = maxX - minX;

      const faceHeight = maxY - minY;

      const faceCenterX = (minX + maxX) / 2;

      const faceCenterY = (minY + maxY) / 2;

      // =====================================
      // Face Position
      // =====================================

      const insideHorizontal = faceCenterX > 0.35 && faceCenterX < 0.65;

      const insideVertical = faceCenterY > 0.35 && faceCenterY < 0.65;

      const correctSize =
        faceWidth > 0.25 &&
        faceWidth < 0.65 &&
        faceHeight > 0.25 &&
        faceHeight < 0.75;

      // =====================================
      // Invalid Position
      // =====================================

      if (!insideHorizontal || !insideVertical || !correctSize) {
        if (countdownStartedRef.current) {
          resetCountdown();
        }

        steadyStartTimeRef.current = null;

        lastFaceCenterRef.current = null;

        lastFaceSizeRef.current = null;

        if (faceWidth < 0.25) {
          setMessage("Move a little closer to the camera.");
        } else if (faceWidth > 0.65) {
          setMessage("Move a little farther from the camera.");
        } else if (!insideHorizontal) {
          setMessage("Move your face to the center.");
        } else {
          setMessage("Adjust your face inside the frame.");
        }

        setState("position");

        animationFrameRef.current = requestAnimationFrame(detectFace);

        return;
      }

      // =====================================
      // Blink Detection
      // =====================================

      const blendshapes = result.faceBlendshapes?.[0]?.categories;

      let leftEyeBlink = 0;

      let rightEyeBlink = 0;

      if (blendshapes) {
        for (const shape of blendshapes) {
          if (shape.categoryName === "eyeBlinkLeft") {
            leftEyeBlink = shape.score;
          }

          if (shape.categoryName === "eyeBlinkRight") {
            rightEyeBlink = shape.score;
          }
        }
      }

      const blinkDetected = leftEyeBlink > 0.45 && rightEyeBlink > 0.45;

      // =====================================
      // Blink Successfully Detected
      // =====================================

      if (blinkDetected && !blinkDetectedRef.current) {
        blinkDetectedRef.current = true;

        steadyStartTimeRef.current = null;

        lastFaceCenterRef.current = null;

        lastFaceSizeRef.current = null;

        setState("steady");

        setMessage("Blink detected. Keep your face steady.");
      }

      // =====================================
      // Before Blink
      // =====================================

      if (!blinkDetectedRef.current && !countdownStartedRef.current) {
        setState("blink");

        setMessage("Face detected. Please blink once.");

        animationFrameRef.current = requestAnimationFrame(detectFace);

        return;
      }

      // =====================================
      // Steady Face Check
      // =====================================

      if (blinkDetectedRef.current && !countdownStartedRef.current) {
        const currentCenter = {
          x: faceCenterX,
          y: faceCenterY,
        };

        const currentSize = {
          width: faceWidth,
          height: faceHeight,
        };

        // First stable frame
        if (!lastFaceCenterRef.current || !lastFaceSizeRef.current) {
          lastFaceCenterRef.current = currentCenter;

          lastFaceSizeRef.current = currentSize;

          steadyStartTimeRef.current = performance.now();

          setState("steady");

          setMessage("Keep your face steady...");
        } else {
          const centerMovement = Math.sqrt(
            Math.pow(currentCenter.x - lastFaceCenterRef.current.x, 2) +
              Math.pow(currentCenter.y - lastFaceCenterRef.current.y, 2),
          );

          const widthMovement = Math.abs(
            currentSize.width - lastFaceSizeRef.current.width,
          );

          const heightMovement = Math.abs(
            currentSize.height - lastFaceSizeRef.current.height,
          );

          // =====================================
          // Movement Threshold
          // =====================================

          const faceIsStable =
            centerMovement < 0.015 &&
            widthMovement < 0.025 &&
            heightMovement < 0.025;

          if (!faceIsStable) {
            // Face moved
            steadyStartTimeRef.current = null;

            lastFaceCenterRef.current = currentCenter;

            lastFaceSizeRef.current = currentSize;

            setState("steady");

            setMessage("Please keep your face completely steady.");
          } else {
            // =====================================
            // Face is Stable
            // =====================================

            if (!steadyStartTimeRef.current) {
              steadyStartTimeRef.current = performance.now();
            }

            const steadyDuration =
              performance.now() - steadyStartTimeRef.current;

            // Need 800ms stable before countdown
            if (steadyDuration >= 800) {
              setMessage("Perfect. Stay steady.");

              startCountdown();
            } else {
              setState("steady");

              setMessage("Good. Keep your face steady...");
            }

            lastFaceCenterRef.current = currentCenter;

            lastFaceSizeRef.current = currentSize;
          }
        }
      }
    } catch (err) {
      console.error("FACE DETECTION ERROR:", err);
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  }

  // =====================================
  // Countdown
  // =====================================

  function startCountdown() {
    if (countdownStartedRef.current) {
      return;
    }

    countdownStartedRef.current = true;

    setState("countdown");

    let current = 5;

    setCountdown(current);

    setMessage("Stay completely still.");

    countdownTimerRef.current = window.setInterval(() => {
      current -= 1;

      if (current <= 0) {
        if (countdownTimerRef.current) {
          window.clearInterval(countdownTimerRef.current);

          countdownTimerRef.current = null;
        }

        setCountdown(null);

        captureSelfie();

        return;
      }

      setCountdown(current);
    }, 1000);
  }

  // =====================================
  // Capture Selfie
  // =====================================

  function captureSelfie() {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    const width = video.videoWidth;

    const height = video.videoHeight;

    if (width === 0 || height === 0) {
      setState("error");

      setError("Camera image could not be captured. Please try again.");

      return;
    }

    canvas.width = width;

    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    // =====================================
    // Mirror Image
    // =====================================

    context.save();

    context.translate(width, 0);

    context.scale(-1, 1);

    context.drawImage(video, 0, 0, width, height);

    context.restore();

    // =====================================
    // Convert to JPEG
    // =====================================

    const imageData = canvas.toDataURL("image/jpeg", 0.9);

    // =====================================
    // Captured
    // =====================================

    setState("captured");

    setMessage("Live selfie captured successfully.");

    // =====================================
    // Stop Camera
    // =====================================

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // =====================================
    // Send to Parent
    // =====================================

    onCapture?.(imageData);
  }

  // =====================================
  // Render
  // =====================================

  const statusLabel =
    state === "loading"
      ? "Preparing camera"
      : state === "no-face"
        ? "Looking for your face"
        : state === "position"
          ? "Adjust your position"
          : state === "blink"
            ? "Liveness check"
            : state === "steady"
              ? "Keep still"
              : state === "countdown"
                ? "Capturing"
                : state === "captured"
                  ? "Selfie captured"
                  : "Verification error";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#07111f] shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-[#050b16]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                Live verification
              </p>
              <h3 className="mt-1 text-sm font-black text-white sm:text-base">
                Keep your face inside the guide
              </h3>
            </div>

            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-video">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            aria-label="Live selfie camera"
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            Camera active
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`relative h-[70%] w-[52%] max-w-[320px] rounded-[50%] border-[3px] transition-all duration-300 sm:w-[38%] ${
                state === "countdown"
                  ? "border-green-400 shadow-[0_0_35px_rgba(74,222,128,0.65)]"
                  : state === "captured"
                    ? "border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.55)]"
                    : state === "steady"
                      ? "border-yellow-300 shadow-[0_0_24px_rgba(253,224,71,0.3)]"
                      : state === "error"
                        ? "border-red-400"
                        : "border-white/85"
              }`}
            >
              <span className="absolute -left-1 -top-1 h-7 w-7 rounded-tl-xl border-l-[3px] border-t-[3px] border-white" />
              <span className="absolute -right-1 -top-1 h-7 w-7 rounded-tr-xl border-r-[3px] border-t-[3px] border-white" />
              <span className="absolute -bottom-1 -left-1 h-7 w-7 rounded-bl-xl border-b-[3px] border-l-[3px] border-white" />
              <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-br-xl border-b-[3px] border-r-[3px] border-white" />
            </div>
          </div>

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-black/65 text-6xl font-black text-white shadow-2xl backdrop-blur-md sm:h-28 sm:w-28 sm:text-7xl">
                {countdown}
              </div>
            </div>
          )}

          {state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 px-5 backdrop-blur-[2px]">
              <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-center text-sm font-bold text-white shadow-2xl backdrop-blur-xl">
                {message}
              </div>
            </div>
          )}

          {state !== "loading" && state !== "error" && state !== "captured" && (
            <div className="absolute inset-x-0 bottom-4 px-4 text-center">
              <span className="inline-flex max-w-full rounded-full bg-black/55 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                {message}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div
            className={`rounded-2xl border px-4 py-3.5 ${
              state === "captured"
                ? "border-green-400/20 bg-green-500/10"
                : state === "error"
                  ? "border-red-400/20 bg-red-500/10"
                  : "border-white/10 bg-white/5"
            }`}
          >
            <p
              className={`text-center text-sm font-bold ${
                state === "captured"
                  ? "text-green-300"
                  : state === "error"
                    ? "text-red-300"
                    : "text-slate-200"
              }`}
            >
              {state === "captured" ? "✓ " : ""}
              {state === "error" ? error : message}
            </p>
          </div>

          {state === "captured" && (
            <div className="rounded-2xl border border-green-200/20 bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">
              ✓ Your live selfie is ready for seller verification.
            </div>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={() => {
                resetCountdown();

                if (streamRef.current) {
                  streamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
                }

                onCancel();
              }}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-white/25 hover:bg-white/10 active:scale-[0.99]"
            >
              Cancel Verification
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span>• Look at the camera</span>
        <span>• Blink once</span>
        <span>• Keep still during capture</span>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

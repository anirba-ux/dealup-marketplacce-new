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
            modelAssetPath: "/models/face_landmarker.task",
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

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl">
        {/* ================================= */}
        {/* Camera */}
        {/* ================================= */}

        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="h-full w-full object-cover"
            style={{
              transform: "scaleX(-1)",
            }}
          />

          {/* ================================= */}
          {/* Face Guide */}
          {/* ================================= */}

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`
                h-[65%]
                w-[48%]
                rounded-[50%]
                border-4
                ${
                  state === "countdown"
                    ? "border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.6)]"
                    : state === "captured"
                      ? "border-green-500"
                      : state === "steady"
                        ? "border-yellow-400"
                        : "border-white/80"
                }
              `}
            />
          </div>

          {/* ================================= */}
          {/* Countdown */}
          {/* ================================= */}

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black/60 text-7xl font-bold text-white shadow-2xl backdrop-blur">
                {countdown}
              </div>
            </div>
          )}

          {/* ================================= */}
          {/* Loading */}
          {/* ================================= */}

          {state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-xl">
                {message}
              </div>
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* Message */}
        {/* ================================= */}

        <div className="space-y-3 p-5">
          <div
            className={`
              rounded-2xl
              px-4
              py-4
              text-center
              ${
                state === "captured"
                  ? "bg-green-600"
                  : state === "countdown"
                    ? "bg-green-700"
                    : state === "error"
                      ? "bg-red-700"
                      : "bg-slate-800"
              }
            `}
          >
            <p className="text-sm font-semibold text-white">{message}</p>
          </div>

          {/* ================================= */}
          {/* Captured */}
          {/* ================================= */}

          {state === "captured" && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
              ✓ Your live selfie has been captured for seller verification.
            </div>
          )}

          {/* ================================= */}
          {/* Error */}
          {/* ================================= */}

          {state === "error" && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* Cancel */}
          {/* ================================= */}

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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ================================= */}
      {/* Hidden Canvas */}
      {/* ================================= */}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

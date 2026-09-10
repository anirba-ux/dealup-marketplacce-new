"use client";

import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Laptop,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import LiveSelfieCapture from "./LiveSelfieCapture";

interface LocationVerificationCardProps {
  verified: boolean;
  selfieVerified?: boolean;
}

type Mode = "desktop" | "mobile" | null;

export default function LocationVerificationCard({
  verified,
}: LocationVerificationCardProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [mobileUrl, setMobileUrl] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [locationVerified, setLocationVerified] = useState(verified);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRef = useRef<string>("");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMobileDevice(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    setLocationVerified(verified);
  }, [verified]);

  useEffect(() => {
    setSelfieVerified(selfieVerified);
  }, [selfieVerified]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  function extractToken(url: string): string {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || "";
    } catch {
      return "";
    }
  }

  async function createSession() {
    const response = await fetch("/api/location-verification/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.message || "Unable to start verification.");
    }
    const newToken = String(data.token || extractToken(String(data.mobileUrl || "")));
    if (!newToken) throw new Error("Verification token was not generated.");
    return { ...data, token: newToken };
  }

  async function startMode(selectedMode: Exclude<Mode, null>) {
    try {
      // IMPORTANT: create the session before mounting LiveSelfieCapture.
      // Otherwise the selfie callback can fire while token is still empty.
      setLoading(true);
      setError("");
      setMessage("");
      setCopied(false);
      setSelfieVerified(false);
      setLocationVerified(false);
      setAccuracy(null);

      const data = await createSession();

      // Store the token immediately in both ref and state.
      tokenRef.current = data.token;
      setToken(data.token);
      setMobileUrl(String(data.mobileUrl || ""));

      // Only mount the camera/QR flow after the session is ready.
      setMode(selectedMode);

      if (selectedMode === "mobile" && !isMobileDevice) {
        setMessage("Scan the QR code with your mobile phone to continue selfie + GPS verification.");
      } else {
        setMessage("Allow camera access and location access to complete verification.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start verification.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSelfie(imageData: string) {
    const sessionToken = tokenRef.current || token;
    if (!sessionToken) {
      setError("Verification session is missing. Please start again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("Uploading your live selfie securely...");

      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], "live-selfie.jpg", { type: blob.type || "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "verification");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData?.success || !uploadData?.image?.url) {
        throw new Error(uploadData?.message || "Selfie upload failed.");
      }

      const verifyResponse = await fetch("/api/location-verification/selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          imageUrl: uploadData.image.url,
          publicId: uploadData.image.publicId || "",
        }),
      });
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData?.success) {
        throw new Error(verifyData?.message || "Selfie verification failed.");
      }

      setSelfieVerified(true);
      setMessage("Live selfie verified. Now verifying your location...");
      await captureLocation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Selfie verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function captureLocation() {
    const sessionToken = tokenRef.current || token;
    if (!sessionToken) {
      setError("Verification session is missing. Please start again.");
      return;
    }
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }

    setMessage("Getting your precise location...");

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const gpsAccuracy = position.coords.accuracy;

            const response = await fetch("/api/location-verification/mobile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: sessionToken,
                latitude,
                longitude,
                accuracy: gpsAccuracy,
              }),
            });
            const data = await response.json();

            if (!response.ok || !data?.success) {
              throw new Error(data?.message || "Location verification failed.");
            }

            setAccuracy(gpsAccuracy);
            setLocationVerified(true);
            setMessage("Selfie and location verification completed successfully.");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Location verification failed.");
          } finally {
            resolve();
          }
        },
        (gpsError) => {
          if (gpsError.code === gpsError.PERMISSION_DENIED) {
            setError("Please allow location permission and try again.");
          } else if (gpsError.code === gpsError.POSITION_UNAVAILABLE) {
            setError("Your device could not determine an accurate location.");
          } else if (gpsError.code === gpsError.TIMEOUT) {
            setError("Location request timed out. Please try again.");
          } else {
            setError("Unable to get your location.");
          }
          resolve();
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
      );
    });
  }

  async function checkStatus() {
    const sessionToken = tokenRef.current || token;
    if (!sessionToken) return;

    try {
      setChecking(true);
      setError("");
      const response = await fetch(
        `/api/location-verification/status?token=${encodeURIComponent(sessionToken)}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to check verification status.");
      }

      setSelfieVerified(data.selfieVerified === true);
      setLocationVerified(data.locationVerified === true || data.status === "verified");

      if (data.status === "expired") {
        setError("This verification session has expired. Please start again.");
        return;
      }

      if (data.status === "verified") {
        setMessage("Selfie and location verification completed successfully.");
        if (pollingRef.current) clearInterval(pollingRef.current);
      } else {
        setMessage("Waiting for mobile verification to complete...");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check verification status.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (mode !== "mobile" || isMobileDevice || !token) return;
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => void checkStatus(), 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [mode, isMobileDevice, token]);

  async function copyUrl() {
    if (!mobileUrl) return;
    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy the verification link.");
    }
  }

  function resetSelection() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setMode(null);
    tokenRef.current = "";
    setToken("");
    setMobileUrl("");
    setMessage("");
    setError("");
    setSelfieVerified(false);
    setLocationVerified(verified);
    setAccuracy(null);
  }

  const directCameraMode = mode !== null && (mode === "desktop" || isMobileDevice);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#091526]">
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-400">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Location + Live Selfie</h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-400">Secure</span>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Choose the device you want to use. Selfie and location are verified together.</p>
          </div>
        </div>

        {(selfieVerified || locationVerified) && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className={`flex items-center gap-3 rounded-2xl border p-3.5 ${selfieVerified ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-500/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
              <CheckCircle2 className={`h-5 w-5 shrink-0 ${selfieVerified ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selfieVerified ? "Live Selfie Verified" : "Live Selfie Not Completed"}</span>
            </div>
            <div className={`flex items-center gap-3 rounded-2xl border p-3.5 ${locationVerified ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-500/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
              <CheckCircle2 className={`h-5 w-5 shrink-0 ${locationVerified ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{locationVerified ? "Location Verified" : "Location Not Completed"}</span>
            </div>
          </div>
        )}

        {!mode && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <button type="button" onClick={() => void startMode("desktop")} disabled={loading} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#1565d8]/40 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-400"><Laptop className="h-5 w-5" /></div>
                <div className="min-w-0"><p className="font-extrabold text-slate-900 dark:text-white">Desktop / Laptop</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Webcam + Browser Location</p></div>
              </div>
            </button>
            <button type="button" onClick={() => void startMode("mobile")} disabled={loading} className="group relative rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#1565d8]/40 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5">
              <span className="absolute right-3 top-3 rounded-full bg-[#f5a623] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">Recommended</span>
              <div className="flex items-center gap-3 pr-20"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-400"><Smartphone className="h-5 w-5" /></div><div className="min-w-0"><p className="font-extrabold text-slate-900 dark:text-white">Mobile / Tablet</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Camera + GPS</p></div></div>
            </button>
          </div>
        )}

        {loading && !directCameraMode && !mobileUrl && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Loader2 className="h-5 w-5 animate-spin" />Preparing secure verification...</div>
        )}

        {mode === "mobile" && !isMobileDevice && mobileUrl && (
          <div className="mt-6 grid gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-[190px_1fr] sm:p-6">
            <div className="flex flex-col items-center justify-center"><div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-white"><QRCodeSVG value={mobileUrl} size={170} includeMargin /></div><p className="mt-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400">Scan with your mobile phone</p></div>
            <div className="min-w-0">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-400"><Smartphone className="h-5 w-5" /></div><div><p className="font-extrabold text-slate-900 dark:text-white">Continue on mobile</p><p className="text-xs text-slate-500 dark:text-slate-400">Use the same DealUp account.</p></div></div>
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-500/10"><p className="text-sm font-bold text-amber-900 dark:text-amber-200">Important</p><p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">Log in to the same DealUp account on your phone before starting the verification.</p></div>
              <div className="mt-4 flex gap-2"><input readOnly value={mobileUrl} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none dark:border-white/10 dark:bg-[#07111f] dark:text-slate-300" /><button type="button" onClick={() => void copyUrl()} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-[#07111f] dark:text-slate-200 dark:hover:bg-white/10"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy"}</button></div>
              <div className="mt-3 flex flex-wrap gap-3"><a href={mobileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565d8] hover:underline"><ExternalLink className="h-3.5 w-3.5" />Open on mobile</a><button type="button" onClick={() => void checkStatus()} disabled={checking} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1565d8] disabled:opacity-60 dark:text-slate-300"><RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />Check status</button></div>
            </div>
          </div>
        )}

        {directCameraMode && !locationVerified && (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-500/10 dark:text-blue-200"><div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" />{mode === "desktop" ? "Desktop verification" : "Mobile verification"}</div><p className="mt-1 text-xs leading-5">Complete the live selfie first. DealUp will then request your precise location.</p></div>
            {!selfieVerified ? <LiveSelfieCapture onCapture={(imageData) => void submitSelfie(imageData)} onCancel={resetSelection} /> : <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-500/10"><div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /><div><p className="font-extrabold text-emerald-800 dark:text-emerald-300">Live Selfie Verified</p><p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">Now verifying your location...</p></div></div></div>}
          </div>
        )}

        {locationVerified && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-500/10"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /><div><p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">✓ Location Verified</p>{accuracy !== null && <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">GPS accuracy: approximately {Math.round(accuracy)} metres</p>}</div></div></div>
        )}

        {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
        {message && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">{message}</div>}

        {mode && !locationVerified && <button type="button" onClick={resetSelection} className="mt-5 text-xs font-bold text-slate-500 hover:text-[#1565d8] dark:text-slate-400 dark:hover:text-blue-400">← Choose another device</button>}
      </div>
    </section>
  );
}

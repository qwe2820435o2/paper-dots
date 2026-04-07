"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWebcamStatus } from "@/store/slices/boothSlice";
import { RootState } from "@/store";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WebcamHandle {
  videoEl: HTMLVideoElement | null;
}

interface Props {
  onReady?: () => void;
  onDevicesReady?: (devices: MediaDeviceInfo[]) => void;
  mirrorEnabled?: boolean;
  deviceId?: string;
  cssFilter?: string;
  className?: string;
}

const WebcamCapture = forwardRef<WebcamHandle, Props>(function WebcamCapture(
  { onReady, onDevicesReady, mirrorEnabled = true, deviceId, cssFilter = "none", className },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dispatch = useDispatch();
  const webcamStatus = useSelector((s: RootState) => s.booth.webcamStatus);

  useImperativeHandle(ref, () => ({
    get videoEl() {
      return videoRef.current;
    },
  }));

  useEffect(() => {
    dispatch(setWebcamStatus("requesting"));

    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, aspectRatio: 4 / 3 }
        : { facingMode: "user", aspectRatio: 4 / 3 },
      audio: false,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(async (stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            dispatch(setWebcamStatus("active"));
            onReady?.();
          };
        }
        const all = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = all.filter((d) => d.kind === "videoinput");
        onDevicesReady?.(videoDevices);
      })
      .catch((err: Error) => {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          dispatch(setWebcamStatus("denied"));
        } else {
          dispatch(setWebcamStatus("error"));
        }
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      dispatch(setWebcamStatus("idle"));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, deviceId]);

  if (webcamStatus === "denied") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 px-6 text-center">
        <CameraOff className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-white text-sm font-semibold mb-1">Camera access denied</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Please allow camera access in your browser settings, then reload the page.
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <Button size="sm" variant="outline" className="text-xs" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button size="sm" variant="secondary" className="text-xs" onClick={() => dispatch(setWebcamStatus("mock"))}>
            Use Mock Camera
          </Button>
        </div>
      </div>
    );
  }

  if (webcamStatus === "error") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 px-6 text-center">
        <Camera className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-white text-sm font-semibold mb-1">Camera unavailable</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            No camera was found or your device does not support webcam access.
          </p>
        </div>
        <Button size="sm" variant="secondary" className="mt-1 text-xs" onClick={() => dispatch(setWebcamStatus("mock"))}>
          Use Mock Camera
        </Button>
      </div>
    );
  }

  if (webcamStatus === "mock") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800">
        <Camera className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground text-xs">Mock Camera Active</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      className={className ?? "w-full h-full object-cover rounded-lg"}
      aria-label="Webcam preview"
      style={{
        transform: mirrorEnabled ? "scaleX(-1)" : "scaleX(1)",
        filter: cssFilter,
      }}
    />
  );
});

export default WebcamCapture;

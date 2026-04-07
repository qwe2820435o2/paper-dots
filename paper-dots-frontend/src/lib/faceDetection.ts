export interface FaceCenter {
  x: number; // 0..1 normalized
  y: number;
}

export interface FaceTracker {
  start(): void;
  stop(): void;
  getFaceCenter(): FaceCenter;
}

const DETECT_INTERVAL = 250; // ms between detections
const FALLBACK_CENTER: FaceCenter = { x: 0.5, y: 0.35 };

export function createFaceTracker(videoEl: HTMLVideoElement): FaceTracker {
  let lastFace: FaceCenter = FALLBACK_CENTER;
  let timer: ReturnType<typeof setInterval> | null = null;

  // Check if the native FaceDetector API is available
  const hasFaceDetector = typeof globalThis !== "undefined" && "FaceDetector" in globalThis;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let detector: any = null;

  async function detect() {
    if (!videoEl || videoEl.readyState < 2) return;

    if (!hasFaceDetector) {
      lastFace = FALLBACK_CENTER;
      return;
    }

    try {
      if (!detector) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detector = new (globalThis as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      }

      const faces = await detector.detect(videoEl);
      if (faces.length > 0) {
        const box = faces[0].boundingBox;
        const vw = videoEl.videoWidth || 640;
        const vh = videoEl.videoHeight || 480;
        lastFace = {
          x: (box.x + box.width / 2) / vw,
          y: (box.y + box.height / 2) / vh,
        };
      }
    } catch {
      // Detection failed — keep last known position
    }
  }

  return {
    start() {
      if (timer) return;
      detect();
      timer = setInterval(detect, DETECT_INTERVAL);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      detector = null;
    },
    getFaceCenter() {
      return lastFace;
    },
  };
}

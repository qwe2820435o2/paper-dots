import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WebcamStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error' | 'mock';

interface BoothState {
  selectedFilterId: string;
  webcamStatus: WebcamStatus;
  capturedShots: string[];
  stripDataUrl: string | null;
  mirrorEnabled: boolean;
  timerSec: number;
  totalShots: number;
  ringLightEnabled: boolean;
  ringLightIntensity: number;
  ringLightSaturation: number;
  ringLightColor: string;
}

const initialState: BoothState = {
  selectedFilterId: 'normal',
  webcamStatus: 'idle',
  capturedShots: [],
  stripDataUrl: null,
  mirrorEnabled: true,
  timerSec: 3,
  totalShots: 4,
  ringLightEnabled: false,
  ringLightIntensity: 50,
  ringLightSaturation: 50,
  ringLightColor: '#ff2244',
};

const boothSlice = createSlice({
  name: 'booth',
  initialState,
  reducers: {
    setWebcamStatus(state, action: PayloadAction<WebcamStatus>) {
      state.webcamStatus = action.payload;
    },
    addCapturedShot(state, action: PayloadAction<string>) {
      if (state.capturedShots.length < state.totalShots) {
        state.capturedShots.push(action.payload);
      }
    },
    addUploadedPhoto(state, action: PayloadAction<string>) {
      state.capturedShots.push(action.payload);
    },
    replacePhoto(state, action: PayloadAction<{ index: number; dataUrl: string }>) {
      state.capturedShots[action.payload.index] = action.payload.dataUrl;
    },
    setStripDataUrl(state, action: PayloadAction<string>) {
      state.stripDataUrl = action.payload;
    },
    clearCapture(state) {
      state.capturedShots = [];
      state.stripDataUrl = null;
    },
    setMirror(state, action: PayloadAction<boolean>) {
      state.mirrorEnabled = action.payload;
    },
    setTimerSec(state, action: PayloadAction<number>) {
      state.timerSec = action.payload;
    },
    setTotalShots(state, action: PayloadAction<number>) {
      state.totalShots = action.payload;
    },
    setRingLight(state, action: PayloadAction<boolean>) {
      state.ringLightEnabled = action.payload;
    },
    setRingLightIntensity(state, action: PayloadAction<number>) {
      state.ringLightIntensity = action.payload;
    },
    setRingLightSaturation(state, action: PayloadAction<number>) {
      state.ringLightSaturation = action.payload;
    },
    setRingLightColor(state, action: PayloadAction<string>) {
      state.ringLightColor = action.payload;
    },
    setFilter(state, action: PayloadAction<string>) {
      state.selectedFilterId = action.payload;
    },
  },
});

export const {
  setWebcamStatus,
  addCapturedShot,
  addUploadedPhoto,
  replacePhoto,
  setStripDataUrl,
  clearCapture,
  setMirror,
  setTimerSec,
  setTotalShots,
  setRingLight,
  setRingLightIntensity,
  setRingLightSaturation,
  setRingLightColor,
  setFilter,
} = boothSlice.actions;

export default boothSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_TEMPLATE_ID, getDefaultTemplateId } from '@/lib/templates';
import { setTotalShots } from './boothSlice';
import type { PlacedSticker } from '@/lib/stickers';

export interface PhotoInSlot {
  slotId: string;
  photoIndex: number;
  offsetX: number; // pan offset within slot (canvas px)
  offsetY: number;
  scale: number; // 1.0 = cover-fit
  rotation: number; // degrees
}

interface EditState {
  selectedTemplateId: string;
  slotAssignments: PhotoInSlot[];
  placedStickers: PlacedSticker[];
  activeSlotId: string | null;
  activeStickerUid: string | null;
}

const initialState: EditState = {
  selectedTemplateId: DEFAULT_TEMPLATE_ID,
  slotAssignments: [],
  placedStickers: [],
  activeSlotId: null,
  activeStickerUid: null,
};

const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    setTemplate(state, action: PayloadAction<string>) {
      state.selectedTemplateId = action.payload;
      // Clear slot assignments when switching templates
      state.slotAssignments = [];
      state.activeSlotId = null;
    },

    assignPhotoToSlot(
      state,
      action: PayloadAction<{ slotId: string; photoIndex: number; initialScale: number }>
    ) {
      // Remove any existing assignment for this slot
      state.slotAssignments = state.slotAssignments.filter(
        (a) => a.slotId !== action.payload.slotId
      );
      state.slotAssignments.push({
        slotId: action.payload.slotId,
        photoIndex: action.payload.photoIndex,
        offsetX: 0,
        offsetY: 0,
        scale: action.payload.initialScale,
        rotation: 0,
      });
    },

    removePhotoFromSlot(state, action: PayloadAction<string>) {
      state.slotAssignments = state.slotAssignments.filter(
        (a) => a.slotId !== action.payload
      );
    },

    updatePhotoTransform(
      state,
      action: PayloadAction<{
        slotId: string;
        offsetX?: number;
        offsetY?: number;
        scale?: number;
        rotation?: number;
      }>
    ) {
      const assignment = state.slotAssignments.find(
        (a) => a.slotId === action.payload.slotId
      );
      if (!assignment) return;
      if (action.payload.offsetX !== undefined) assignment.offsetX = action.payload.offsetX;
      if (action.payload.offsetY !== undefined) assignment.offsetY = action.payload.offsetY;
      if (action.payload.scale !== undefined) assignment.scale = action.payload.scale;
      if (action.payload.rotation !== undefined) assignment.rotation = action.payload.rotation;
    },

    setActiveSlot(state, action: PayloadAction<string | null>) {
      state.activeSlotId = action.payload;
      if (action.payload) state.activeStickerUid = null;
    },

    setActiveStickerUid(state, action: PayloadAction<string | null>) {
      state.activeStickerUid = action.payload;
      if (action.payload) state.activeSlotId = null;
    },

    addSticker(state, action: PayloadAction<PlacedSticker>) {
      state.placedStickers.push(action.payload);
    },

    removeSticker(state, action: PayloadAction<string>) {
      state.placedStickers = state.placedStickers.filter(
        (s) => s.uid !== action.payload
      );
      if (state.activeStickerUid === action.payload) {
        state.activeStickerUid = null;
      }
    },

    updateStickerTransform(
      state,
      action: PayloadAction<{
        uid: string;
        x?: number;
        y?: number;
        scale?: number;
        rotation?: number;
      }>
    ) {
      const sticker = state.placedStickers.find(
        (s) => s.uid === action.payload.uid
      );
      if (!sticker) return;
      if (action.payload.x !== undefined) sticker.x = action.payload.x;
      if (action.payload.y !== undefined) sticker.y = action.payload.y;
      if (action.payload.scale !== undefined) sticker.scale = action.payload.scale;
      if (action.payload.rotation !== undefined) sticker.rotation = action.payload.rotation;
    },

    clearSelection(state) {
      state.activeSlotId = null;
      state.activeStickerUid = null;
    },

    clearEdit(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setTotalShots, (state, action) => {
      state.selectedTemplateId = getDefaultTemplateId(action.payload);
      state.slotAssignments = [];
      state.activeSlotId = null;
    });
  },
});

export const {
  setTemplate,
  assignPhotoToSlot,
  removePhotoFromSlot,
  updatePhotoTransform,
  setActiveSlot,
  setActiveStickerUid,
  addSticker,
  removeSticker,
  updateStickerTransform,
  clearSelection,
  clearEdit,
} = editSlice.actions;

export default editSlice.reducer;

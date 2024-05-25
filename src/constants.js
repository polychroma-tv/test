import { isMobile } from "react-device-detect";

export const MAIN_BAR_WIDTH = isMobile ? 192 : 384;
export const BOTTOM_BAR_HEIGHT = isMobile ? 96 : 180;
export const BOTTOM_BAR_AUTOCLOSE_TIMEOUT_MS = 3000;

export const CHROMA_EASING_BEZIER = 'cubic-bezier(0.65, 0, 0.35, 1)';
export const CHROMA_EASING_TIMING = '1.2s';

export const LIVENESS_CHECK_MS = 1000;

export const VIDEO_TRANSITION_MS = 1000;
export const LABELS_TRANSITION_MS = 1000;

export const UNSTARTED_TIMEOUT_TO_MUTE = 10;
export const UNSTARTED_TIMEOUT_GIVEUP = 60;

export const CHANNEL_REPOSITORY_URL = 'https://polychroma.tv/wp-json/tv/channels/';

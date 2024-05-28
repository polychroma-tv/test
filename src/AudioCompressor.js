export default class AudioCompressor {
  constructor() {
    this.initAudioContext();
  }

  initAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-50, this.audioContext.currentTime);
    this.compressor.knee.setValueAtTime(40, this.audioContext.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
    this.compressor.attack.setValueAtTime(0, this.audioContext.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
  }

  connectToMediaElement(mediaElement) {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.initAudioContext();
    }
    if (this.source) {
      this.disconnect(); // Disconnect existing source if any
    }
    this.source = this.audioContext.createMediaElementSource(mediaElement);
    this.source.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
      this.source.connect(this.audioContext.destination); // Ensure playback continues without compressor
      this.source = null;
    }
    if (this.compressor) {
      this.compressor.disconnect();
    }
  }
}

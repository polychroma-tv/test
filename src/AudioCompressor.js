class AudioCompressor {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.source = null;
  }

  connectToMediaElement(mediaElement) {
    if (mediaElement instanceof HTMLMediaElement) {
      if (this.source) {
        this.source.disconnect();
      }
      this.source = this.audioContext.createMediaElementSource(mediaElement);
      this.source.connect(this.compressor);
      this.compressor.connect(this.audioContext.destination);
    } else {
      console.error('Provided element is not a valid HTMLMediaElement');
    }
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
      this.compressor.disconnect();
      this.source = null;
    }
  }
}

export default AudioCompressor;

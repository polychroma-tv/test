export default class AudioCompressor {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-50, this.audioContext.currentTime);
    this.compressor.knee.setValueAtTime(40, this.audioContext.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
    this.compressor.attack.setValueAtTime(0, this.audioContext.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
  }

  connectToMediaElement(mediaElement) {
    if (this.source) {
      this.disconnect(); // Disconnect existing source if any
    }

    // Check if the mediaElement is already connected to a different MediaElementSourceNode
    if (mediaElement.audioSourceNode) {
      mediaElement.audioSourceNode.disconnect();
    }

    this.source = this.audioContext.createMediaElementSource(mediaElement);
    mediaElement.audioSourceNode = this.source; // Store the source node in the mediaElement

    this.source.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
      this.compressor.disconnect(); // Ensure compressor is disconnected from the destination
      this.source = null; // Ensure source is set to null
    }
  }
}

/** Original synthesized audio: no downloaded samples or licensing dependency. */
class Soundscape {
  enabled = false;
  private ctx: AudioContext | null = null;
  private lastBeat = 0;
  private beat = 0;
  private repairs = 0;
  private cleans = 0;
  private stars = 0;
  toggle(): void {
    this.enabled = !this.enabled;
    if (this.enabled) { this.ctx ??= new AudioContext(); void this.ctx.resume(); }
  }
  note(hz: number, length = 0.2, volume = 0.025): void {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime, oscillator = this.ctx.createOscillator(), gain = this.ctx.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = hz;
    gain.gain.setValueAtTime(volume,t); gain.gain.exponentialRampToValueAtTime(0.0001,t + length);
    oscillator.connect(gain); gain.connect(this.ctx.destination); oscillator.start(t); oscillator.stop(t + length);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  update(weather: string, repairs: number, cleans: number, stars: number): void {
    if (!this.enabled) return;
    if (repairs > this.repairs || cleans > this.cleans || stars > this.stars) this.note(stars > this.stars ? 880 : 660,0.5,0.05);
    this.repairs = repairs; this.cleans = cleans; this.stars = stars;
    if (performance.now() - this.lastBeat < 1500) return;
    this.lastBeat = performance.now();
    const scale = [261.63,329.63,392,523.25,440,392,329.63,293.66];
    this.note(scale[this.beat++ % scale.length],1.3,0.012);
    if (weather === 'rain' || weather === 'hail') this.note(weather === 'hail' ? 45 : 120,0.8,0.025);
  }
}
export const sound = new Soundscape();

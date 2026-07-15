export const CLOUD_SAVE_INTERVAL_MS = 15_000;

interface PendingCloudSave {
  key: string;
  value: string;
}

export class CloudSaveQueue {
  private pending: PendingCloudSave | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<void> | null = null;
  private lastStartedAt = Number.NEGATIVE_INFINITY;
  private disposed = false;

  constructor(
    private readonly save: (key: string, value: string) => Promise<void>,
    private readonly intervalMs = CLOUD_SAVE_INTERVAL_MS
  ) {}

  enqueue(key: string, value: string): void {
    if (this.disposed) {
      return;
    }

    this.pending = { key, value };
    this.schedule();
  }

  async flushNow(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.clearTimer();

    if (this.inFlight) {
      await this.inFlight;
    }

    await this.startSave(true);
  }

  dispose(): void {
    this.disposed = true;
    this.pending = null;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer === null) {
      return;
    }

    clearTimeout(this.timer);
    this.timer = null;
  }

  private schedule(): void {
    if (this.disposed || !this.pending || this.inFlight || this.timer !== null) {
      return;
    }

    const delay = Math.max(0, this.intervalMs - (Date.now() - this.lastStartedAt));

    if (delay === 0) {
      void this.startSave(false);
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = null;
      void this.startSave(false);
    }, delay);
  }

  private async startSave(force: boolean): Promise<void> {
    if (this.disposed || !this.pending || this.inFlight) {
      return;
    }

    const delay = this.intervalMs - (Date.now() - this.lastStartedAt);

    if (!force && delay > 0) {
      this.schedule();
      return;
    }

    const current = this.pending;
    this.pending = null;
    this.lastStartedAt = Date.now();
    this.inFlight = Promise.resolve()
      .then(() => this.save(current.key, current.value))
      .catch(() => undefined);

    await this.inFlight;
    this.inFlight = null;
    this.schedule();
  }
}

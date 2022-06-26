export interface Player {
    readonly buffers: { data: Uint8Array, freq: Uint8Array };
    readonly playing: boolean;

    toggle(): void;

    fetch(): { data: Uint8Array, freq: Uint8Array };

    reset(): void;

    onChange?: (playing: boolean) => void;
}

export function newPlayer(mediaElement: HTMLMediaElement, fftSize = 2048): Player {
    const ac = new AudioContext();
    mediaElement.currentTime = 5;
    const source = ac.createMediaElementSource(mediaElement);
    const destination = ac.destination;

    const analyzer = ac.createAnalyser();
    analyzer.fftSize = fftSize;
    const buffers = {data: new Uint8Array(analyzer.fftSize), freq: new Uint8Array(analyzer.frequencyBinCount)};

    source.connect(analyzer);
    analyzer.connect(destination);
    let playing = false;
    return {
        buffers: buffers,
        get playing() {
            return playing;
        },
        fetch() {
            analyzer.getByteTimeDomainData(buffers.data);
            analyzer.getByteFrequencyData(buffers.freq);
            return buffers;
        },
        toggle() {
            if (!playing) {
                mediaElement.play().then(() => {
                    playing = true;
                    this.onChange && this.onChange(playing);
                });
            } else {
                mediaElement.pause();
                playing = false;
                this.onChange && this.onChange(playing);
            }
        },
        reset() {
            mediaElement.currentTime = 5;
        }
    }
}

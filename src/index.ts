import {GLContext} from "webgl-support";
import {newPlayer} from "./player";
import {AnalyzerRenderer} from "./analyzerRenderer";


const FFT_SIZE = 64;

const glContext = new GLContext();
const analyzerRenderer = new AnalyzerRenderer(glContext);
glContext.renderer = analyzerRenderer;
glContext.running = true;

const audioSource = document.createElement('audio');
audioSource.src = 'shadertoy - ourpithyator.mp3';
audioSource.textContent = 'No audio support';
document.body.append(audioSource);

glContext.canvas.addEventListener('contextmenu', e => e.preventDefault());
glContext.canvas.addEventListener('mousedown', e => {
    if (e.button === 0) {
        if (!analyzerRenderer.player)
            analyzerRenderer.player = newPlayer(audioSource, FFT_SIZE);
        analyzerRenderer.player.toggle();
    } else if (e.button === 2 && analyzerRenderer.player) {
        analyzerRenderer.player.reset();
    }
});

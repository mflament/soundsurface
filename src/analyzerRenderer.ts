import {
    GLContext,
    GLTexture,
    InternalFormat,
    QuadRenderer,
    Renderer,
    RunningState,
    TextureComponentType,
    TextureFormat,
    TextureMagFilter,
    TextureMinFilter,
    TextureWrappingMode
} from "webgl-support";
import {Player} from "./player";
import {ANALYZER_FS} from "./shaders";

export class AnalyzerRenderer implements Renderer {
    private readonly quad: QuadRenderer;
    private _player?: Player;

    private textures?: { freq: GLTexture, data: GLTexture };

    constructor(readonly context: GLContext) {
        this.quad = new QuadRenderer(context, ANALYZER_FS);
        this.quad.prepare = () => this.prepare();

        const uf = context.programUniformsFactory(this.quad.program);
        uf('data', 'int').value = 0;
        uf('fft', 'int').value = 1;

        const gl = this.context.gl;
        gl.clearColor(0, 0, 0, 1);
    }

    get program() {
        return this.quad.program
    }

    get player(): Player | undefined {
        return this._player;
    }

    set player(player: Player | undefined) {
        this._player = player;
    }

    render(state: RunningState) {
        const gl = this.context.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        return this.quad.render(state);
    }

    private prepare(): boolean {
        const player = this._player;
        if (!player || !player.playing)
            return true;

        const buffers = player.fetch();
        if (!this.textures) {
            this.textures = {
                data: this.createTexture(buffers.data.length),
                freq: this.createTexture(buffers.freq.length)
            }
        }
        const {gl, glState} = this.context;
        console.log([...buffers.freq]);
        let texture = this.textures.data;
        glState.setActiveTextureUnit(0);
        glState.bindTexture2D(texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, texture.width, 1, texture.format, texture.type, buffers.data);

        texture = this.textures.freq;
        glState.setActiveTextureUnit(1);
        glState.bindTexture2D(texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, texture.width, 1, texture.format, texture.type, buffers.freq);

        return true;
    }

    private createTexture(width: number): GLTexture {
        return this.context.createTexture({
            internalFormat: InternalFormat.R8,
            format: TextureFormat.RED,
            type: TextureComponentType.UNSIGNED_BYTE,
            width: width,
            height: 255,
            filter: {minFilter: TextureMinFilter.NEAREST, magFilter: TextureMagFilter.NEAREST},
            wrap: {s: TextureWrappingMode.CLAMP_TO_EDGE, t: TextureWrappingMode.CLAMP_TO_EDGE}
        });
    }
}
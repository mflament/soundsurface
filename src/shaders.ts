// language=glsl
export const ANALYZER_FS = `
#version 300 es

precision mediump float;
precision mediump sampler2D;

uniform sampler2D data;
uniform sampler2D fft;
 
in vec2 uv;
out vec4 col;

void main() {
    float f; 
    if (uv.y < .5) {
        f = texture(data, vec2(uv.x, 0.)).r * 2. - 1.;
        float y = uv.y * 4. - 1.;
        float d = abs(y - f);
        col = vec4(vec3(1. - smoothstep(0., 0.01, d)), 1.);        
    } else {
        f = texture(fft, vec2(uv.x, 0.)).r;
        float y = (uv.y - .5) * 2.;
        float d = 1.0 - step(f, y);
        col = vec4(mix(vec3(1.,0.,0.), vec3(0.,1.,0.), y) * d, 1.);
    }
}
`.trim();
import * as webgl from "@andersgee/webgl2-utils";

// a string containing both vertex and fragment shader
const glsl = `#version 300 es
precision mediump float;

#ifdef VERT
in vec2 position;
in vec2 uv;
out vec2 vuv;

void main() {
  vuv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
#endif

#ifdef FRAG
uniform vec3 color1;
uniform vec3 color2;
in vec2 vuv;
out vec4 fragcolor;

void main() {
  vec3 color = mix(color1, color2, vuv.x);
  fragcolor = vec4(color, 1.0);
}
#endif
`;

// specify shader layout (what attributes and uniforms it uses)
const layout: webgl.ProgramLayout = {
  attributes: new Map([
    ["position", webgl.Atype.vec2],
    ["uv", webgl.Atype.vec2],
  ]),
  uniforms: new Map([
    ["color1", webgl.Utype.vec3],
    ["color2", webgl.Utype.vec3],
  ]),
};

//initialize
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = webgl.createWebgl2Context(canvas);
const shader = webgl.createProgram(gl, layout, glsl);

const model: webgl.Model = {
  index: [0, 1, 2, 2, 3, 0],
  position: [-1, -1, 1, -1, 1, 1, -1, 1],
  uv: [0, 0, 1, 0, 1, 1, 0, 1],
};

const uniforms = {
  color1: [1, 0, 0],
  color2: [0, 1, 0],
};

const vao = webgl.createVao(gl, shader.programAttributes, model);

//draw
webgl.setProgram(gl, shader.program);

function render(timestamp: number, _elapsed_ms_since_last_render: number) {
  uniforms.color1[0] = 0.5 + 0.5 * Math.sin(timestamp / 1000);
  uniforms.color2[2] = 0.5 + 0.5 * Math.cos(timestamp / 1000);
  webgl.setUniforms(gl, shader.programUniforms, uniforms);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  webgl.draw(gl, vao);
}

startRequestAnimationFrameLoop(render);

function startRequestAnimationFrameLoop(
  render: (timestamp: number, elapsed_ms_since_last_render: number) => void
) {
  let prevTimestamp: number | undefined = undefined;
  let elapsed_ms_since_last_render = 0;

  const renderloop = (timestamp: number) => {
    if (!prevTimestamp) {
      prevTimestamp = timestamp;
    }

    elapsed_ms_since_last_render = timestamp - prevTimestamp;
    if (prevTimestamp !== timestamp) {
      render(timestamp, elapsed_ms_since_last_render);
    }
    prevTimestamp = timestamp;
    window.requestAnimationFrame(renderloop);
  };

  window.requestAnimationFrame(renderloop);
}

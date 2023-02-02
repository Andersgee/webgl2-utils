# webgl2-utils

utility functions for working with webgl2


## install
with your package manager of choice
```sh
#npm install @andersgee/webgl2-utils
pnpm add @andersgee/webgl2-utils
```

## example usage

view this [example live here](https://webgl2-utils-example.vercel.app/)

```ts
import * as webgl from "@andersgee/webgl2-utils";

// a string containing both vertex and fragment shader
// this would be in a .glsl file but inlined here for this example
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

// create some model data, to be used as vertex array object
const model: webgl.Model = {
  index: [0, 1, 2, 2, 3, 0],
  position: [-1, -1, 1, -1, 1, 1, -1, 1],
  uv: [0, 0, 1, 0, 1, 1, 0, 1],
};

// and some default uniform values
const uniforms = {
  color1: [1, 0, 0],
  color2: [0, 1, 0],
};

//initialize everything
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = webgl.createWebgl2Context(canvas);
const shader = webgl.createProgram(gl, layout, glsl);
const vao = webgl.createVao(gl, shader.programAttributes, model);

//and draw
function render(elapsed_ms: number, elapsed_ms_since_last_render: number) {
  webgl.setProgram(gl, shader.program);

  //change colors a bit
  uniforms.color1[0] = 0.5 + 0.5 * Math.sin(elapsed_ms / 1000);
  uniforms.color2[2] = 0.5 + 0.5 * Math.cos(elapsed_ms / 1000);

  webgl.setUniforms(gl, shader.programUniforms, uniforms);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  webgl.draw(gl, vao);
}

webgl.startRequestAnimationFrameLoop(render);
```

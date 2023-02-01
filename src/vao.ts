import type { Model, ProgramAttributes } from "./common";

/*
utilities for creating, setting, drawing a Vao
*/

export type Vao = WebGLVertexArrayObject & {
  mode: number;
  count: number;
  type: number;
  offset: number;
};

/** set and draw */
export function draw(gl: WebGL2RenderingContext, vao: Vao) {
  setVao(gl, vao);
  drawVao(gl, vao);
}

export function setVao(gl: WebGL2RenderingContext, vao: Vao) {
  gl.bindVertexArray(vao);
}

export function drawVao(gl: WebGL2RenderingContext, vao: Vao) {
  gl.drawElements(vao.mode, vao.count, vao.type, vao.offset);
}

/**
 * vertex array object which is essentially "model attributes but already sent to GPU"
 *
 * (use it at some later point with draw() without re-sending bufferdata to gpu)
 */
export function createVao(
  gl: WebGL2RenderingContext,
  programAttributes: ProgramAttributes,
  model: Model
) {
  const vao = gl.createVertexArray() as Vao;
  gl.bindVertexArray(vao);
  const indexBuf = gl.createBuffer();
  if (indexBuf == null) throw new Error("failed gl.createBuffer()");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(model.index),
    gl.STATIC_DRAW
  );

  programAttributes.forEach(({ location, atypeval }, name) => {
    const atr = model[name];
    if (!atr) {
      console.warn(
        `program has attribute "${name}" but model does not have it. This attribute will have empty data.`
      );
      return;
    }

    gl.enableVertexAttribArray(location);
    const buf = gl.createBuffer();
    if (buf == null) {
      console.warn(`failed gl.createBuffer()`);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    if (atypeval > 0) {
      //size 1,2,3,4 (Atype float,vec2,vec3,vec4)
      gl.vertexAttribPointer(location, atypeval, gl.FLOAT, false, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(atr), gl.STATIC_DRAW);
    } else {
      //size -1,-2,-3,-4 (Atype int,ivec2,ivec3,ivec4)
      gl.vertexAttribIPointer(location, Math.abs(atypeval), gl.INT, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, new Int32Array(atr), gl.STATIC_DRAW);
    }
  });
  gl.bindVertexArray(null);
  vao.mode = gl.TRIANGLES;
  vao.count = model.index.length;
  vao.type = gl.UNSIGNED_INT;
  vao.offset = 0;
  return vao;
}

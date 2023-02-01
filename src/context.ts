/*
utility for creating webgl2 context with some sensible defaults for 3d (like cull back faces etc) 
*/

/**
 * webgl2 context on canvas. (throw error if cant get context)
 *
 * see [mdn webgl best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
 *
 * also [context options](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext)
 */
export function createWebgl2Context(
  canvas: HTMLCanvasElement
): WebGL2RenderingContext {
  const gl = canvas.getContext("webgl2", {
    depth: true,
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
  });

  if (!gl) {
    throw new Error("failed getContext('webgl2')");
  }

  gl.frontFace(gl.CCW);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK); //note: for shadow map, gl.FRONT can be useful, see https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);

  return gl;
}

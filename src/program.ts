import type {
  AttributeLayout,
  UniformLayout,
  ProgramLayout,
  ProgramUniforms,
  ProgramAttributes,
} from "./common";

/*
utilities for setting and creating WebGLProgram from glsl string.
*/

export function setProgram(gl: WebGL2RenderingContext, program: WebGLProgram) {
  gl.useProgram(program);
}

/**
 * create a WebGLProgram from a glsl string.
 *
 * The glsl string has both vertex shader and fragment shader code.
 *
 * ### example glsl string
 *
 * ```glsl
 * #version 300 es
 * //put things used in both here
 *
 * #ifdef VERT
 * //put vertex shader here
 * #endif
 *
 * #ifdef FRAG
 * //put fragment shader here
 * #endif
 * ```
 *
 * You can also provide a glsl_common string. It will be copy pasted on the second line.
 */
export function createProgram(
  gl: WebGL2RenderingContext,
  layout: ProgramLayout,
  glsl: string,
  glsl_common = ""
) {
  const lines = glsl.split("\n");
  const versionstring = lines[0];
  const glslstring = lines.slice(1).join("\n");

  //version must be the first line.
  const VERT = [versionstring, "#define VERT;", glsl_common, glslstring].join(
    "\n"
  );
  const FRAG = [versionstring, "#define FRAG;", glsl_common, glslstring].join(
    "\n"
  );

  const vertshader = gl.createShader(gl.VERTEX_SHADER);
  const fragshader = gl.createShader(gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (vertshader == null)
    throw new Error("failed gl.createShader(gl.VERTEX_SHADER)");
  if (fragshader == null)
    throw new Error("failed gl.createShader(gl.FRAGMENT_SHADER)");
  if (program == null) throw new Error("failed gl.createProgram()");

  gl.shaderSource(vertshader, VERT);
  gl.compileShader(vertshader);
  gl.shaderSource(fragshader, FRAG);
  gl.compileShader(fragshader);
  gl.attachShader(program, vertshader);
  gl.attachShader(program, fragshader);
  gl.linkProgram(program);
  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    console.error(info);
    throw new Error(`failed linking program`);
  }

  const programAttributes = getProgramattributes(
    gl,
    program,
    layout.attributes
  );
  const programUniforms = getProgramUniforms(gl, program, layout.uniforms);

  return { program, programAttributes, programUniforms };
}

function getProgramattributes(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  attributeLayout: AttributeLayout
) {
  const programAttributes: ProgramAttributes = new Map();
  attributeLayout.forEach((atypeval, name) => {
    const location = gl.getAttribLocation(program, name);
    if (location !== -1) {
      //console.log(`getattributes, ${name}, location: ${location}`);
      programAttributes.set(name, { location, atypeval });
    } else {
      console.warn(
        `Ignored attribute "${name}" for program. It has no location in WebGLProgram.`
      );
    }
  });
  return programAttributes;
}

function getProgramUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  uniformLayout: UniformLayout
) {
  const programUniforms: ProgramUniforms = new Map();
  uniformLayout.forEach((utypefunc, name) => {
    const location = gl.getUniformLocation(program, name);
    if (location !== null) {
      //console.log(`getuniforms, ${name}, location: ${location}`);
      programUniforms.set(name, { location, utypefunc });
    } else {
      console.warn(
        `Ignored uniform "${name}". It has no location (or is never used) in WebGLProgram.`
      );
    }
  });

  /*
    const Nuniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let n = 0; n < Nuniforms; n++) {
      const info = gl.getActiveUniform(program, n);
      console.log(`index ${n}, info`, info);
    }
    */

  return programUniforms;
}

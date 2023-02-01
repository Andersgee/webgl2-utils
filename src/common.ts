/** name=>{location,size} of linked attributes */
export type ProgramAttributes = Map<
  string,
  { location: GLint; atypeval: Atypeval }
>;

/** name=>{location,functionName} of linked uniforms */
export type ProgramUniforms = Map<
  string,
  { location: WebGLUniformLocation; utypefunc: Utypefunc }
>;

export type Model = {
  index: number[];
  [atr: string]: number[];
};

/**
 * each type has a specific function associated with them
 *
 * The available uniform types with keys as you would name them in glsl.
 * mapped to the proper function for setting it.
 *
 * ## usage:
 * ### shader glsl
 * ```glsl
 * uniform vec3 mything;
 * ```
 * ### js
 * ```ts
 * const uniforms:UniformLayout = new Map([
 *   ["mything", Utype.vec3]
 * ])
 * const uniformData = {
 *   mything: [1,2,3]
 * }
 * ```
 *
 * ## Advanced usage:
 * note that glsl allows arrays of arrays
 *
 * ### shader glsl
 *
 * ```glsl
 * uniform vec3[2] mything; //two vec3s
 * mything[0] // first vec3
 * ```
 *
 * send them by doing
 *
 * ### js
 *
 * ```ts
 * const uniforms:UniformLayout = new Map([
 *   ["mything", Utype.vec3]
 * ])
 * const uniformData = {
 *   mything: [1,2,3, 5,6,7]
 * }
 * ```
 *
 * ### final note
 * send matrices in column major order, which is default in glsl
 * where one can create
 * ```raw
 * 1 3
 * 2 4
 * ```
 * with mat2(1,2,3,4)
 */
export const Utype = {
  float: "uniform1f",
  vec2: "uniform2fv",
  vec3: "uniform3fv",
  vec4: "uniform4fv",
  int: "uniform1i",
  ivec2: "uniform2iv",
  ivec3: "uniform3iv",
  ivec4: "uniform4iv",
  floatvec: "uniform1fv",
  intvec: "uniform1iv",
  mat2: "uniformMatrix2fv",
  mat3: "uniformMatrix3fv",
  mat4: "uniformMatrix4fv",
  mat2x3: "uniformMatrix2x3fv",
  mat3x2: "uniformMatrix3x2fv",
  mat2x4: "uniformMatrix2x4fv",
  mat4x2: "uniformMatrix4x2fv",
  mat3x4: "uniformMatrix3x4fv",
  mat4x3: "uniformMatrix4x3fv",
  /** yes, the glsl type sampler2D is set with gl.uniform1i() which represents texture index */
  sampler2D: "uniform1i",
  /** bool is actually set with uniform1i, handle this in setUniforms() */
  bool: "bool",
} as const;

export type Utypefunc = typeof Utype[keyof typeof Utype];

/**
 * each attribute needs a specific size associated with them, write them as you would in glsl.
 *
 * ##  usage:
 * ### shader glsl
 * ```glsl
 * in vec2 position;
 * ```
 * ### js
 * ```ts
 * const attributeLayout:AttributeLayout = new Map([
 *   ["position", Atype.vec2]
 * ])
 * const squareModel:Model = {
 *  index: [0, 1, 2, 2, 3, 0],
 *  position: [-1,-1, 1,-1, 1,1, -1,1],
 * };
 * ```
 *
 * ## details
 *
 * the value refers to how many numbers to take from array for each vertex
 *
 * use negative numbers for int. handle it in createVao() by using vertexAttribIPointer instead of vertexAttribPointer
 *
 */
export const Atype = {
  float: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  int: -1,
  ivec2: -2,
  ivec3: -3,
  ivec4: -4,
} as const;

export type Atypeval = typeof Atype[keyof typeof Atype];

/** name => size (size as in how many numbers to use on each vertex) of which attributes to use for shader */
export type AttributeLayout = Map<string, Atypeval>;
/** name => glsl type of which uniforms to use for shader */
export type UniformLayout = Map<string, Utypefunc>;

export type ProgramLayout = {
  attributes: AttributeLayout;
  uniforms: UniformLayout;
};

export type UniformData = Record<
  string,
  number | number[] | boolean | Iterable<number>
>;

export function setUniforms(
  gl: WebGL2RenderingContext,
  programUniforms: ProgramUniforms,
  uniformData: UniformData
) {
  programUniforms.forEach(({ location, utypefunc }, name) => {
    const data = uniformData[name];
    if (data !== undefined) {
      if (utypefunc === Utype.bool) {
        gl.uniform1i(location, data ? 1 : 0); //there is no dedicated function for setting a bool but this works fine.
      } else if (
        utypefunc === Utype.mat2 ||
        utypefunc === Utype.mat3 ||
        utypefunc === Utype.mat4 ||
        utypefunc === Utype.mat2x3 ||
        utypefunc === Utype.mat3x2 ||
        utypefunc === Utype.mat2x4 ||
        utypefunc === Utype.mat4x2 ||
        utypefunc === Utype.mat3x4 ||
        utypefunc === Utype.mat4x3
      ) {
        //obligatory "transpose" boolean for matrix setters
        (gl as any)[utypefunc](location, false, data);
      } else {
        (gl as any)[utypefunc](location, data);
      }
    }
  });
}

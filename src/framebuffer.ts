/*
utilities for 
- creating, setting WebGLFramebuffer.
- creating attachments on the framebuffer
    WebGLRenderbuffer (for color, depth)
    WebGLTexture (for texture)

note: 
- we can only WRITE to color and/or depth attachment
- we can only READ from texture attachment
- so to be able to read output of one shader as input in another shader, the data must be copied (aka blitted) to a texture.
    use blitAttachmentData() for this.
    there is also the caveat that the renderbuffers must be multisampled for 'anti-aliased' texture reading, these utils keep that in mind.

*/

/**
 * create WebGLFramebuffer and make it active.
 *
 * Any following attachments will be on this framebuffer (unless another one is made active with gl.bindFramebuffer())
 */
export function create_fb(gl: WebGL2RenderingContext) {
  const fb = gl.createFramebuffer();
  if (!fb) throw new Error("create_fb, failed gl.createFramebuffer()");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  return fb;
}

export function setFramebuffer(
  gl: WebGL2RenderingContext,
  fb: WebGLFramebuffer
) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
}

/**
 * create WebGLRenderbuffer color attachment and attach to currently active framebuffer
 *
 * There are atleast 8 binding points, choose which one with number i=0...7
 * */
export function create_rb_color(
  gl: WebGL2RenderingContext,
  i: number,
  width: number,
  height: number
) {
  const rb = gl.createRenderbuffer();
  if (!rb) throw new Error("create_rb_color");
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorageMultisample(
    gl.RENDERBUFFER,
    getMultiSampleNumber(gl),
    gl.RGBA8,
    width,
    height
  );
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0 + i,
    gl.RENDERBUFFER,
    rb
  );
  return rb;
}

export function resize_rb_color(
  gl: WebGL2RenderingContext,
  rb: WebGLRenderbuffer,
  width: number,
  height: number
) {
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorageMultisample(
    gl.RENDERBUFFER,
    getMultiSampleNumber(gl),
    gl.RGBA8,
    width,
    height
  );
}

/**
 * create WebGLRenderbuffer depth attachment and attach to currently active framebuffer
 *
 * There is only one binding point
 */
export function create_rb_depth(
  gl: WebGL2RenderingContext,
  width: number,
  height: number
) {
  const rb = gl.createRenderbuffer();
  if (!rb) throw new Error("create_rb_depth");
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorageMultisample(
    gl.RENDERBUFFER,
    getMultiSampleNumber(gl),
    gl.DEPTH_COMPONENT24,
    width,
    height
  );
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    rb
  );
  return rb;
}

export function resize_rb_depth(
  gl: WebGL2RenderingContext,
  rb: WebGLRenderbuffer,
  width: number,
  height: number
) {
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorageMultisample(
    gl.RENDERBUFFER,
    getMultiSampleNumber(gl),
    gl.DEPTH_COMPONENT24,
    width,
    height
  );
}

/**
 * create WebGLTexture color attachment and attach to currently active framebuffer
 *
 * There are atleast 8 binding points, choose which one with number i=0...7
 * */

export function create_texture_color(
  gl: WebGL2RenderingContext,
  i: number,
  width: number,
  height: number
) {
  const texture = gl.createTexture();
  if (!texture) throw new Error("create_texture_color");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0 + i,
    gl.TEXTURE_2D,
    texture,
    0
  );
  return texture;
}

export function resize_texture_color(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  width: number,
  height: number
) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
}

/**
 * create WebGLTexture depth attachment and attach to currently active framebuffer
 *
 * There is only one binding point
 */

export function create_texture_depth(
  gl: WebGL2RenderingContext,
  width: number,
  height: number
) {
  const depthtexture = gl.createTexture();
  if (!depthtexture) throw new Error("create_texture_depth");
  gl.bindTexture(gl.TEXTURE_2D, depthtexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT24,
    width,
    height,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null
  );
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    depthtexture,
    0
  );
  return depthtexture;
}

export function resize_texture_depth(
  gl: WebGL2RenderingContext,
  depthtexture: WebGLTexture,
  width: number,
  height: number
) {
  gl.bindTexture(gl.TEXTURE_2D, depthtexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT24,
    width,
    height,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null
  );
}

/**
 * copy pixels from an attachment to another.
 *
 * mostly used for producing anti-aliased textures.
 *
 * ### details:
 *
 * - Drawing to a regular WebGLTexture will produce "sharp pixels" (not anti-aliased)
 * - There is no "multisampled texture" in Webgl2.
 * - So draw to a multisampled WebGLRenderbuffer and copy it over to the texture. This produces an "anti-aliased texture".
 */
export function blitAttachmentData(
  gl: WebGL2RenderingContext,
  read_fb: WebGLFramebuffer,
  read_attachment_index: number,
  draw_fb: WebGLFramebuffer,
  draw_attachment_index: number,
  width: number,
  height: number
) {
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, read_fb);
  gl.readBuffer(gl.COLOR_ATTACHMENT0 + read_attachment_index);

  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, draw_fb);
  //must set as list such as [gl.COLOR_ATTACHMENT0] or [gl.NONE, gl.COLOR_ATTACHMENT1] or [gl.NONE, gl.NONE, gl.COLOR_ATTACHMENT2]
  const drawBuffers = [
    ...new Array(draw_attachment_index).fill(gl.NONE),
    gl.COLOR_ATTACHMENT0 + draw_attachment_index,
  ];
  gl.drawBuffers(drawBuffers);
  gl.blitFramebuffer(
    0,
    0,
    width,
    height,
    0,
    0,
    width,
    height,
    gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
    gl.NEAREST
  );
}

export function getMultiSampleNumber(gl: WebGL2RenderingContext) {
  // returning 0 will make RenderbufferStorageMultisample()
  // behave as if RenderbufferStorage() was called
  // at least according to page 205 at https://registry.khronos.org/OpenGL/specs/es/3.0/es_spec_3.0.pdf#nameddest=subsubsection.4.4.2.1

  //return 0;
  return gl.getParameter(gl.MAX_SAMPLES);
}

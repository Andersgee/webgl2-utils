/*
utilities for creating and setting texture
*/

export function setTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  i: number
) {
  gl.activeTexture(gl.TEXTURE0 + i);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

/**
 * create texture from image (throw error if cant even initialize a new empty texture)
 *
 * use later with setTexture()
 */
export function createTexture(
  gl: WebGL2RenderingContext,
  imageSrc: string,
  i: number,
  onLoaded?: () => void
) {
  const image = new Image();
  image.src = imageSrc;

  gl.activeTexture(gl.TEXTURE0 + i);
  const tex = gl.createTexture();
  if (tex === null) throw new Error("createTexture");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  //initially, store texture from data (single black pixel)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255])
  );

  image.onload = () => {
    //when loaded, store texture from image
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    console.log("bound: ", imageSrc);
    console.log(image);
    onLoaded?.();
  };
  return tex;
}

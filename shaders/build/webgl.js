function setup_webgl(canvas) {
  if (!window.WebGLRenderingContext) {
    throw new Error("Does not have WebGL");
  }
  let context = canvas.getContext("webgl2");
  if (!context) {
    throw new Error("failed to make webgl context");
  }
  return context;
}
function load_shader(gl, text, shader_type) {
  let shader = gl.createShader(shader_type);
  gl.shaderSource(shader, text);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Vertex shader failed to compile.  The error log is: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}
function init_shader(gl, vertexShader, fragmentShader) {
  var vertShdr = load_shader(gl, vertexShader, gl.VERTEX_SHADER);
  var fragShdr = load_shader(gl, fragmentShader, gl.FRAGMENT_SHADER);
  var program = gl.createProgram();
  gl.attachShader(program, vertShdr);
  gl.attachShader(program, fragShdr);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Shader program failed to link. The error log is: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

export { init_shader, setup_webgl };

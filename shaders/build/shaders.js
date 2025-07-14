import { init_shader } from './webgl.js';
import shadow_vert from './shadow.vert.js';
import shadow_frag from './shadow.frag.js';
import skybox_vert from './skybox.vert.js';
import skybox_frag from './skybox.frag.js';
import phong_vert from './phong.vert.js';
import phong_frag from './phong.frag.js';

function make_shader(gl, program) {
  let atributes = {};
  let uniforms = {};
  let attribute_count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let j = 0; j < attribute_count; j++) {
    let attribute_info = gl.getActiveAttrib(program, j);
    atributes[attribute_info.name] = gl.getAttribLocation(program, attribute_info.name);
    console.log(j, atributes[attribute_info.name], attribute_info.name);
  }
  let uniform_count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let j = 0; j < uniform_count; j++) {
    let uniform_info = gl.getActiveUniform(program, j);
    uniforms[uniform_info.name] = gl.getUniformLocation(program, uniform_info.name);
    console.log(j, uniforms[uniform_info.name], uniform_info.name);
  }
  return {
    program,
    atributes,
    uniforms
  };
}
function init_webgl_shaders(gl) {
  let shadow = make_shader(gl, init_shader(gl, shadow_vert, shadow_frag));
  let skybox = make_shader(gl, init_shader(gl, skybox_vert, skybox_frag));
  let phong = make_shader(gl, init_shader(gl, phong_vert, phong_frag));
  return {
    shadow,
    skybox,
    phong
  };
}

export { init_webgl_shaders };

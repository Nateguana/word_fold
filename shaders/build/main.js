import { perspective, inverse4, vec3, clamp, mat4, mult_mat, translate, scalem, mult_mat_vec } from './MV.js';
import { setup_webgl } from './webgl.js';
import { Boundary } from './boundary.js';
import { GLObject, ModelObject } from './object.js';
import { init_webgl_shaders } from './shaders.js';
import { DataLoader } from './data_loader.js';
import { MODEL_DATA } from './model_data.js';
import { Camera } from './camera.js';
import { Light } from './light.js';

/*!
    added multiple new cameras
    implemented a shadowbuffer
    added acceleration to the car
*/
const PROJECTION_MATRIX = perspective(60, 1, 0.1, 20);
const INVERSE_PROJECTION_MATRIX = inverse4(PROJECTION_MATRIX);
const LIGHT_PROJECTION_MATRIX = perspective(150, 1, 0.1, 20);
const SKYBOX = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
const SHADOW_MULT = 4;
async function main() {
  let boundary = new Boundary();
  let gl = setup_webgl(boundary.canvas);
  let shaders = init_webgl_shaders(gl);
  gl.viewport(0, 0, boundary.canvas.width, boundary.canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(0, 0, 0, 1);
  let data = new DataLoader();
  await data.load(gl, MODEL_DATA);
  let [skybox, shadows] = make_gl_stuff(gl, boundary.canvas);
  let [objects, import_obj] = load_scene();
  let model = {
    boundary,
    gl,
    shaders,
    objects,
    import_obj,
    data,
    light_type: 0,
    camera_number: 0,
    track_camera: {
      is_moving: false,
      spin: 0
    },
    car: {
      is_moving: false,
      speed: 0,
      spin: 0
    },
    skybox,
    shadows,
    show_reflect: true,
    show_refract: true
  };
  setup_controls(model);
  update(model);
}
function make_gl_stuff(gl, canvas) {
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, SKYBOX, gl.STATIC_DRAW);
  let skybox = { show: true, buffer };
  const depth_texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, depth_texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT32F,
    canvas.width * SHADOW_MULT,
    canvas.height * SHADOW_MULT,
    0,
    gl.DEPTH_COMPONENT,
    gl.FLOAT,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const depth_frame_buffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depth_frame_buffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    depth_texture,
    0
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  let shadows = { show: true, buffer: depth_frame_buffer };
  return [skybox, shadows];
}
function load_scene() {
  let important = {
    cameras: [],
    light: new Light()
  };
  let scene = {};
  const add_to_scene = (obj) => {
    scene[obj.name] = obj;
    return obj;
  };
  const add_camera = (name) => {
    let ret = new Camera(name);
    important.cameras.push(ret);
    return ret;
  };
  add_to_scene(new GLObject("track_camera_anchor").add_child(
    add_camera("Track").set_translation(vec3(0, 4, 8))
  ));
  let car = new ModelObject("car", "car_Cube.012").set_translation(vec3(3, 0, 0)).set_rotation(vec3(0, 180, 0)).set_skybox_type(1).add_child(new ModelObject("back_wheels", "NormalCar1_BackWheels_Cube.011")).add_child(new ModelObject("front_left_wheel", "NormalCar1_FrontLeftWheel_Cube.007")).add_child(new ModelObject("front_right_wheel", "NormalCar1_FrontRightWheel_Cube.008")).add_child(
    new ModelObject("bunny", "bunny").set_translation(vec3(0, 0.5, 2)).set_rotation(vec3(0, 90, 0)).set_skybox_type(-1)
  ).add_child(add_camera("Bumper").set_translation(vec3(0, 1, -3))).add_child(new GLObject("1st Person Lookat").set_translation(vec3(0.5, 1, 1)).add_child(add_camera("1st Person").set_translation(vec3(0, 0, -0.5)))).add_child(add_camera("3rd Person").set_translation(vec3(0, 3, -5)));
  add_to_scene(new ModelObject("lamp", "Streetlight_Single_Cylinder.003").set_no_shadow()).add_child(important.light.set_translation(vec3(0, 2.95, 0))).add_child(add_camera("Light").set_translation(vec3(0, 5, 0)).set_up_dir(vec3(1, 0, 0)));
  add_to_scene(new ModelObject("street", "Street_Curve_Cube.004"));
  add_to_scene(new ModelObject("stopsign", "Stop_Cylinder")).set_translation(vec3(4.1, 0, -2)).set_rotation(vec3(0, -90, 0));
  add_to_scene(new GLObject("car_anchor")).add_child(car);
  return [scene, important];
}
function render(model) {
  let gl = model.gl;
  for (let obj of Object.values(model.objects)) {
    obj.make_transform(mat4());
  }
  let cameraMat = model.import_obj.cameras[model.camera_number].get_matrix();
  let light_mat = model.import_obj.light.get_matrix();
  let invCameraMat = inverse4(cameraMat);
  let shadow_matrix = mult_mat(LIGHT_PROJECTION_MATRIX, light_mat);
  let textureMatrix = mult_mat(
    mult_mat(
      mult_mat(
        translate(vec3(0.5, 0.5, 0.5)),
        scalem(vec3(0.5, 0.5, 0.5))
      ),
      LIGHT_PROJECTION_MATRIX
    ),
    light_mat
  );
  let inverse_matrix = mult_mat(invCameraMat, INVERSE_PROJECTION_MATRIX);
  render_shadowbuffer(model, shadow_matrix);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (model.skybox.show)
    render_skybox(model, inverse_matrix);
  render_objects(model, cameraMat, textureMatrix, invCameraMat);
}
function render_shadowbuffer(model, shadow_matrix) {
  let gl = model.gl;
  let shader = model.shaders.shadow;
  gl.useProgram(shader.program);
  gl.viewport(0, 0, gl.canvas.width * SHADOW_MULT, gl.canvas.height * SHADOW_MULT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, model.shadows.buffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (model.shadows.show)
    for (let obj of Object.values(model.objects)) {
      render_shadow_obj(model, shader, obj, shadow_matrix);
    }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
function render_shadow_obj(model, shader, obj, matrix) {
  let gl = model.gl;
  if (obj instanceof ModelObject && obj.has_shadow) {
    let obj_geo = obj.get_geometry();
    let geo_list = model.data.geometry[obj_geo];
    let modelMat = mult_mat(matrix, obj.get_transform());
    gl.uniformMatrix4fv(
      shader.uniforms["mMatrix"],
      true,
      new Float32Array(modelMat.flatMap((e) => e))
    );
    for (let geo of geo_list) {
      gl.bindBuffer(gl.ARRAY_BUFFER, geo.get_buffer());
      gl.vertexAttribPointer(shader.atributes["vPosition"], 3, gl.FLOAT, false, 8 * 4, 0);
      gl.enableVertexAttribArray(shader.atributes["vPosition"]);
      gl.drawArrays(gl.TRIANGLES, 0, geo.data.length / 8);
    }
  }
  for (let child of Object.values(obj.children)) {
    render_shadow_obj(model, shader, child, matrix);
  }
}
function render_skybox(model, inverse_matrix) {
  let gl = model.gl;
  let shader = model.shaders.skybox;
  gl.useProgram(shader.program);
  gl.depthFunc(gl.LEQUAL);
  gl.uniformMatrix4fv(
    shader.uniforms["mInverseView"],
    true,
    new Float32Array(inverse_matrix.flatMap((e) => e))
  );
  gl.uniform1i(shader.uniforms["texture"], 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.skybox.buffer);
  gl.vertexAttribPointer(shader.atributes["vPosition"], 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shader.atributes["vPosition"]);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.depthFunc(gl.LESS);
}
function render_objects(model, cameraMat, shadow_matrix, inverse_matrix) {
  let gl = model.gl;
  let shader = model.shaders.phong;
  gl.useProgram(shader.program);
  gl.uniform1i(shader.uniforms["shadow"], 0);
  gl.uniform1i(shader.uniforms["skybox"], 1);
  gl.uniformMatrix4fv(
    shader.uniforms["mProjection"],
    true,
    new Float32Array(PROJECTION_MATRIX.flatMap((vec) => vec))
  );
  gl.uniformMatrix4fv(
    shader.uniforms["mView"],
    true,
    new Float32Array(cameraMat.flatMap((vec) => vec))
  );
  gl.uniformMatrix4fv(
    shader.uniforms["mShadow"],
    true,
    new Float32Array(shadow_matrix.flatMap((vec) => vec))
  );
  gl.uniformMatrix4fv(
    shader.uniforms["mInverseView"],
    true,
    new Float32Array(inverse_matrix.flatMap((vec) => vec))
  );
  gl.uniform1f(
    shader.uniforms["light_type"],
    1 - model.light_type
  );
  let light_pos = vec3(mult_mat_vec(
    cameraMat,
    model.import_obj.light.get_postition()
  ));
  gl.uniform3fv(
    shader.uniforms["vLightPos"],
    new Float32Array(light_pos)
  );
  for (let obj of Object.values(model.objects)) {
    render_obj(model, shader, obj);
  }
}
function render_obj(model, shader, obj) {
  let gl = model.gl;
  if (obj instanceof ModelObject) {
    let obj_geo = obj.get_geometry();
    let modelMat = obj.get_transform();
    gl.uniformMatrix4fv(
      shader.uniforms["mModel"],
      true,
      new Float32Array(modelMat.flatMap((e) => e))
    );
    let skybox_type = clamp(obj.skybox_type, -Number(model.show_refract), Number(model.show_reflect));
    gl.uniform1f(shader.uniforms["skybox_type"], skybox_type);
    let geo_list = model.data.geometry[obj_geo];
    for (let geo of geo_list) {
      render_geometry(model, shader, geo);
    }
  }
  for (let child of Object.values(obj.children)) {
    render_obj(model, shader, child);
  }
}
function render_geometry(model, shader, geo) {
  let gl = model.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, geo.get_buffer());
  gl.vertexAttribPointer(shader.atributes["vPosition"], 3, gl.FLOAT, false, 8 * 4, 0);
  gl.enableVertexAttribArray(shader.atributes["vPosition"]);
  gl.vertexAttribPointer(shader.atributes["vNormal"], 3, gl.FLOAT, false, 8 * 4, 3 * 4);
  gl.enableVertexAttribArray(shader.atributes["vNormal"]);
  gl.vertexAttribPointer(shader.atributes["vTexture"], 2, gl.FLOAT, false, 8 * 4, 6 * 4);
  gl.enableVertexAttribArray(shader.atributes["vTexture"]);
  let materal = model.data.material[geo.materal];
  let [materal_data, shininess] = materal.get_matrix();
  gl.uniformMatrix3fv(
    shader.uniforms["mLightMults"],
    false,
    new Float32Array(materal_data.flatMap((vec) => vec))
  );
  let texture = model.data.texture[materal.texture];
  if (texture) {
    gl.uniform1i(shader.uniforms["texture"], texture.slot);
  }
  gl.uniform1f(
    shader.uniforms["shininess"],
    shininess
  );
  gl.drawArrays(gl.TRIANGLES, 0, geo.data.length / 8);
}
function update(model) {
  render(model);
  if (model.track_camera.is_moving) {
    model.track_camera.spin += 2;
    model.objects["track_camera_anchor"].set_rotation(vec3(0, model.track_camera.spin, 0));
    model.import_obj.cameras[0].translation[1] = 4 + Math.sin(model.track_camera.spin / 32);
  }
  let car_acc = model.car.is_moving ? 1 : -1;
  model.car.speed = clamp(model.car.speed + car_acc / 4, 0, 5);
  model.car.spin += model.car.speed;
  model.objects["car_anchor"].rotation[1] = model.car.spin;
  requestAnimationFrame(() => update(model));
}
function setup_controls(model) {
  window.onkeydown = (ev) => {
    if (ev.repeat) {
      return;
    }
    if (ev.key.toLowerCase() == "l") {
      model.light_type = (model.light_type + 1) % 3;
      model.boundary.change_light_type(model.light_type);
    }
    if (ev.key.toLowerCase() == "d") {
      model.camera_number = (model.camera_number + 1) % model.import_obj.cameras.length;
      model.boundary.change_camera(model.import_obj.cameras[model.camera_number].name);
    }
    if (ev.key.toLowerCase() == "c") {
      model.track_camera.is_moving = true;
    }
    if (ev.key.toLowerCase() == "m") {
      model.car.is_moving = !model.car.is_moving;
      model.boundary.change_car(model.car.is_moving);
    }
    if (ev.key.toLowerCase() == "e") {
      model.skybox.show = !model.skybox.show;
      model.boundary.change_skybox(model.skybox.show);
    }
    if (ev.key.toLowerCase() == "s") {
      model.shadows.show = !model.shadows.show;
      model.boundary.change_shadows(model.shadows.show);
    }
    if (ev.key.toLowerCase() == "r") {
      model.show_reflect = !model.show_reflect;
      model.boundary.change_reflect(model.show_reflect);
    }
    if (ev.key.toLowerCase() == "f") {
      model.show_refract = !model.show_refract;
      model.boundary.change_refract(model.show_refract);
    }
  };
  window.onkeyup = (ev) => {
    if (ev.key.toLowerCase() == "c") {
      model.track_camera.is_moving = false;
    }
  };
}
window.onload = main;

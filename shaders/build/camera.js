import { mat4, vec3, get_translation, lookAt } from './MV.js';
import { GLObject } from './object.js';

class Camera extends GLObject {
  camera_matrix = mat4();
  up_dir = vec3(0, 1, 0);
  // private lookat_offset: mv.Vec3 = mv.vec3();
  constructor(name) {
    super(`${name} Camera`);
  }
  get_matrix() {
    return this.camera_matrix;
  }
  make_transform(parent_transform) {
    super.make_transform(parent_transform);
    let eye = get_translation(this.transform);
    let lookat = get_translation(parent_transform);
    this.camera_matrix = lookAt(eye, lookat, this.up_dir);
  }
  set_up_dir(up) {
    this.up_dir = up;
    return this;
  }
  // set_look_at(at: mv.Vec3): this {
  //     this.lookat_offset = at;
  //     return this;
  // }
}

export { Camera };

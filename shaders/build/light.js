import { mat4, vec4, get_translation, lookAt, vec3 } from './MV.js';
import { GLObject } from './object.js';

class Light extends GLObject {
  light_matrix = mat4();
  position = vec4();
  constructor() {
    super("light");
  }
  make_transform(parent_transform) {
    super.make_transform(parent_transform);
    let pos = get_translation(this.transform);
    this.position = vec4(pos);
    this.light_matrix = lookAt(pos, vec3(), vec3(1, 0, 0));
  }
  get_postition() {
    return this.position;
  }
  get_matrix() {
    return this.light_matrix;
  }
}

export { Light };

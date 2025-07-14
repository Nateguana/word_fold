import { vec3, mat4, mult_mat, translate, rotateX, rotateY, rotateZ, scalem } from './MV.js';

class GLObject {
  name;
  translation = vec3();
  rotation = vec3();
  scale = vec3(1, 1, 1);
  transform = mat4();
  children = {};
  constructor(name) {
    this.name = name;
  }
  make_transform(parent_transform) {
    this.transform = mult_mat(
      parent_transform,
      mult_mat(
        translate(this.translation),
        mult_mat(
          rotateX(this.rotation[0]),
          mult_mat(
            rotateY(this.rotation[1]),
            mult_mat(
              rotateZ(this.rotation[2]),
              scalem(this.scale)
            )
          )
        )
      )
    );
    for (let child of Object.values(this.children)) {
      child.make_transform(this.transform);
    }
  }
  set_translation(value) {
    this.translation = value;
    return this;
  }
  set_rotation(value) {
    this.rotation = value;
    return this;
  }
  set_scale(value) {
    this.scale = value;
    return this;
  }
  add_child(obj) {
    this.children[obj.name] = obj;
    return this;
  }
  get_transform() {
    return this.transform;
  }
  get_geometry() {
    return null;
  }
}
class ModelObject extends GLObject {
  geometry;
  has_shadow = true;
  skybox_type = 0;
  constructor(name, geometry) {
    super(name);
    this.geometry = geometry;
  }
  set_no_shadow() {
    this.has_shadow = false;
    return this;
  }
  set_skybox_type(type) {
    this.skybox_type = type;
    return this;
  }
  get_geometry() {
    return this.geometry;
  }
}

export { GLObject, ModelObject };

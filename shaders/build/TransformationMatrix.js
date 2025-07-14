import { vec2, mult_mat, rotateZ, scalem, vec3, translate } from './MV.js';

function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}
class TransformationMatrix {
  scale = 1;
  rotation = 0;
  translation = vec2(0, -0);
  get_transform() {
    return mult_mat(
      translate(vec3(this.translation)),
      mult_mat(
        rotateZ(this.rotation),
        scalem(vec3(this.scale, this.scale, 1))
      )
    );
  }
  change_scale(val) {
    this.scale = Math.pow(10, clamp(Math.log10(this.scale) + val, -1, 1));
  }
  change_rotation(val) {
    this.rotation = (this.rotation + val + Math.PI * 2) % (Math.PI * 2);
  }
  change_translation(vec) {
    this.translation = vec2(
      clamp(this.translation[0] - vec[0], -15, 15),
      clamp(this.translation[1] + vec[1], -15, 15)
    );
  }
}

export { TransformationMatrix };

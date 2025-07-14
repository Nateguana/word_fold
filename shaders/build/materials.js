import { vec3, mat3 } from './MV.js';

class Materal {
  ambient;
  diffuse;
  specular;
  shininess;
  constructor(amb1, amb2, amb3, diff1, diff2, diff3, spec1, spec2, spec3, shininess) {
    this.ambient = vec3(amb1, amb2, amb3);
    this.diffuse = vec3(diff1, diff2, diff3);
    this.specular = vec3(spec1, spec2, spec3);
    this.shininess = shininess;
  }
  generate_mat() {
    return [mat3(this.diffuse, this.specular, this.ambient), this.shininess];
  }
}
const Demo = new Materal(0.2, 0, 0.2, 1, 0.8, 0, 1, 1, 1, 20);

export { Demo, Materal };

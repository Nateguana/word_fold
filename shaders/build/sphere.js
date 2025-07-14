import { vec3, clamp, normalize, mix, mat3, add } from './MV.js';

function GET_POINTS() {
  let s3 = 1 / Math.sqrt(3);
  return [
    vec3(s3, s3, s3),
    vec3(-s3, s3, s3),
    vec3(-s3, -s3, s3),
    vec3(s3, -s3, s3),
    vec3(s3, -s3, -s3),
    vec3(s3, s3, -s3),
    vec3(-s3, s3, -s3),
    vec3(-s3, -s3, -s3)
  ];
}
const POINTS = GET_POINTS();
class Sphere {
  subdivisions = 0;
  pos = 0;
  triangle_mode = true;
  materal;
  point_buffer;
  point_data;
  constructor(gl, materal) {
    this.point_buffer = gl.createBuffer();
    this.materal = materal;
    this.update_points();
    this.update_buffer(gl);
  }
  change_division_count(offset, gl) {
    this.subdivisions = clamp(this.subdivisions + offset, 0, 5);
    this.update_points();
    this.update_buffer(gl);
    return this.subdivisions;
  }
  change_render_mode(triangle_mode, gl) {
    if (triangle_mode != this.triangle_mode) {
      this.triangle_mode = triangle_mode;
      this.update_points();
      this.update_buffer(gl);
    }
  }
  change_position(offset) {
    this.pos = (this.pos + offset + 1) % 1;
    return this.pos;
  }
  update_points() {
    let cube = get_cube();
    let sub = subdivide(cube, this.subdivisions);
    if (this.triangle_mode) {
      set_normals(sub);
    } else {
      set_line(sub);
    }
    this.point_data = sub;
  }
  update_buffer(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.point_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.point_data, gl.STATIC_DRAW);
  }
  get_buffer() {
    return this.point_buffer;
  }
  get_materal_mat() {
    return this.materal.generate_mat();
  }
  get_point_count() {
    let div = this.triangle_mode ? 6 : 3;
    return this.point_data.length / div;
  }
  get_position() {
    return this.pos;
  }
  get_mode() {
    return this.triangle_mode;
  }
}
function subdivide(points, divisions) {
  let old_points = points;
  for (let div_index = 0; div_index < divisions; div_index++) {
    let new_points = new Float32Array(old_points.length * 4);
    for (let j = 0; j < old_points.length; j += 36) {
      let points2 = [
        vec3([...old_points.slice(j + 0, j + 3)]),
        vec3([...old_points.slice(j + 6, j + 9)]),
        vec3([...old_points.slice(j + 12, j + 15)]),
        vec3([...old_points.slice(j + 30, j + 33)])
      ];
      points2.push(normalize(mix(points2[0], points2[1], 0.5)));
      points2.push(normalize(mix(points2[0], points2[2], 0.5)));
      points2.push(normalize(mix(points2[0], points2[3], 0.5)));
      points2.push(normalize(mix(points2[1], points2[2], 0.5)));
      points2.push(normalize(mix(points2[2], points2[3], 0.5)));
      make_face(new_points, points2, j / 9, 0, 4, 5, 6);
      make_face(new_points, points2, j / 9, 1, 7, 5, 4);
      make_face(new_points, points2, j / 9, 2, 8, 5, 7);
      make_face(new_points, points2, j / 9, 3, 6, 5, 8);
    }
    old_points = new_points;
  }
  return old_points;
}
function set_normals(arr) {
  for (let index = 0; index < arr.length; index += 36) {
    let mat = mat3(
      [...arr.slice(index + 0, index + 3)],
      [...arr.slice(index + 6, index + 9)],
      [...arr.slice(index + 12, index + 15)]
    );
    let normal = newell(mat);
    for (let j = 0; j < 6; j++) {
      arr.set(normal, index + j * 6 + 3);
    }
  }
}
function newell(mat) {
  let ret = vec3();
  for (let j = 0; j < 3; j++) {
    let i = (j + 1) % 3;
    let prod = vec3(
      (mat[j][1] - mat[i][1]) * (mat[j][2] + mat[i][2]),
      (mat[j][2] - mat[i][2]) * (mat[j][0] + mat[i][0]),
      (mat[j][0] - mat[i][0]) * (mat[j][1] + mat[i][1])
    );
    ret = add(ret, prod);
  }
  return ret;
}
function set_line(arr) {
  for (let index = 0; index < arr.length; index += 36) {
    arr.copyWithin(index + 3, index + 6, index + 9);
    arr.copyWithin(index + 9, index + 12, index + 15);
    arr.copyWithin(index + 15, index + 30, index + 33);
    arr.copyWithin(index + 21, index + 24, index + 27);
    arr.set([0, 0, 0, 0, 0, 0], index + 24);
    arr.copyWithin(index + 33, index, index + 3);
  }
}
function make_face(arr, points, offset, num1, num2, num3, num4) {
  arr.set(points[num1], (num1 + offset) * 36 + 0);
  arr.set(points[num2], (num1 + offset) * 36 + 6);
  arr.set(points[num3], (num1 + offset) * 36 + 12);
  arr.set(points[num1], (num1 + offset) * 36 + 18);
  arr.set(points[num3], (num1 + offset) * 36 + 24);
  arr.set(points[num4], (num1 + offset) * 36 + 30);
}
function get_cube() {
  let array = new Float32Array(216);
  make_face(array, POINTS, 0, 0, 1, 2, 3);
  make_face(array, POINTS, 0, 1, 6, 7, 2);
  make_face(array, POINTS, 0, 2, 7, 4, 3);
  make_face(array, POINTS, 0, 3, 4, 5, 0);
  make_face(array, POINTS, 0, 4, 7, 6, 5);
  make_face(array, POINTS, 0, 5, 6, 1, 0);
  return array;
}

export { Sphere };

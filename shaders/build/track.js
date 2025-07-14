import { clamp, vec2, vec3, scalem, mix, translate, mult_vec } from './MV.js';

class Track {
  num_points = 6;
  num_divisions = 0;
  control_points;
  point_data;
  prefix_sum_data;
  buffer;
  scale = 5;
  constructor(gl) {
    this.buffer = gl.createBuffer();
    this.update_control_points();
    this.update_division_points();
    this.update_prefix_sum();
    this.update_buffer(gl);
  }
  change_point_count(offset, gl) {
    this.num_points = clamp(this.num_points + offset, 4, 12);
    this.update_control_points();
    this.update_division_points();
    this.update_prefix_sum();
    this.update_buffer(gl);
    return this.num_points;
  }
  change_division_count(offset, gl) {
    this.num_divisions = clamp(this.num_divisions + offset, 0, 8);
    this.update_division_points();
    this.update_prefix_sum();
    this.update_buffer(gl);
    return this.num_divisions;
  }
  update_control_points() {
    let points = [];
    const quads = [[0.5, 0.5], [-1, 0.5], [-1, -1], [0.5, -1]];
    for (let quad_index = 0; quad_index < 4; quad_index++) {
      let rx = Math.random() * 0.5;
      let ry = Math.random() * 0.5;
      let x = rx + quads[quad_index][0];
      let y = ry + quads[quad_index][1];
      points.push(vec2(x, y));
    }
    for (let j = 4; j < this.num_points; j++) {
      let rx = Math.random() * 2 - 1;
      let ry = Math.random() * 2 - 1;
      points.push(vec2(rx, ry));
    }
    points.sort((a, b) => Math.atan2(b[0], b[1]) - Math.atan2(a[0], a[1]));
    this.control_points = new Float32Array(points.flatMap((e) => [...e, 0]));
  }
  update_division_points() {
    this.point_data = chaikin(this.control_points, this.num_divisions);
  }
  update_prefix_sum() {
    let prefix_sum = new Float32Array(this.point_data.length / 3);
    let last_sum = 0;
    for (let j = 0; j < prefix_sum.length; j++) {
      let index1 = j * 3;
      let index2 = (index1 + 3) % this.point_data.length;
      let dist = Math.sqrt(
        (this.point_data[index1 + 0] - this.point_data[index2 + 0]) ** 2 + (this.point_data[index1 + 1] - this.point_data[index2 + 1]) ** 2
      );
      last_sum += dist;
      prefix_sum[j] = last_sum;
    }
    this.prefix_sum_data = prefix_sum;
  }
  update_buffer(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.point_data, gl.STATIC_DRAW);
  }
  get_buffer() {
    return this.buffer;
  }
  get_point_count() {
    return this.point_data.length / 3;
  }
  get_scale_vec() {
    return vec3(this.scale, this.scale, this.scale);
  }
  get_matrix() {
    return scalem(vec3(this.scale, this.scale, this.scale));
  }
  get_location_matrix(pos) {
    let line_pos = pos * this.prefix_sum_data.at(-1);
    let point_index = 0;
    while (this.prefix_sum_data[point_index] < line_pos) {
      point_index++;
    }
    let point1_dist = this.prefix_sum_data[point_index - 1] || 0;
    let point2_dist = this.prefix_sum_data[point_index];
    let line_percent = (line_pos - point1_dist) / (point2_dist - point1_dist);
    let next_point_index = (point_index + 1) % this.prefix_sum_data.length;
    let point1 = vec3([...this.point_data.slice(point_index * 3, point_index * 3 + 3)]);
    let point2 = vec3([...this.point_data.slice(next_point_index * 3, next_point_index * 3 + 3)]);
    let final_point = mix(point1, point2, line_percent);
    return translate(mult_vec(final_point, this.get_scale_vec()));
  }
  // draw(gl: WebGL2RenderingContext) {
  //     gl.drawArrays(gl.LINE_LOOP, 0, this.point_data.length / 3);
  // }
}
function chaikin(points, divisions) {
  let old_points = points;
  for (let div_index = 0; div_index < divisions; div_index++) {
    let new_points = new Float32Array(old_points.length * 2);
    for (let j = 0; j < old_points.length; j += 3) {
      let index1 = j;
      let index2 = (j + 3) % old_points.length;
      new_points[j * 2 + 0] = old_points[index1 + 0] * 0.75 + old_points[index2 + 0] * 0.25;
      new_points[j * 2 + 1] = old_points[index1 + 1] * 0.75 + old_points[index2 + 1] * 0.25;
      new_points[j * 2 + 2] = 0;
      new_points[j * 2 + 3] = old_points[index1 + 0] * 0.25 + old_points[index2 + 0] * 0.75;
      new_points[j * 2 + 4] = old_points[index1 + 1] * 0.25 + old_points[index2 + 1] * 0.75;
      new_points[j * 2 + 5] = 0;
    }
    old_points = new_points;
  }
  return old_points;
}

export { Track };

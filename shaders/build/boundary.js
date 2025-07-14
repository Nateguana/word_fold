class Boundary {
  canvas;
  light_switch;
  camera_name;
  camera_rot;
  show_skybox;
  show_shadows;
  show_reflect;
  show_refract;
  car_move;
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.light_switch = document.getElementById("light-switch");
    this.camera_name = document.getElementById("camera-name");
    this.camera_rot = document.getElementById("camera-rot");
    this.show_skybox = document.getElementById("show-skybox");
    this.show_shadows = document.getElementById("show-shadows");
    this.show_reflect = document.getElementById("show-reflect");
    this.show_refract = document.getElementById("show-refract");
    this.car_move = document.getElementById("car-move");
  }
  change_light_type(light_type) {
    this.light_switch.innerText = ["All Light", "Only Ambient", "Full Bright"][light_type];
  }
  change_camera(camera_name) {
    this.camera_name.innerText = camera_name;
  }
  change_camera_rotation(camera_rot) {
    this.camera_rot.innerText = camera_rot + "";
  }
  change_car(car_moving) {
    this.car_move.innerText = ["Off", "On"][Number(car_moving)];
  }
  change_skybox(show_skybox) {
    this.show_skybox.innerText = ["Off", "On"][Number(show_skybox)];
  }
  change_shadows(show_shadows) {
    this.show_shadows.innerText = ["Off", "On"][Number(show_shadows)];
  }
  change_reflect(show_reflect) {
    this.show_reflect.innerText = ["Off", "On"][Number(show_reflect)];
  }
  change_refract(show_refract) {
    this.show_refract.innerText = ["Off", "On"][Number(show_refract)];
  }
  // change_track_points(points: number) {
  //     this.track_points.innerText = points + "";
  // }
  // change_track_divisions(divs: number) {
  //     this.track_div.innerText = divs + "";
  // }
  // change_sphere_divisions(divs: number) {
  //     this.sphere_div.innerText = divs + "";
  // }
  // change_light_position(pos: mv.Vec3) {
  //     this.light_pos.innerText = `(${pos.join(",")})`;
  // }
  // change_camera_position(pos: mv.Vec3) {
  //     this.camera_pos.innerText = `(${pos.join(",")})`;
  // }
  // change_sphere_position(pos: number) {
  //     this.sphere_pos.innerText = pos.toFixed(2);
  // }
  // change_shader(name: string) {
  //     this.shader_name.innerText = name + "";
}

export { Boundary };

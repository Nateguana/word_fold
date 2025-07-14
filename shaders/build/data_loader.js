import { vec2, vec3, mat3, add } from './MV.js';

const NO_UV = vec2(-1, -1);
class DataLoader {
  geometry = {};
  material = {};
  texture = {};
  texture_slots = [];
  async load(gl, data) {
    const promises = data.map((e) => this.fetch_data(gl, e));
    await Promise.all(
      promises
    );
  }
  async fetch_data(gl, data) {
    const response = await fetch(`${data.path}${data.name}.${data.type}`);
    switch (data.type) {
      case "obj":
        await this.add_geometry(gl, data, response);
        break;
      case "mtl":
        await this.add_material(gl, data, response);
        break;
      case "png":
        await this.add_texture(gl, data, response);
        break;
    }
  }
  async add_geometry(gl, data, response) {
    const try_add_geo = (object2, data_array2, material) => {
      if (data_array2.length) {
        if (!this.geometry[object2]) {
          this.geometry[object2] = [];
        }
        let array = new Float32Array(data_array2);
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
        this.geometry[object2].push(new Geometry(object2, array, buffer, materal));
      }
    };
    let file = await response.text();
    let lines = this.split_sanitize_file(file);
    let verts = [];
    let uvs = [];
    let materal = null;
    let object = data.name;
    let data_array = [];
    for (let line of lines) {
      let match = null;
      if (match = line.match(/^v (-?\d.\d+) (-?\d.\d+) (-?\d.\d+) *$/)) {
        verts.push(vec3(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])));
      }
      if (match = line.match(/^vt (\d.\d+) (\d.\d+) *$/)) {
        uvs.push(vec2(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])));
      } else if (match = line.match(/^usemtl +(.+) *$/)) {
        try_add_geo(object, data_array);
        materal = match[1];
      } else if (match = line.match(/^o +(.+) *$/)) {
        try_add_geo(object, data_array);
        object = match[1];
        console.log(data.name, object);
      } else if (match = line.match(/^f +(.+) *$/)) {
        let indices = match[1].split(" ").map((e) => vec3(e.split("/").map(parseFloat)));
        for (let j = 1; j < indices.length - 1; j++) {
          let face_points = [];
          let face_uvs = [];
          for (let i = 0; i < 3; i++) {
            let offset = i ? j + i - 1 : 0;
            face_points.push(verts[indices[offset][0] - 1]);
            let uv_index = indices[offset][1] - 1;
            face_uvs.push(isNaN(uv_index) ? NO_UV : uvs[uv_index]);
          }
          let normal = this.newell(mat3(face_points));
          for (let i = 0; i < 3; i++) {
            data_array.push(...face_points[i]);
            data_array.push(...normal);
            data_array.push(...face_uvs[i]);
          }
        }
      }
    }
    try_add_geo(object, data_array);
  }
  async add_material(_gl, data, response) {
    const try_add_mat = (material2) => {
      if (material2) {
        console.log(`got new materal from ${data.name}:`, material2);
        this.material[material2.name] = material2;
      }
    };
    let file = await response.text();
    let lines = this.split_sanitize_file(file);
    let material = null;
    for (let line of lines) {
      let match = null;
      if (match = line.match(/^newmtl +(.+) *$/)) {
        try_add_mat(material);
        material = new Material(match[1]);
      } else if (match = line.match(/^K([ads]) (\d\.\d+) +(\d\.\d+) +(\d\.\d+) *$/)) {
        const values = vec3(parseFloat(match[2]), parseFloat(match[3]), parseFloat(match[4]));
        switch (match[1]) {
          case "d":
            material.diffuse = values;
            break;
          case "s":
            material.specular = values;
            break;
          case "a":
            material.ambient = values;
            break;
        }
      } else if (match = line.match(/^Ns (\d+\.\d+) *$/)) {
        material.shininess = parseFloat(match[1]);
      } else if (match = line.match(/^map_Kd +(\w+).\w+ *$/)) {
        material.texture = match[1];
      }
    }
    try_add_mat(material);
  }
  async add_texture(gl, data, response) {
    const image = await this.make_image(response);
    const image_type = data.alpha ? gl.RGBA : gl.RGB;
    let texture = this.texture_slots[data.slot];
    let tex;
    if (texture) {
      tex = texture.texture;
    } else {
      tex = gl.createTexture();
      texture = new Texture(data.name, data.slot, tex);
      this.texture[data.name] = texture;
      this.texture_slots[data.slot] = texture;
    }
    texture.images[data.target] = image;
    let is_texture_2d = data.target == "2d";
    let texture_type = is_texture_2d ? gl.TEXTURE_2D : gl.TEXTURE_CUBE_MAP;
    let spec_texture_type = this.get_spec_texture_type(gl, data.target);
    gl.activeTexture(gl.TEXTURE0 + data.slot);
    gl.bindTexture(texture_type, tex);
    gl.texParameteri(texture_type, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(texture_type, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(texture_type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(texture_type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      spec_texture_type,
      0,
      image_type,
      image.width,
      image.height,
      0,
      image_type,
      gl.UNSIGNED_BYTE,
      image
    );
    console.log(`got new texture from ${data.name}:`, texture);
  }
  async make_image(response) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((res) => {
      img.onload = () => res(img);
      img.src = url;
    });
    URL.revokeObjectURL(url);
    return img;
  }
  get_spec_texture_type(gl, target) {
    switch (target) {
      case "2d":
        return gl.TEXTURE_2D;
      case "+x":
        return gl.TEXTURE_CUBE_MAP_POSITIVE_X;
      case "-x":
        return gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
      case "+y":
        return gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
      case "-y":
        return gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
      case "+z":
        return gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
      case "-z":
        return gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
    }
  }
  split_sanitize_file(file) {
    let lines = file.split("\n");
    lines = lines.map((line) => line.trim()).filter((e) => e);
    return lines;
  }
  newell(mat) {
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
}
class Geometry {
  name;
  data;
  materal;
  buffer;
  constructor(name, data, buffer, materal) {
    this.name = name;
    this.data = data;
    this.materal = materal;
    this.buffer = buffer;
  }
  get_buffer() {
    return this.buffer;
  }
}
class Material {
  name;
  diffuse = vec3();
  specular = vec3();
  ambient = vec3();
  shininess = 0;
  texture = "";
  constructor(name) {
    this.name = name;
  }
  get_matrix() {
    return [mat3(this.diffuse, this.specular, this.ambient), this.shininess];
  }
}
class Texture {
  name;
  slot;
  texture;
  images = {};
  constructor(name, slot, texture) {
    this.name = name;
    this.slot = slot;
    this.texture = texture;
  }
}

export { DataLoader, Geometry, Material, Texture };

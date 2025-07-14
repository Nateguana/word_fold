function argumentsToArray(args) {
  return args.flatMap((e) => e).flatMap((e) => e);
}
function radians(degrees2) {
  return degrees2 * Math.PI / 180;
}
function vec2(...args) {
  let result = argumentsToArray(args);
  switch (result.length) {
    case 0:
      result.push(0);
    case 1:
      result.push(0);
  }
  return result.splice(0, 2);
}
function vec3(...args) {
  let result = argumentsToArray(args);
  switch (result.length) {
    case 0:
      result.push(0);
    case 1:
      result.push(0);
    case 2:
      result.push(0);
  }
  return result.splice(0, 3);
}
function vec4(...args) {
  let result = argumentsToArray(args);
  switch (result.length) {
    case 0:
      result.push(0);
    case 1:
      result.push(0);
    case 2:
      result.push(0);
    case 3:
      result.push(1);
  }
  return result.splice(0, 4);
}
function mat3(...args) {
  let v = argumentsToArray(args);
  let m = [];
  switch (v.length) {
    case 0:
      v[0] = 1;
    case 1:
      m = [
        vec3(v[0], 0, 0),
        vec3(0, v[0], 0),
        vec3(0, 0, v[0])
      ];
      break;
    default:
      m.push(vec3(v));
      v.splice(0, 3);
      m.push(vec3(v));
      v.splice(0, 3);
      m.push(vec3(v));
      break;
  }
  let result = m;
  result.matrix = true;
  return result;
}
function mat4(...args) {
  let v = argumentsToArray(args);
  let m = [];
  switch (v.length) {
    case 0:
      v[0] = 1;
    case 1:
      m = [
        vec4(v[0], 0, 0, 0),
        vec4(0, v[0], 0, 0),
        vec4(0, 0, v[0], 0),
        vec4(0, 0, 0, v[0])
      ];
      break;
    case 4:
      m = [
        vec4(v[0], 0, 0, 0),
        vec4(0, v[1], 0, 0),
        vec4(0, 0, v[2], 0),
        vec4(0, 0, 0, v[3])
      ];
      break;
    default:
      m.push(vec4(v));
      v.splice(0, 4);
      m.push(vec4(v));
      v.splice(0, 4);
      m.push(vec4(v));
      v.splice(0, 4);
      m.push(vec4(v));
      break;
  }
  let result = m;
  result.matrix = true;
  return result;
}
function equal(u, v) {
  if (u.length != v.length) {
    return false;
  }
  if (u.matrix && v.matrix) {
    for (let i = 0; i < u.length; ++i) {
      if (u[i].length != v[i].length) {
        return false;
      }
      for (let j = 0; j < u[i].length; ++j) {
        if (u[i][j] !== v[i][j]) {
          return false;
        }
      }
    }
  } else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
    return false;
  } else {
    for (let i = 0; i < u.length; ++i) {
      if (u[i] !== v[i]) {
        return false;
      }
    }
  }
  return true;
}
function add(u, v) {
  if (u.matrix && v.matrix) {
    let m = [];
    if (u.length != v.length) {
      throw "add(): trying to add matrices of different dimensions";
    }
    for (let i = 0; i < u.length; ++i) {
      if (u[i].length != v[i].length) {
        throw "add(): trying to add matrices of different dimensions";
      }
      m.push([]);
      for (let j = 0; j < u[i].length; ++j) {
        m[i].push(u[i][j] + v[i][j]);
      }
    }
    let result = m;
    result.matrix = true;
    return result;
  } else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
    throw "add(): trying to add matrix and non-matrix variables";
  } else if (u.length != v.length) {
    throw "add(): vectors are not the same dimension";
  } else {
    let m = [];
    for (let i = 0; i < u.length; ++i) {
      m.push(u[i] + v[i]);
    }
    return m;
  }
}
function subtract(u, v) {
  if (u.matrix && v.matrix) {
    let m = [];
    if (u.length != v.length) {
      throw "subtract(): trying to subtract matrices of different dimensions";
    }
    for (let i = 0; i < u.length; ++i) {
      if (u[i].length != v[i].length) {
        throw "subtract(): trying to subtact matrices of different dimensions";
      }
      m.push([]);
      for (let j = 0; j < u[i].length; ++j) {
        m[i].push(u[i][j] - v[i][j]);
      }
    }
    let result = m;
    result.matrix = true;
    return result;
  } else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
    throw "subtact(): trying to subtact  matrix and non-matrix variables";
  } else if (u.length != v.length) {
    throw "subtract(): vectors are not the same length";
  } else {
    let m = [];
    for (let i = 0; i < u.length; ++i) {
      m.push(u[i] - v[i]);
    }
    return m;
  }
}
function mult_mat(u, v) {
  if (u.length != v.length) {
    throw "mult_mat(): trying to mult matrices of different dimensions";
  } else {
    let m = [];
    for (let i = 0; i < u.length; ++i) {
      if (u[i].length != v[i].length) {
        throw "mult_mat(): trying to mult matrices of different dimensions";
      }
    }
    for (let i = 0; i < u.length; ++i) {
      m.push([]);
      for (let j = 0; j < v.length; ++j) {
        let sum = 0;
        for (let k = 0; k < u.length; ++k) {
          sum += u[i][k] * v[k][j];
        }
        m[i].push(sum);
      }
    }
    let result = m;
    result.matrix = true;
    return result;
  }
}
function mult_mat_vec(u, v) {
  if (u.length != v.length) {
    throw "mult_mat(): trying to mult matrices and vectors of different dimensions";
  } else {
    let m = [];
    for (let i = 0; i < v.length; i++) {
      let sum = 0;
      for (let j = 0; j < v.length; j++) {
        sum += u[i][j] * v[j];
      }
      m.push(sum);
    }
    return m;
  }
}
function translate(v) {
  let result = mat4();
  result[0][3] = v[0];
  result[1][3] = v[1];
  result[2][3] = v[2];
  return result;
}
function rotateX(theta) {
  let c = Math.cos(radians(theta));
  let s = Math.sin(radians(theta));
  let rx = mat4(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
  return rx;
}
function rotateY(theta) {
  let c = Math.cos(radians(theta));
  let s = Math.sin(radians(theta));
  let ry = mat4(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
  return ry;
}
function rotateZ(theta) {
  let c = Math.cos(radians(theta));
  let s = Math.sin(radians(theta));
  let rz = mat4(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  return rz;
}
function scalem(v) {
  let result = mat4();
  result[0][0] = v[0];
  result[1][1] = v[1];
  result[2][2] = v[2];
  return result;
}
function lookAt(eye, at, up) {
  if (equal(eye, at)) {
    return mat4();
  }
  let v = normalize(subtract(at, eye));
  let n = normalize(cross(v, up));
  let u = normalize(cross(n, v));
  let v2 = negate(v);
  let result = mat4(vec4(n, -dot(n, eye)), vec4(u, -dot(u, eye)), vec4(v2, -dot(v2, eye)), vec4());
  return result;
}
function perspective(fovy, aspect, near, far) {
  let f = 1 / Math.tan(radians(fovy) / 2);
  let d = far - near;
  let result = mat4();
  result[0][0] = f / aspect;
  result[1][1] = f;
  result[2][2] = -20.1 / d;
  result[2][3] = -2 * near * far / d;
  result[3][2] = -1;
  result[3][3] = 0;
  return result;
}
function dot(u, v) {
  if (u.length != v.length) {
    throw "dot(): vectors are not the same dimension";
  }
  let sum = 0;
  for (let i = 0; i < u.length; ++i) {
    sum += u[i] * v[i];
  }
  return sum;
}
function negate(u) {
  let result = [];
  for (let i = 0; i < u.length; ++i) {
    result.push(-u[i]);
  }
  return result;
}
function cross(u, v) {
  let result = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  ];
  return result;
}
function length(u) {
  return Math.sqrt(dot(u, u));
}
function normalize(u, excludeLastComponent = false) {
  let last;
  if (excludeLastComponent) {
    last = u.pop();
  }
  let len = length(u);
  if (!isFinite(len)) {
    throw "normalize: vector " + u + " has zero length";
  }
  for (let i = 0; i < u.length; ++i) {
    u[i] /= len;
  }
  if (excludeLastComponent) {
    u.push(last);
  }
  return u;
}
function det3(m) {
  let d = m[0][0] * m[1][1] * m[2][2] + m[0][1] * m[1][2] * m[2][0] + m[0][2] * m[2][1] * m[1][0] - m[2][0] * m[1][1] * m[0][2] - m[1][0] * m[0][1] * m[2][2] - m[0][0] * m[1][2] * m[2][1];
  return d;
}
function det4(m) {
  let m0 = mat3(
    vec3(m[1][1], m[1][2], m[1][3]),
    vec3(m[2][1], m[2][2], m[2][3]),
    vec3(m[3][1], m[3][2], m[3][3])
  );
  let m1 = mat3(
    vec3(m[1][0], m[1][2], m[1][3]),
    vec3(m[2][0], m[2][2], m[2][3]),
    vec3(m[3][0], m[3][2], m[3][3])
  );
  let m2 = mat3(
    vec3(m[1][0], m[1][1], m[1][3]),
    vec3(m[2][0], m[2][1], m[2][3]),
    vec3(m[3][0], m[3][1], m[3][3])
  );
  let m3 = mat3(
    vec3(m[1][0], m[1][1], m[1][2]),
    vec3(m[2][0], m[2][1], m[2][2]),
    vec3(m[3][0], m[3][1], m[3][2])
  );
  return m[0][0] * det3(m0) - m[0][1] * det3(m1) + m[0][2] * det3(m2) - m[0][3] * det3(m3);
}
function inverse4(m) {
  let a = mat4();
  let d = det4(m);
  let a00 = mat3(
    vec3(m[1][1], m[1][2], m[1][3]),
    vec3(m[2][1], m[2][2], m[2][3]),
    vec3(m[3][1], m[3][2], m[3][3])
  );
  let a01 = mat3(
    vec3(m[1][0], m[1][2], m[1][3]),
    vec3(m[2][0], m[2][2], m[2][3]),
    vec3(m[3][0], m[3][2], m[3][3])
  );
  let a02 = mat3(
    vec3(m[1][0], m[1][1], m[1][3]),
    vec3(m[2][0], m[2][1], m[2][3]),
    vec3(m[3][0], m[3][1], m[3][3])
  );
  let a03 = mat3(
    vec3(m[1][0], m[1][1], m[1][2]),
    vec3(m[2][0], m[2][1], m[2][2]),
    vec3(m[3][0], m[3][1], m[3][2])
  );
  let a10 = mat3(
    vec3(m[0][1], m[0][2], m[0][3]),
    vec3(m[2][1], m[2][2], m[2][3]),
    vec3(m[3][1], m[3][2], m[3][3])
  );
  let a11 = mat3(
    vec3(m[0][0], m[0][2], m[0][3]),
    vec3(m[2][0], m[2][2], m[2][3]),
    vec3(m[3][0], m[3][2], m[3][3])
  );
  let a12 = mat3(
    vec3(m[0][0], m[0][1], m[0][3]),
    vec3(m[2][0], m[2][1], m[2][3]),
    vec3(m[3][0], m[3][1], m[3][3])
  );
  let a13 = mat3(
    vec3(m[0][0], m[0][1], m[0][2]),
    vec3(m[2][0], m[2][1], m[2][2]),
    vec3(m[3][0], m[3][1], m[3][2])
  );
  let a20 = mat3(
    vec3(m[0][1], m[0][2], m[0][3]),
    vec3(m[1][1], m[1][2], m[1][3]),
    vec3(m[3][1], m[3][2], m[3][3])
  );
  let a21 = mat3(
    vec3(m[0][0], m[0][2], m[0][3]),
    vec3(m[1][0], m[1][2], m[1][3]),
    vec3(m[3][0], m[3][2], m[3][3])
  );
  let a22 = mat3(
    vec3(m[0][0], m[0][1], m[0][3]),
    vec3(m[1][0], m[1][1], m[1][3]),
    vec3(m[3][0], m[3][1], m[3][3])
  );
  let a23 = mat3(
    vec3(m[0][0], m[0][1], m[0][2]),
    vec3(m[1][0], m[1][1], m[1][2]),
    vec3(m[3][0], m[3][1], m[3][2])
  );
  let a30 = mat3(
    vec3(m[0][1], m[0][2], m[0][3]),
    vec3(m[1][1], m[1][2], m[1][3]),
    vec3(m[2][1], m[2][2], m[2][3])
  );
  let a31 = mat3(
    vec3(m[0][0], m[0][2], m[0][3]),
    vec3(m[1][0], m[1][2], m[1][3]),
    vec3(m[2][0], m[2][2], m[2][3])
  );
  let a32 = mat3(
    vec3(m[0][0], m[0][1], m[0][3]),
    vec3(m[1][0], m[1][1], m[1][3]),
    vec3(m[2][0], m[2][1], m[2][3])
  );
  let a33 = mat3(
    vec3(m[0][0], m[0][1], m[0][2]),
    vec3(m[1][0], m[1][1], m[1][2]),
    vec3(m[2][0], m[2][1], m[2][2])
  );
  a[0][0] = det3(a00) / d;
  a[0][1] = -det3(a10) / d;
  a[0][2] = det3(a20) / d;
  a[0][3] = -det3(a30) / d;
  a[1][0] = -det3(a01) / d;
  a[1][1] = det3(a11) / d;
  a[1][2] = -det3(a21) / d;
  a[1][3] = det3(a31) / d;
  a[2][0] = det3(a02) / d;
  a[2][1] = -det3(a12) / d;
  a[2][2] = det3(a22) / d;
  a[2][3] = -det3(a32) / d;
  a[3][0] = -det3(a03) / d;
  a[3][1] = det3(a13) / d;
  a[3][2] = -det3(a23) / d;
  a[3][3] = det3(a33) / d;
  return a;
}
function clamp(num, min, max) {
  return Math.max(Math.min(num, max), min);
}
function get_translation(u) {
  return vec3([0, 1, 2].map((e) => u[e][3]));
}

export { add, clamp, cross, det3, det4, dot, equal, get_translation, inverse4, length, lookAt, mat3, mat4, mult_mat, mult_mat_vec, negate, normalize, perspective, radians, rotateX, rotateY, rotateZ, scalem, subtract, translate, vec2, vec3, vec4 };

import { vec3 } from './MV.js';

function get_svg_style(style, stroke = "") {
  let d = document.createElement("div");
  d.className = "base-svg-style";
  d.style.cssText = style;
  if (stroke) {
    d.style.stroke = stroke;
  }
  document.body.appendChild(d);
  let ret = {
    stroke: get_color_from_rgb(window.getComputedStyle(d).stroke)
  };
  document.body.removeChild(d);
  return ret;
}
function get_color_from_rgb(str) {
  return vec3(str.split(/\D+/).filter((e) => e).map((e) => parseInt(e)));
}
function get_color_from_hex(str) {
  let ret = [];
  for (let j = 1; j < str.length; j += 2) {
    ret.push(parseInt(str.slice(j, j + 2), 16));
  }
  return vec3(ret);
}
function color_to_hex(color) {
  let ret = "#";
  for (let num of color) {
    ret += num.toString(16).padStart(2, "0");
  }
  return ret;
}

export { color_to_hex, get_color_from_hex, get_color_from_rgb, get_svg_style };

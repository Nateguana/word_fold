import { mat4 } from './MV.js';
import { color_to_hex, get_svg_style } from './Color.js';

const DEFAULT_DIMS = [0, 0, 400, 400];
const DEFAULT_SVG = `<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
</svg>`;
function xmlGetViewbox(xmlDoc) {
  let splitDims = DEFAULT_DIMS;
  let viewBox = xmlDoc.getElementsByTagName("svg")[0].getAttribute("viewBox");
  if (viewBox !== null) {
    let dims = viewBox.split(" ");
    if (dims.length === 4) {
      let dimsToFloat = dims.map(function(x) {
        return parseFloat(x);
      });
      let res = dimsToFloat.every(function(x) {
        return !isNaN(x);
      });
      if (res) splitDims = dimsToFloat;
    }
  }
  return splitDims;
}
class SvgRenderer {
  is_line_unfinished = false;
  file;
  lines = [];
  viewbox;
  constructor(file = null) {
    if (file) {
      this.file = file;
      this.viewbox = xmlGetViewbox(file);
      this.addLinesFromDoc(file);
    } else {
      this.file = SvgRenderer.parse_xml(DEFAULT_SVG);
      this.viewbox = DEFAULT_DIMS;
    }
  }
  // line methods
  has_unfinished_line() {
    return this.is_line_unfinished;
  }
  start_line(x, y, color) {
    this.lines.push({ x1: x, y1: y, x2: x, y2: y, color });
    this.is_line_unfinished = true;
  }
  update_line(x2, y2) {
    let line = this.lines.at(-1);
    line.x2 = x2;
    line.y2 = y2;
  }
  update_line_color(color) {
    let line = this.lines.at(-1);
    line.color = color;
  }
  finish_line() {
    let line = this.lines.at(-1);
    let node = this.file.createElementNS("http://www.w3.org/2000/svg", "line");
    node.setAttribute("x1", line.x1 + "");
    node.setAttribute("x2", line.x2 + "");
    node.setAttribute("y1", line.y1 + "");
    node.setAttribute("y2", line.y2 + "");
    node.setAttribute("stroke", color_to_hex(line.color));
    node.setAttribute("stroke-width", ".1%");
    this.file.documentElement.appendChild(node);
    this.is_line_unfinished = false;
  }
  //data methods
  get_point_data() {
    let arr = this.lines.flatMap((line) => [line.x1, line.y1, line.x2, line.y2]);
    return new Float32Array(arr);
  }
  get_color_data() {
    let arr = this.lines.flatMap((line) => [...line.color, ...line.color]);
    return new Float32Array(arr);
  }
  get_viewbox_data() {
    return new Float32Array(this.viewbox);
  }
  get_viewbox_transform() {
    return get_world_coordinates_from_viewbox(this.viewbox);
  }
  static from_text(text) {
    return new SvgRenderer(SvgRenderer.parse_xml(text));
  }
  static parse_xml(text) {
    return new DOMParser().parseFromString(text, "text/xml");
  }
  get_xml_blob() {
    return new Blob([new XMLSerializer().serializeToString(this.file.documentElement)], { type: "application/xml" });
  }
  /**
   * Gets the lines to draw from the XML document.
   * add puts them into self
  */
  addLinesFromDoc(xmlDoc) {
    let line_elements = Array.from(xmlDoc.getElementsByTagName("line")) || [];
    for (let line_element of line_elements) {
      let stroke = line_element.getAttribute("stroke") || "";
      let style = line_element.getAttribute("style") || "";
      let color = get_svg_style(style, stroke);
      let line = {
        x1: parse_attribute(line_element, "x1"),
        y1: parse_attribute(line_element, "y1"),
        x2: parse_attribute(line_element, "x2"),
        y2: parse_attribute(line_element, "y2"),
        color: color.stroke
      };
      this.lines.push(line);
    }
  }
}
function parse_attribute(element, name) {
  let number = parseFloat(element.getAttribute(name));
  return isNaN(number) ? 0 : number;
}
function get_world_coordinates_from_viewbox(viewbox) {
  let ret = mat4();
  let max = Math.max(viewbox[2], viewbox[3]);
  ret[0][0] = 2 / max;
  ret[1][1] = -2 / max;
  ret[0][3] = (-2 * viewbox[0] - viewbox[2]) / max;
  ret[1][3] = (2 * viewbox[1] + viewbox[3]) / max;
  return ret;
}

export { SvgRenderer };

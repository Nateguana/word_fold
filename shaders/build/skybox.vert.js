const skybox_vert = "attribute vec2 vPosition;\r\nvarying vec2 V;\r\n\r\nvoid main() {\r\n    V = vPosition;\r\n    gl_Position = vec4(vPosition, 1, 1);\r\n}";

export { skybox_vert as default };

const shadow_vert = "attribute vec3 vPosition;\r\n\r\nuniform mat4 mMatrix;\r\n\r\nvoid main() {\r\n    gl_Position = mMatrix * vec4(vPosition, 1.0);\r\n}";

export { shadow_vert as default };

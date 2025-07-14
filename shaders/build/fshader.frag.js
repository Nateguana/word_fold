const fshader = "precision mediump float;\r\n\r\nvarying vec3 fColor;\r\n\r\nvoid main() {\r\n    gl_FragColor = vec4(fColor, 1.0);\r\n}";

export { fshader as default };

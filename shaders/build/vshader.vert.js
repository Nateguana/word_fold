const vshader = "attribute vec3 vPosition;\r\n\r\nuniform mat4 mModelView;\r\nuniform mat4 mProjection;\r\n\r\nvarying vec3 fColor;\r\n\r\nvoid main() {\r\n    vec4 pos = mModelView * vec4(vPosition, 1.0);\r\n    gl_Position = mProjection * pos;\r\n    fColor = vec3(1.0, 1.0, 1.0);\r\n}\r\n";

export { vshader as default };

const skybox_frag = "precision mediump float;\r\n\r\nuniform mat4 mInverseView;\r\nuniform samplerCube texture;\r\nvarying vec2 V;\r\n\r\nvoid main() {\r\n    vec4 L = mInverseView * vec4(V, 1, 1);\r\n    vec4 fcolor = textureCube(texture, normalize(L.xyz / L.w));\r\n    gl_FragColor = fcolor;// + vec4(1.0, 0.0, 1.0, 1.0);\r\n}";

export { skybox_frag as default };

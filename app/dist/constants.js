"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAvatarsPath = exports.chatAvatarsPath = exports.rootPath = exports.renderPath = exports.jwtConstants = exports.OAuthConstants = void 0;
const path_1 = require("path");
exports.OAuthConstants = {
    clientID: '4d8bdbfc4b56647b57eee634436634f91c17a5cee631f06d1f4c4d3cd83bc9fa',
    clientSecret: '646c443f0039887cd1fa055dcbf55a0321d3e21c392baa5e7dce08115458f701',
    callbackURL: 'http://localhost:3000/login/accept',
};
exports.jwtConstants = {
    secret: 'secretKey',
    twoAuthAppName: 'ft_transcendence',
};
exports.renderPath = '/static/';
exports.rootPath = (0, path_1.join)(process.cwd(), "..", "static");
exports.chatAvatarsPath = (0, path_1.join)(exports.rootPath, "files", "chat");
exports.userAvatarsPath = (0, path_1.join)(exports.rootPath, "files", "user");
//# sourceMappingURL=constants.js.map
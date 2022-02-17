"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtil = void 0;
const bcrypt = require("bcrypt");
class SecurityUtil {
    static hashPassword(pass) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(pass, salt);
    }
    static checkPassword(pass, hashPass) {
        return bcrypt.compareSync(pass, hashPass);
    }
}
exports.SecurityUtil = SecurityUtil;
//# sourceMappingURL=security.util.js.map
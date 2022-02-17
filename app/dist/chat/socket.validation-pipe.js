"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let SocketValidationPipe = class SocketValidationPipe {
    async transform(value, { metatype }) {
        if (this.isEmpty(value)) {
            throw new websockets_1.WsException(`Ошибка валидации`);
        }
        const object = (0, class_transformer_1.plainToClass)(metatype, value);
        const errors = await (0, class_validator_1.validate)(object);
        if (errors.length > 0) {
            throw new websockets_1.WsException(`${this.formatErrors(errors)}`);
        }
        return value;
    }
    isEmpty(value) {
        if (Object.keys(value).length < 1) {
            return true;
        }
        return false;
    }
    formatErrors(errors) {
        return errors.map((error) => {
            for (const key in error.constraints) {
                return error.constraints[key];
            }
        });
    }
};
SocketValidationPipe = __decorate([
    (0, common_1.Injectable)()
], SocketValidationPipe);
exports.SocketValidationPipe = SocketValidationPipe;
//# sourceMappingURL=socket.validation-pipe.js.map
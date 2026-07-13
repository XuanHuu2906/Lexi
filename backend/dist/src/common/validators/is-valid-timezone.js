"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTimeZone = isValidTimeZone;
exports.IsValidTimeZone = IsValidTimeZone;
const class_validator_1 = require("class-validator");
function isValidTimeZone(tz) {
    if (typeof tz !== 'string' || tz.length === 0)
        return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
    }
    catch {
        return false;
    }
}
function IsValidTimeZone(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isValidTimeZone',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    return isValidTimeZone(value);
                },
                defaultMessage() {
                    return 'timeZone must be a valid IANA timezone';
                },
            },
        });
    };
}
//# sourceMappingURL=is-valid-timezone.js.map
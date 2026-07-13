import { registerDecorator, ValidationOptions } from 'class-validator';

/** True if `tz` is an IANA timezone the runtime's Intl accepts. */
export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || tz.length === 0) return false;
  try {
    // Throws RangeError for unknown timezones.
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** class-validator decorator: value must be a valid IANA timezone id. */
export function IsValidTimeZone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTimeZone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isValidTimeZone(value);
        },
        defaultMessage() {
          return 'timeZone must be a valid IANA timezone';
        },
      },
    });
  };
}

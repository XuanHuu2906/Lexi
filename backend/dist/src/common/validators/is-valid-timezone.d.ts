import { ValidationOptions } from 'class-validator';
export declare function isValidTimeZone(tz: unknown): tz is string;
export declare function IsValidTimeZone(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;

package com.lexi.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = IanaTimeZoneValidator.class)
@Target({
    ElementType.FIELD,
    ElementType.PARAMETER,
    ElementType.ANNOTATION_TYPE,
    ElementType.RECORD_COMPONENT,
    ElementType.TYPE_USE
})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidIanaTimeZone {

    String message() default
        "timeZone must be a valid IANA timezone";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
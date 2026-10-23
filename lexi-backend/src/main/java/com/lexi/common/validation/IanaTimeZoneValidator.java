package com.lexi.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.ZoneId;

public class IanaTimeZoneValidator
        implements ConstraintValidator<ValidIanaTimeZone, String> {

    @Override
    public boolean isValid(
            String value,
            ConstraintValidatorContext context) {

        // Field không được gửi lên thì hợp lệ trong PATCH.
        if (value == null) {
            return true;
        }

        return ZoneId.getAvailableZoneIds().contains(value);
    }
}
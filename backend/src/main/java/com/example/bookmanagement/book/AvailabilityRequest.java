package com.example.bookmanagement.book;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AvailabilityRequest(
        @NotNull(message = "is required")
        @Min(value = 0, message = "must be 0 or greater")
        @Max(value = BookLimits.MAX_AVAILABLE_COPIES, message = "must be at most 1000000")
        Integer availableCopies,

        @NotNull(message = "is required")
        Long version) {
}

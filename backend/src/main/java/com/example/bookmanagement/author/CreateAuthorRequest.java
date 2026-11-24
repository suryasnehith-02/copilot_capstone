package com.example.bookmanagement.author;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAuthorRequest(
        @NotBlank(message = "is required")
        @Size(max = 200, message = "must be at most 200 characters")
        String name,

        @Size(max = 2000, message = "must be at most 2000 characters")
        String biography) {

    public CreateAuthorRequest {
        name = name == null ? null : name.trim();
        biography = biography == null || biography.isBlank() ? null : biography.trim();
    }
}

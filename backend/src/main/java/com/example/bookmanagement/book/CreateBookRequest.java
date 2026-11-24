package com.example.bookmanagement.book;

import com.example.bookmanagement.author.CreateAuthorRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBookRequest(
        @NotBlank(message = "is required")
        @Size(max = 300, message = "must be at most 300 characters")
        String title,

        @Size(max = 20, message = "must be at most 20 characters")
        String isbn,

        @Min(value = 0, message = "must be 0 or greater")
        @Max(value = BookLimits.MAX_AVAILABLE_COPIES, message = "must be at most 1000000")
        Integer availableCopies,

        Long authorId,

        @Valid
        CreateAuthorRequest newAuthor) {

    public CreateBookRequest {
        title = title == null ? null : title.trim();
        isbn = isbn == null || isbn.isBlank() ? null : isbn.trim();
        availableCopies = availableCopies == null ? 0 : availableCopies;
    }
}

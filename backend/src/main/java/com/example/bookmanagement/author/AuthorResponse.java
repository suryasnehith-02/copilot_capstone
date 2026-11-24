package com.example.bookmanagement.author;

import java.time.LocalDateTime;

public record AuthorResponse(
        Long id,
        String name,
        String biography,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static AuthorResponse from(Author author) {
        return new AuthorResponse(
                author.getId(),
                author.getName(),
                author.getBiography(),
                author.getCreatedAt(),
                author.getUpdatedAt());
    }
}

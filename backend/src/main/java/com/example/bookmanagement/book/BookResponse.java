package com.example.bookmanagement.book;

import com.example.bookmanagement.author.Author;
import java.time.LocalDateTime;

public record BookResponse(
        Long id,
        String title,
        String isbn,
        int availableCopies,
        AuthorSummary author,
        Long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public record AuthorSummary(Long id, String name) {
    }

    public static BookResponse from(Book book) {
        Author author = book.getAuthor();
        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                book.getAvailableCopies(),
                new AuthorSummary(author.getId(), author.getName()),
                book.getVersion(),
                book.getCreatedAt(),
                book.getUpdatedAt());
    }
}

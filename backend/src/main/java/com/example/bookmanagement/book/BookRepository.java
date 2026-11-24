package com.example.bookmanagement.book;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("select b from Book b join fetch b.author where b.id = :id")
    Optional<Book> findWithAuthorById(@Param("id") Long id);

    @Query("select b from Book b join fetch b.author order by b.title")
    List<Book> findAllWithAuthor();
}

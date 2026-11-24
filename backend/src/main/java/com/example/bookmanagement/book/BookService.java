package com.example.bookmanagement.book;

import com.example.bookmanagement.author.Author;
import com.example.bookmanagement.author.AuthorRepository;
import com.example.bookmanagement.author.AuthorService;
import com.example.bookmanagement.error.ConflictException;
import com.example.bookmanagement.error.InvalidRequestException;
import com.example.bookmanagement.error.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final AuthorService authorService;

    public BookService(BookRepository bookRepository, AuthorRepository authorRepository,
                       AuthorService authorService) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.authorService = authorService;
    }

    @Transactional
    public Book createBook(CreateBookRequest request) {
        if ((request.authorId() == null) == (request.newAuthor() == null)) {
            throw new InvalidRequestException("Provide exactly one of authorId or newAuthor");
        }
        Author author = request.authorId() != null
                ? authorRepository.findById(request.authorId())
                        .orElseThrow(() -> new NotFoundException("Author " + request.authorId() + " was not found"))
                : authorService.createAuthor(request.newAuthor());
        return bookRepository.saveAndFlush(
                new Book(request.title(), request.isbn(), request.availableCopies(), author));
    }

    @Transactional(readOnly = true)
    public List<Book> listBooks() {
        return bookRepository.findAllWithAuthor();
    }

    @Transactional(readOnly = true)
    public Book getBook(Long id) {
        return bookRepository.findWithAuthorById(id)
                .orElseThrow(() -> new NotFoundException("Book " + id + " was not found"));
    }

    @Transactional
    public Book updateAvailability(Long id, AvailabilityRequest request) {
        Book book = bookRepository.findWithAuthorById(id)
                .orElseThrow(() -> new NotFoundException("Book " + id + " was not found"));
        if (!book.getVersion().equals(request.version())) {
            throw new ConflictException("The book was changed by someone else. Reload and try again.");
        }
        book.updateAvailableCopies(request.availableCopies());
        return bookRepository.saveAndFlush(book);
    }
}

package com.example.bookmanagement.author;

import com.example.bookmanagement.error.ConflictException;
import com.example.bookmanagement.error.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @Transactional
    public Author createAuthor(CreateAuthorRequest request) {
        String nameKey = Author.toNameKey(request.name());
        if (authorRepository.existsByNameKey(nameKey)) {
            throw new ConflictException("An author with this name already exists");
        }
        return authorRepository.saveAndFlush(new Author(request.name(), request.biography()));
    }

    @Transactional(readOnly = true)
    public List<Author> listAuthors() {
        return authorRepository.findAll(Sort.by("name"));
    }

    @Transactional(readOnly = true)
    public Author getAuthor(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Author " + id + " was not found"));
    }
}

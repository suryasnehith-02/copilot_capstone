package com.example.bookmanagement.book;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.bookmanagement.BookManagementApplication;
import com.example.bookmanagement.author.CreateAuthorRequest;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.transaction.support.TransactionTemplate;

class BookPersistenceTests {

    @TempDir
    Path tempDir;

    @Test
    void bookAndAuthorSurviveApplicationRestart() {
        String url = "jdbc:h2:file:" + tempDir.toAbsolutePath().toString().replace('\\', '/') + "/persist";
        long bookId;

        try (ConfigurableApplicationContext context = start(url)) {
            BookService service = context.getBean(BookService.class);
            Book created = service.createBook(new CreateBookRequest(
                    "Dune", "9780441013593", 3, null,
                    new CreateAuthorRequest("Frank Herbert", "American author")));
            service.updateAvailability(created.getId(), new AvailabilityRequest(5, created.getVersion()));
            bookId = created.getId();
        }

        try (ConfigurableApplicationContext context = start(url)) {
            BookService service = context.getBean(BookService.class);
            TransactionTemplate tx = context.getBean(TransactionTemplate.class);
            tx.executeWithoutResult(status -> {
                Book reloaded = service.getBook(bookId);
                assertThat(reloaded.getTitle()).isEqualTo("Dune");
                assertThat(reloaded.getIsbn()).isEqualTo("9780441013593");
                assertThat(reloaded.getAvailableCopies()).isEqualTo(5);
                assertThat(reloaded.getAuthor().getName()).isEqualTo("Frank Herbert");
            });
        }
    }

    private ConfigurableApplicationContext start(String url) {
        return new SpringApplicationBuilder(BookManagementApplication.class)
                .web(WebApplicationType.NONE)
                .run("--spring.datasource.url=" + url);
    }
}

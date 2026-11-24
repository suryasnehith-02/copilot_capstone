package com.example.bookmanagement.book;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.bookmanagement.author.Author;
import com.example.bookmanagement.author.AuthorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookApiTests {

    private static final String NEW_AUTHOR_BOOK = """
            {"title":"Dune","isbn":"9780441013593","availableCopies":3,
             "newAuthor":{"name":"Frank Herbert","biography":"American author"}}
            """;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private AuthorRepository authorRepository;

    @MockitoSpyBean
    private BookRepository bookRepository;

    @Test
    void createsBookWithNewAuthorAndReadsItBack() throws Exception {
        String body = mvc.perform(post("/api/books").contentType("application/json").content(NEW_AUTHOR_BOOK))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Dune")))
                .andExpect(jsonPath("$.availableCopies", is(3)))
                .andExpect(jsonPath("$.author.name", is("Frank Herbert")))
                .andReturn().getResponse().getContentAsString();
        String id = body.replaceAll("^\\{\"id\":(\\d+).*", "$1");

        mvc.perform(get("/api/books/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.author.name", is("Frank Herbert")));
    }

    @Test
    void rejectsBookWithoutTitle() throws Exception {
        mvc.perform(post("/api/books").contentType("application/json")
                        .content("{\"availableCopies\":1,\"authorId\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void returnsNotFoundForUnknownBook() throws Exception {
        mvc.perform(get("/api/books/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code", is("NOT_FOUND")));
    }

    @Test
    void updatesAvailabilityWithCurrentVersion() throws Exception {
        String body = mvc.perform(post("/api/books").contentType("application/json")
                        .content("{\"title\":\"Emma\",\"newAuthor\":{\"name\":\"Jane Austen\"}}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = body.replaceAll("^\\{\"id\":(\\d+).*", "$1");
        String version = body.replaceAll("(?s).*\"version\":(\\d+).*", "$1");

        mvc.perform(patch("/api/books/" + id + "/availability").contentType("application/json")
                        .content("{\"availableCopies\":5,\"version\":" + version + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableCopies", is(5)));
    }

    @Test
    void rejectsStaleAvailabilityUpdateWithConflict() throws Exception {
        String body = mvc.perform(post("/api/books").contentType("application/json")
                        .content("{\"title\":\"Ulysses\",\"newAuthor\":{\"name\":\"James Joyce\"}}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = body.replaceAll("^\\{\"id\":(\\d+).*", "$1");

        mvc.perform(patch("/api/books/" + id + "/availability").contentType("application/json")
                        .content("{\"availableCopies\":2,\"version\":99}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.message", containsString("changed")));
    }

    @Test
    void rejectsBookWithBothAuthorIdAndNewAuthor() throws Exception {
        mvc.perform(post("/api/books").contentType("application/json")
                        .content("{\"title\":\"X\",\"authorId\":1,\"newAuthor\":{\"name\":\"Y\"}}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rollsBackInlineAuthorWhenBookSaveFails() throws Exception {
        doThrow(new DataAccessResourceFailureException("simulated failure"))
                .when(bookRepository).saveAndFlush(any(Book.class));

        mvc.perform(post("/api/books").contentType("application/json")
                        .content("{\"title\":\"Rollback Book\",\"newAuthor\":{\"name\":\"Rollback Author\"}}"))
                .andExpect(status().isInternalServerError());

        org.assertj.core.api.Assertions.assertThat(authorRepository.existsByNameKey(Author.toNameKey("Rollback Author")))
                .isFalse();
    }

    @Test
    void rejectsMalformedJsonWithBadRequest() throws Exception {
        mvc.perform(post("/api/books").contentType("application/json").content("{\"title\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void rejectsUnsupportedMediaTypeWithUnsupportedMediaType() throws Exception {
        mvc.perform(post("/api/books").contentType("text/plain").content("title=Dune"))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    void returnsNotFoundWhenAuthorIdDoesNotExist() throws Exception {
        mvc.perform(post("/api/books").contentType("application/json")
                        .content("{\"title\":\"Orphan\",\"authorId\":999999}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code", is("NOT_FOUND")));
    }

    @Test
    void rejectsNegativeAvailableCopiesOnCreate() throws Exception {
        mvc.perform(post("/api/books").contentType("application/json")
                        .content("{\"title\":\"Negative\",\"availableCopies\":-1,\"newAuthor\":{\"name\":\"Neg Author\"}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }
}

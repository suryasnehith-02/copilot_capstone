package com.example.bookmanagement.author;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthorApiTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void createsAuthorAndListsIt() throws Exception {
        mvc.perform(post("/api/authors").contentType("application/json")
                        .content("{\"name\":\"  Ursula K. Le Guin  \",\"biography\":\"Novelist\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Ursula K. Le Guin")));

        mvc.perform(get("/api/authors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Ursula K. Le Guin')]").exists());
    }

    @Test
    void rejectsBlankAuthorName() throws Exception {
        mvc.perform(post("/api/authors").contentType("application/json")
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void rejectsDuplicateAuthorNameIgnoringCase() throws Exception {
        mvc.perform(post("/api/authors").contentType("application/json")
                        .content("{\"name\":\"Octavia Butler\"}"))
                .andExpect(status().isCreated());

        mvc.perform(post("/api/authors").contentType("application/json")
                        .content("{\"name\":\"octavia butler\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("CONFLICT")));
    }
}

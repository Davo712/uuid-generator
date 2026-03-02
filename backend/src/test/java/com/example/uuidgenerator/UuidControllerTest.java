package com.example.uuidgenerator;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UuidControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldGenerateSingleUuid() throws Exception {
        mockMvc.perform(get("/api/uuid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").isString())
                .andExpect(jsonPath("$.version").value("v4"));
    }

    @Test
    void shouldGenerateManyV7Uuids() throws Exception {
        mockMvc.perform(get("/api/generate").param("version", "v7").param("count", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value("v7"))
                .andExpect(jsonPath("$.count").value(3))
                .andExpect(jsonPath("$.uuids.length()").value(3));
    }

    @Test
    void shouldGenerateGuidFormat() throws Exception {
        mockMvc.perform(get("/api/guid").param("count", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.format").value("guid"))
                .andExpect(jsonPath("$.uuid").value(org.hamcrest.Matchers.startsWith("{")));
    }
}

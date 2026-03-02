package com.example.uuidgenerator;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RouteSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest
    @ValueSource(strings = {
            "/",
            "/uuid-generator",
            "/developer-tools",
            "/converters",
            "/generators",
            "/api-docs",
            "/tools/json-formatter",
            "/tools/jwt-decoder",
            "/tools/xml-to-json",
            "/tools/password-generator"
    })
    void shouldServeSpaRoutes(String route) throws Exception {
        mockMvc.perform(get(route))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String forwardedUrl = result.getResponse().getForwardedUrl();
                    boolean ok = "index.html".equals(forwardedUrl) || "/index.html".equals(forwardedUrl);
                    if (!ok) {
                        throw new AssertionError("Unexpected forwarded URL: " + forwardedUrl);
                    }
                });
    }
}

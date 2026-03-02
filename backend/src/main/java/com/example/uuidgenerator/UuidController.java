package com.example.uuidgenerator;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;

@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class UuidController {

    @GetMapping("/uuid")
    public Map<String, Object> generateOne() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("uuid", UUID.randomUUID().toString());
        response.put("generatedAt", Instant.now().toString());
        response.put("version", 4);
        return response;
    }

    @GetMapping("/uuids")
    public Map<String, Object> generateMany(@RequestParam(defaultValue = "5") @Min(1) @Max(100) int count) {
        List<String> uuids = IntStream.range(0, count)
                .mapToObj(i -> UUID.randomUUID().toString())
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("count", count);
        response.put("uuids", uuids);
        response.put("generatedAt", Instant.now().toString());
        response.put("version", 4);
        return response;
    }
}

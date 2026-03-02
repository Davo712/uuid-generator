package com.example.uuidgenerator;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;

@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class UuidController {

    @GetMapping("/uuid")
    public Map<String, Object> generateOne() {
        return generate("v4", 1, false);
    }

    @GetMapping("/uuids")
    public Map<String, Object> generateMany(@RequestParam(defaultValue = "5") @Min(1) @Max(100) int count) {
        return generate("v4", count, false);
    }

    @GetMapping("/generate")
    public Map<String, Object> generate(
            @RequestParam(defaultValue = "v4") String version,
            @RequestParam(defaultValue = "1") @Min(1) @Max(1000) int count,
            @RequestParam(defaultValue = "false") boolean guidFormat
    ) {
        String normalizedVersion = normalizeVersion(version);
        List<String> uuids = IntStream.range(0, count)
                .mapToObj(i -> generateByVersion(normalizedVersion))
                .map(uuid -> guidFormat ? formatGuid(uuid) : uuid)
                .toList();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("version", normalizedVersion);
        response.put("format", guidFormat ? "guid" : "uuid");
        response.put("count", count);
        response.put("uuids", uuids);
        if (count == 1) {
            response.put("uuid", uuids.get(0));
        }
        response.put("generatedAt", Instant.now().toString());
        return response;
    }

    @GetMapping("/version/{version}")
    public Map<String, Object> generateByVersionEndpoint(
            @PathVariable String version,
            @RequestParam(defaultValue = "1") @Min(1) @Max(1000) int count
    ) {
        return generate(version, count, false);
    }

    @GetMapping("/guid")
    public Map<String, Object> generateGuid(@RequestParam(defaultValue = "1") @Min(1) @Max(1000) int count) {
        return generate("v4", count, true);
    }

    private String normalizeVersion(String version) {
        String normalized = version.toLowerCase(Locale.ROOT).trim();
        return switch (normalized) {
            case "1", "v1" -> "v1";
            case "4", "v4", "uuid", "random" -> "v4";
            case "7", "v7" -> "v7";
            case "nil", "v0" -> "nil";
            case "guid" -> "v4";
            default -> "v4";
        };
    }

    private String generateByVersion(String version) {
        return switch (version) {
            case "v1" -> generatePseudoV1();
            case "v7" -> generatePseudoV7();
            case "nil" -> "00000000-0000-0000-0000-000000000000";
            default -> UUID.randomUUID().toString();
        };
    }

    private String generatePseudoV1() {
        long time = ZonedDateTime.now(ZoneOffset.UTC).toInstant().toEpochMilli();
        long msb = (time & 0xFFFFFFFFL) << 32;
        msb |= ((time >> 32) & 0xFFFFL) << 16;
        msb |= 0x1000L | ((time >> 48) & 0x0FFFL);
        long lsb = (UUID.randomUUID().getLeastSignificantBits() & 0x3FFFFFFFFFFFFFFFL) | 0x8000000000000000L;
        return new UUID(msb, lsb).toString();
    }

    private String generatePseudoV7() {
        long unixMs = Instant.now().toEpochMilli();
        long randA = UUID.randomUUID().getMostSignificantBits() & 0x0FFFL;
        long msb = ((unixMs & 0xFFFFFFFFFFFFL) << 16) | 0x7000L | randA;
        long randB = UUID.randomUUID().getLeastSignificantBits() & 0x3FFFFFFFFFFFFFFFL;
        long lsb = randB | 0x8000000000000000L;
        return new UUID(msb, lsb).toString();
    }

    private String formatGuid(String uuid) {
        return "{" + uuid.toUpperCase(Locale.ROOT) + "}";
    }
}

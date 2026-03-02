package com.example.uuidgenerator;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaPageController {

    @GetMapping({
            "/version1",
            "/version4",
            "/version7",
            "/nil",
            "/guid",
            "/dev-corner",
            "/api-docs",
            "/dev/java",
            "/dev/javascript",
            "/dev/python",
            "/dev/go",
            "/dev/csharp",
            "/dev/php",
            "/dev/ruby",
            "/dev/kotlin"
    })
    public String index() {
        return "forward:/index.html";
    }
}

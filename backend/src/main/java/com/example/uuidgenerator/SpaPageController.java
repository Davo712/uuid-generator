package com.example.uuidgenerator;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaPageController {

    @GetMapping({
            "/uuid-generator",
            "/developer-tools",
            "/converters",
            "/generators",
            "/api-docs",
            "/dev-corner",
            "/version1",
            "/version4",
            "/version7",
            "/nil",
            "/guid",
            "/tools/{*path}"
    })
    public String index() {
        return "forward:/index.html";
    }
}

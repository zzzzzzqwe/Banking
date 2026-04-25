package com.example.Banking.budget.controller;

import com.example.Banking.budget.model.Category;
import com.example.Banking.budget.model.CategoryType;
import com.example.Banking.budget.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoryResponse> list(Authentication auth) {
        return service.listForUser(UUID.fromString(auth.getName())).stream().map(this::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@RequestBody Map<String, String> body, Authentication auth) {
        var c = service.create(
                UUID.fromString(auth.getName()),
                body.get("code"),
                body.get("name"),
                body.get("icon"),
                body.get("color"),
                body.get("type") == null ? CategoryType.EXPENSE : CategoryType.valueOf(body.get("type"))
        );
        return toResponse(c);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable("id") UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        var c = service.update(id, UUID.fromString(auth.getName()), body.get("name"), body.get("icon"), body.get("color"));
        return toResponse(c);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id, Authentication auth) {
        service.delete(id, UUID.fromString(auth.getName()));
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getCode(), c.getName(), c.getIcon(), c.getColor(),
                c.getType().name(), c.isSystem());
    }
}

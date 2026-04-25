package com.example.Banking.budget.service;

import com.example.Banking.budget.model.Category;
import com.example.Banking.budget.model.CategoryType;
import com.example.Banking.budget.repository.CategoryRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    public List<Category> listForUser(UUID userId) {
        return repo.findVisibleForUser(userId);
    }

    public Category create(UUID userId, String code, String name, String icon, String color, CategoryType type) {
        if (code == null || code.isBlank()) throw new IllegalArgumentException("code required");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("name required");
        var c = new Category(UUID.randomUUID(), userId, code.toUpperCase(), name, icon, color,
                type == null ? CategoryType.EXPENSE : type, false, LocalDateTime.now());
        return repo.save(c);
    }

    public Category update(UUID id, UUID userId, String name, String icon, String color) {
        var c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (c.isSystem() || c.getUserId() == null) throw new AccessDeniedException("Cannot edit system category");
        if (!c.getUserId().equals(userId)) throw new AccessDeniedException("Access denied");
        if (name != null) c.setName(name);
        if (icon != null) c.setIcon(icon);
        if (color != null) c.setColor(color);
        return repo.save(c);
    }

    public void delete(UUID id, UUID userId) {
        var c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (c.isSystem() || c.getUserId() == null) throw new AccessDeniedException("Cannot delete system category");
        if (!c.getUserId().equals(userId)) throw new AccessDeniedException("Access denied");
        repo.delete(c);
    }
}

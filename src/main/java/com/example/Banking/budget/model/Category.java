package com.example.Banking.budget.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "categories", uniqueConstraints = {
        @UniqueConstraint(name = "uq_category_user_code", columnNames = {"user_id", "code"})
}, indexes = {
        @Index(name = "idx_categories_user", columnList = "user_id")
})
public class Category {

    @Id
    @Column(nullable = false)
    private UUID id;

    /** Null = system category (visible to all users). */
    @Column(name = "user_id")
    private UUID userId;

    /** Stable identifier referenced by AccountTransaction.category. */
    @Column(nullable = false, length = 32)
    private String code;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(length = 24)
    private String icon;

    @Column(length = 16)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CategoryType type;

    @Column(name = "is_system", nullable = false)
    private boolean system;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected Category() {}

    public Category(UUID id, UUID userId, String code, String name, String icon, String color,
                    CategoryType type, boolean system, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.code = code;
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.type = type;
        this.system = system;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getIcon() { return icon; }
    public String getColor() { return color; }
    public CategoryType getType() { return type; }
    public boolean isSystem() { return system; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setIcon(String icon) { this.icon = icon; }
    public void setColor(String color) { this.color = color; }
}

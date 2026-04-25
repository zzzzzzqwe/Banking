package com.example.Banking.budget.repository;

import com.example.Banking.budget.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("select c from Category c where c.userId is null or c.userId = ?1 order by c.system desc, c.name asc")
    List<Category> findVisibleForUser(UUID userId);

    Optional<Category> findByCodeAndUserIdIsNull(String code);
    boolean existsByCode(String code);
}

package com.example.Banking.budget.controller;

import com.example.Banking.budget.model.Budget;
import com.example.Banking.budget.model.BudgetPeriod;
import com.example.Banking.budget.model.Category;
import com.example.Banking.budget.repository.CategoryRepository;
import com.example.Banking.budget.service.BudgetService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;
    private final CategoryRepository categoryRepo;

    public BudgetController(BudgetService service, CategoryRepository categoryRepo) {
        this.service = service;
        this.categoryRepo = categoryRepo;
    }

    @GetMapping
    public List<BudgetResponse> list(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        var budgets = service.listForUser(userId);
        var catIds = budgets.stream().map(Budget::getCategoryId).collect(Collectors.toSet());
        var catMap = categoryRepo.findAllById(catIds).stream().collect(Collectors.toMap(Category::getId, c -> c));
        return budgets.stream().map(b -> toResponse(b, catMap.get(b.getCategoryId()))).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetResponse create(@RequestBody CreateBudgetRequest req, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        var b = service.create(userId,
                UUID.fromString(req.categoryId),
                BudgetPeriod.valueOf(req.period == null ? "MONTHLY" : req.period),
                new BigDecimal(req.limitAmount),
                req.currency == null ? "USD" : req.currency,
                req.alertThreshold == null ? null : new BigDecimal(req.alertThreshold));
        var cat = categoryRepo.findById(b.getCategoryId()).orElse(null);
        return toResponse(b, cat);
    }

    @PutMapping("/{id}")
    public BudgetResponse update(@PathVariable("id") UUID id, @RequestBody Map<String, Object> body, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        BigDecimal limit = body.get("limitAmount") == null ? null : new BigDecimal(body.get("limitAmount").toString());
        BudgetPeriod period = body.get("period") == null ? null : BudgetPeriod.valueOf(body.get("period").toString());
        BigDecimal alert = body.get("alertThreshold") == null ? null : new BigDecimal(body.get("alertThreshold").toString());
        var b = service.update(id, userId, limit, period, alert);
        var cat = categoryRepo.findById(b.getCategoryId()).orElse(null);
        return toResponse(b, cat);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id, Authentication auth) {
        service.delete(id, UUID.fromString(auth.getName()));
    }

    private BudgetResponse toResponse(Budget b, Category cat) {
        var p = service.computeProgress(b);
        return new BudgetResponse(
                b.getId(),
                b.getCategoryId(),
                cat == null ? null : cat.getCode(),
                cat == null ? null : cat.getName(),
                cat == null ? null : cat.getIcon(),
                cat == null ? null : cat.getColor(),
                b.getPeriod().name(),
                b.getLimitAmount(),
                b.getCurrency(),
                b.getAlertThreshold(),
                b.getStartDate(),
                p.spent(),
                p.remaining(),
                p.percentUsed(),
                p.periodStart(),
                p.periodEnd()
        );
    }

    public static class CreateBudgetRequest {
        @NotBlank public String categoryId;
        public String period;
        @NotBlank public String limitAmount;
        public String currency;
        public String alertThreshold;
    }
}

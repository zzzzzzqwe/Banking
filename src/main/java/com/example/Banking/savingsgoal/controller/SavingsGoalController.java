package com.example.Banking.savingsgoal.controller;

import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.service.AuditService;
import com.example.Banking.savingsgoal.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping(value = "/api/savings-goals", produces = APPLICATION_JSON_VALUE)
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;
    private final AuditService auditService;

    public SavingsGoalController(SavingsGoalService savingsGoalService, AuditService auditService) {
        this.savingsGoalService = savingsGoalService;
        this.auditService = auditService;
    }

    @GetMapping
    public List<SavingsGoalResponse> list(Authentication auth) {
        return savingsGoalService.listGoals(auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavingsGoalResponse create(@RequestBody @Valid CreateSavingsGoalRequest request,
                                      Authentication auth) {
        var goal = savingsGoalService.createGoal(
                auth.getName(),
                request.accountId(),
                request.name(),
                request.description(),
                request.targetAmount()
        );
        auditService.log(UUID.fromString(auth.getName()), AuditAction.SAVINGS_GOAL_CREATED,
                "SavingsGoal", goal.id(), request.name());
        return goal;
    }

    @PostMapping("/{id}/deposit")
    public SavingsGoalResponse deposit(@PathVariable UUID id,
                                       @RequestBody @Valid AmountRequest request,
                                       Authentication auth) {
        var goal = savingsGoalService.deposit(id, auth.getName(), request.amount());
        auditService.log(UUID.fromString(auth.getName()), AuditAction.SAVINGS_GOAL_DEPOSIT,
                "SavingsGoal", id, String.valueOf(request.amount()));
        return goal;
    }

    @PostMapping("/{id}/withdraw")
    public SavingsGoalResponse withdraw(@PathVariable UUID id,
                                        @RequestBody @Valid AmountRequest request,
                                        Authentication auth) {
        var goal = savingsGoalService.withdraw(id, auth.getName(), request.amount());
        auditService.log(UUID.fromString(auth.getName()), AuditAction.SAVINGS_GOAL_WITHDRAW,
                "SavingsGoal", id, String.valueOf(request.amount()));
        return goal;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication auth) {
        savingsGoalService.deleteGoal(id, auth.getName());
    }
}

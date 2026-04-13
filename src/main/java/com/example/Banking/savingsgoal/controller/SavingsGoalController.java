package com.example.Banking.savingsgoal.controller;

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

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    public List<SavingsGoalResponse> list(Authentication auth) {
        return savingsGoalService.listGoals(auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavingsGoalResponse create(@RequestBody @Valid CreateSavingsGoalRequest request,
                                      Authentication auth) {
        return savingsGoalService.createGoal(
                auth.getName(),
                request.accountId(),
                request.name(),
                request.description(),
                request.targetAmount()
        );
    }

    @PostMapping("/{id}/deposit")
    public SavingsGoalResponse deposit(@PathVariable UUID id,
                                       @RequestBody @Valid AmountRequest request,
                                       Authentication auth) {
        return savingsGoalService.deposit(id, auth.getName(), request.amount());
    }

    @PostMapping("/{id}/withdraw")
    public SavingsGoalResponse withdraw(@PathVariable UUID id,
                                        @RequestBody @Valid AmountRequest request,
                                        Authentication auth) {
        return savingsGoalService.withdraw(id, auth.getName(), request.amount());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication auth) {
        savingsGoalService.deleteGoal(id, auth.getName());
    }
}

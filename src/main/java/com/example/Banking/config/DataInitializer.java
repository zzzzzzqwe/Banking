package com.example.Banking.config;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.budget.model.Category;
import com.example.Banking.budget.model.CategoryType;
import com.example.Banking.budget.repository.CategoryRepository;
import com.example.Banking.user.model.Role;
import com.example.Banking.user.model.User;
import com.example.Banking.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final EntityManager entityManager;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AccountRepository accountRepository,
                           CategoryRepository categoryRepository,
                           EntityManager entityManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        fixAccountsStatusConstraint();
        if (!userRepository.existsByEmail("admin@bank.local")) {
            var admin = new User(
                    UUID.randomUUID(),
                    "admin@bank.local",
                    passwordEncoder.encode("admin123"),
                    "Bank",
                    "Admin",
                    true,
                    Role.ADMIN,
                    LocalDateTime.now()
            );
            userRepository.save(admin);
            System.out.println("Default admin created: admin@bank.local / admin123");
        }

        backfillCardMetadata();
        seedSystemCategories();
    }

    private void fixAccountsStatusConstraint() {
        try {
            entityManager.createNativeQuery(
                    "ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_status_check"
            ).executeUpdate();
            entityManager.createNativeQuery(
                    "ALTER TABLE accounts ADD CONSTRAINT accounts_status_check CHECK (status IN ('ACTIVE','BLOCKED','CLOSED'))"
            ).executeUpdate();
        } catch (Exception e) {
            System.out.println("Could not update accounts_status_check: " + e.getMessage());
        }
    }

    private void backfillCardMetadata() {
        int updated = 0;
        for (Account a : accountRepository.findAll()) {
            boolean changed = false;
            if (a.getExpiryDate() == null) {
                a.setExpiryDate(LocalDate.now().plusYears(4));
                changed = true;
            }
            if (a.getHolderName() == null || a.getHolderName().isBlank()) {
                String holder = userRepository.findById(a.getOwnerId())
                        .map(u -> (u.getFirstName() + " " + u.getLastName()).toUpperCase())
                        .orElse("CARDHOLDER");
                a.setHolderName(holder);
                changed = true;
            }
            if (a.getCardType() == null || a.getCardType().isBlank()) {
                a.setCardType("PHYSICAL");
                changed = true;
            }
            if (changed) {
                accountRepository.save(a);
                updated++;
            }
        }
        if (updated > 0) System.out.println("Backfilled card metadata for " + updated + " rows");
    }

    private void seedSystemCategories() {
        Object[][] seeds = {
                {"SALARY",        "Salary",        "💼", "#10b981", CategoryType.INCOME},
                {"BONUS",         "Bonus",         "🎁", "#22c55e", CategoryType.INCOME},
                {"REFUND",        "Refund",        "↩️", "#84cc16", CategoryType.INCOME},
                {"GROCERIES",     "Groceries",     "🛒", "#f59e0b", CategoryType.EXPENSE},
                {"TRANSPORT",     "Transport",     "🚗", "#3b82f6", CategoryType.EXPENSE},
                {"ENTERTAINMENT", "Entertainment", "🎬", "#ec4899", CategoryType.EXPENSE},
                {"UTILITIES",     "Utilities",     "💡", "#06b6d4", CategoryType.EXPENSE},
                {"HEALTHCARE",    "Healthcare",    "🏥", "#ef4444", CategoryType.EXPENSE},
                {"EDUCATION",     "Education",     "📚", "#8b5cf6", CategoryType.EXPENSE},
                {"SHOPPING",      "Shopping",      "🛍️", "#f97316", CategoryType.EXPENSE},
                {"RESTAURANT",    "Restaurants",   "🍽️", "#eab308", CategoryType.EXPENSE},
                {"TRANSFER",      "Transfer",      "🔁", "#94a3b8", CategoryType.EXPENSE},
                {"EXCHANGE",      "Exchange",      "💱", "#a855f7", CategoryType.EXPENSE},
                {"LOAN",          "Loan",          "💳", "#0ea5e9", CategoryType.EXPENSE},
                {"OTHER",         "Other",         "📦", "#64748b", CategoryType.EXPENSE},
        };
        int created = 0;
        int updated = 0;
        for (Object[] s : seeds) {
            String code = (String) s[0];
            String icon = (String) s[2];
            var existing = categoryRepository.findByCodeAndUserIdIsNull(code);
            if (existing.isPresent()) {
                Category cat = existing.get();
                if (cat.getIcon() == null || !cat.getIcon().equals(icon)) {
                    cat.setIcon(icon);
                    categoryRepository.save(cat);
                    updated++;
                }
                continue;
            }
            categoryRepository.save(new Category(
                    UUID.randomUUID(), null, code,
                    (String) s[1], icon, (String) s[3],
                    (CategoryType) s[4], true, LocalDateTime.now()
            ));
            created++;
        }
        if (created > 0) System.out.println("Seeded " + created + " system categories");
        if (updated > 0) System.out.println("Updated icons for " + updated + " system categories");
    }
}

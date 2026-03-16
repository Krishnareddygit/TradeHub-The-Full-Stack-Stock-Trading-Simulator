package com.trading.platform.margin.service;

import com.trading.platform.user.entity.User;
import com.trading.platform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class WalletService {

    private final UserRepository userRepository;

    public void deposit(String username, BigDecimal amount) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new RuntimeException("Invalid amount");

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        user.setBalance(user.getBalance().add(amount));

        userRepository.save(user);
    }

    public void withdraw(String username, BigDecimal amount) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new RuntimeException("Invalid amount");

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        if (user.getBalance().compareTo(amount) < 0)
            throw new RuntimeException("Insufficient balance");

        user.setBalance(user.getBalance().subtract(amount));

        userRepository.save(user);
    }
}
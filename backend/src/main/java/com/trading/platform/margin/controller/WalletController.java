package com.trading.platform.margin.controller;

import com.trading.platform.margin.dto.AmountRequest;
import com.trading.platform.margin.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody AmountRequest req,
                                     Authentication auth) {

        walletService.deposit(auth.getName(), req.getAmount());

        return ResponseEntity.ok("Deposit successful");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody AmountRequest req,
                                      Authentication auth) {

        walletService.withdraw(auth.getName(), req.getAmount());

        return ResponseEntity.ok("Withdraw successful");
    }
}
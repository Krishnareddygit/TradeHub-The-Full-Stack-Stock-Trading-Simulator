package com.trading.platform.admin.controller;

import com.trading.platform.admin.service.AdminService;
import com.trading.platform.user.entity.User;
import com.trading.platform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminService adminService;
    private final UserRepository userRepository;// ADD THIS

    // GET ALL USERS (IMPORTANT)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAllRealUsers();
    }

    // Delete user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Pause trading
    @PostMapping("/{id}/pause")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> pauseTrading(@PathVariable Long id) {
        adminService.pauseTrading(id);
        return ResponseEntity.ok("User trading paused");
    }

    // Resume trading
    @PostMapping("/{id}/resume")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> resumeTrading(@PathVariable Long id) {
        adminService.resumeTrading(id);
        return ResponseEntity.ok("User trading resumed");
    }
}
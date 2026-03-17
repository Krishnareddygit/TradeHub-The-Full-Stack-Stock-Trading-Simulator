package com.trading.platform.admin.service;

import com.trading.platform.admin.dto.CreateStockRequest;
import com.trading.platform.stock.service.StockService;
import com.trading.platform.user.entity.User;
import com.trading.platform.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.trading.platform.notification.repository.NotificationRepository;
import com.trading.platform.order.repository.OrderRepository;
import com.trading.platform.portfolio.repository.PortfolioRepository;
import com.trading.platform.watchlist.repository.WatchlistRepository;
import com.trading.platform.trade.repository.TradeRepository;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StockService stockService;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final OrderRepository orderRepository;
    private final PortfolioRepository portfolioRepository;
    private final TradeRepository tradeRepository;
    private final WatchlistRepository watchlistRepository;

    // ---------------- STOCK OPERATIONS ----------------
    public void addStock(CreateStockRequest request) {
        stockService.createStock(request);
    }

    public void deleteStock(Long stockId) {
        stockService.deleteStock(stockId);
    }

    public void enableTrading(Long stockId) {
        stockService.enableTrading(stockId);
    }

    public void disableTrading(Long stockId) {
        stockService.disableTrading(stockId);
    }

    // ---------------- USER OPERATIONS ----------------

    // ❌ Delete user
    @Transactional
    public void deleteUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔥 DELETE IN CORRECT ORDER (VERY IMPORTANT)
        notificationRepository.deleteByUserId(userId);
        watchlistRepository.deleteByUserId(userId);
        tradeRepository.deleteByUserId(userId);
        orderRepository.deleteByUserId(userId);
        portfolioRepository.deleteByUserId(userId);

        // ✅ finally delete user
        userRepository.delete(user);
    }

    // ⏸ Pause trading
    public void pauseTrading(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTradingEnabled(false);
        userRepository.save(user);
    }

    // ▶ Resume trading
    public void resumeTrading(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTradingEnabled(true);
        userRepository.save(user);
    }
}
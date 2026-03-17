package com.trading.platform.portfolio.repository;

import com.trading.platform.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    Optional<Portfolio> findByUserIdAndStockId(Long userId, Long stockId);
    List<Portfolio> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM Portfolio p WHERE p.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

}

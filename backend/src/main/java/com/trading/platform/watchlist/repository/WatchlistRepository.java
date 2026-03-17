package com.trading.platform.watchlist.repository;

import com.trading.platform.watchlist.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserId(Long userId);
    Optional<Watchlist> findByUserIdAndStockId(Long userId, Long stockId);

    @Modifying
    @Query("DELETE FROM Watchlist w WHERE w.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

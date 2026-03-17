package com.trading.platform.trade.repository;

import com.trading.platform.trade.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByBuyerIdOrSellerIdOrderByExecutedAtDesc(Long buyerId, Long sellerId);

    @Modifying
    @Query("DELETE FROM Trade t WHERE t.buyer.id = :userId OR t.seller.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

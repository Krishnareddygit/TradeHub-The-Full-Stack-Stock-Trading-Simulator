package com.trading.platform.margin.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AmountRequest {

    private BigDecimal amount;

}
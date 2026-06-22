package com.hotelreservation.modules.billing.service;

import static com.hotelreservation.modules.billing.dto.BillingResponses.*;
import java.util.List;

public interface BillService {
    List<BillResponse> getByResId(String resId);
    List<BillResponse> getByResRoomId(String resRoomId);
    void ConfirmedPaidBillsForResId(String resId);
    void ConfirmedPaidBillsForResRoomId(String resRoomId);
    ResRoomBillResponse createResRoomBillSummary(String resRoomId);
    ReservationBillResponse createReservationBillSummary(String resId);
    List<ReservationBillSummaryProjection> getReservationBillSummaries();
}
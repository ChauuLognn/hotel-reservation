package com.hotelreservation.module.billing.service;

import com.hotelreservation.module.billing.dto.response.BillResponse;
import com.hotelreservation.module.billing.dto.response.ResRoomBillResponse;
import com.hotelreservation.module.billing.dto.response.ReservationBillResponse;
import java.util.List;

public interface BillService {
    List<BillResponse> getByResId(String resId);
    List<BillResponse> getByResRoomId(String resRoomId);
    void ConfirmedPaidBillsForResId(String resId);
    void ConfirmedPaidBillsForResRoomId(String resRoomId);
    ResRoomBillResponse createResRoomBillSummary(String resRoomId);
    ReservationBillResponse createReservationBillSummary(String resId);
}
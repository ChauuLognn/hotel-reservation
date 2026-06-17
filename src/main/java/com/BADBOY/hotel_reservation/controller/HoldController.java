// package com.BADBOY.hotel_reservation.controller;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.BADBOY.hotel_reservation.dto.reservation.CreateHoldRequest;
// import com.BADBOY.hotel_reservation.dto.reservation.HoldResponse;
// import com.BADBOY.hotel_reservation.service.RoomHoldDomain;

// import jakarta.validation.Valid;

// @RestController
// @RequestMapping("/holds")
// public class HoldController {
//     @Autowired
//     private RoomHoldDomain holdDomain;
    
//     // tạo bản nháp trước khi khách xác nhận là muốn đặt reservation này
//     // nếu chốt bản nháp này thì reservation.status là PENDING_PAYMENT chứ chưa phải CONFIRMED
//     @PostMapping
//     public HoldResponse createHold(@RequestBody @Valid CreateHoldRequest req) {
//         return holdDomain.createHold(req);
//     }
    
//     // các bản nháp này sẽ được xóa tự động nếu khách chốt hoặc hết thời gian giữ chỗ
// }

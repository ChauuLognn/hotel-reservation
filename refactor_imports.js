const fs = require('fs');
const path = require('path');

const srcDir = 'src';

// Map of exact import migrations or package transformations
const packageReplacements = [
    { from: /import\s+modules\.account\.\*;/g, to: 'import com.hotelreservation.module.account.*;' },
    { from: /import\s+modules\.room\.\*;/g, to: 'import com.hotelreservation.module.room.*;' },
    { from: /import\s+modules\.reservation\.\*;/g, to: 'import com.hotelreservation.module.reservation.*;' },
    { from: /import\s+modules\.billing\.\*;/g, to: 'import com.hotelreservation.module.billing.*;' },
    { from: /import\s+modules\.hotel_service\.\*;/g, to: 'import com.hotelreservation.module.hotelservice.*;' },
    { from: /import\s+modules\.service\.\*;/g, to: 'import com.hotelreservation.module.hotelservice.*;' },
    { from: /import\s+modules\.report\.\*;/g, to: 'import com.hotelreservation.module.report.*;' },
    { from: /import\s+common\.enums\.\*;/g, to: 'import com.hotelreservation.common.enums.*;' },
    { from: /import\s+common\.payload\.\*;/g, to: 'import com.hotelreservation.common.payload.*;' },
    { from: /import\s+exception\.\*;/g, to: 'import com.hotelreservation.common.exception.*;' },
    { from: /import\s+config\.\*;/g, to: 'import com.hotelreservation.config.*;' },
    { from: /import\s+security\.\*;/g, to: 'import com.hotelreservation.security.*;' },
    { from: /import\s+scheduler\.\*;/g, to: 'import com.hotelreservation.scheduler.*;' },

    // Flattening / structural package moves
    { from: /modules\.account/g, to: 'com.hotelreservation.module.account' },
    { from: /modules\.room/g, to: 'com.hotelreservation.module.room' },
    { from: /modules\.reservation/g, to: 'com.hotelreservation.module.reservation' },
    { from: /modules\.billing/g, to: 'com.hotelreservation.module.billing' },
    { from: /modules\.hotel_service/g, to: 'com.hotelreservation.module.hotelservice' },
    { from: /modules\.service/g, to: 'com.hotelreservation.module.hotelservice' },
    { from: /modules\.report/g, to: 'com.hotelreservation.module.report' },
    { from: /com\.hotelreservation\.module\.service/g, to: 'com.hotelreservation.module.hotelservice' },

    // DTO imports updates
    { from: /dto\.EmpPayload\.EmpCreationRequest/g, to: 'dto.request.EmpCreateRequest' },
    { from: /dto\.EmpPayload\.EmpDto/g, to: 'dto.response.EmpResponse' },
    { from: /dto\.GuestPayload\.GuestCreationRequest/g, to: 'dto.request.GuestCreateRequest' },
    { from: /dto\.GuestPayload\.GuestDto/g, to: 'dto.response.GuestResponse' },
    { from: /dto\.UserPayload\.UserCreationRequest/g, to: 'dto.request.UserCreateRequest' },
    { from: /dto\.UserPayload\.ChangePasswordRequest/g, to: 'dto.request.ChangePasswordRequest' },
    { from: /dto\.UserPayload\.CreateUserRequest/g, to: 'dto.request.AdminCreateUserRequest' },
    { from: /dto\.UserPayload\.UserDto/g, to: 'dto.response.UserResponse' },
    { from: /dto\.RoomPayload\.RoomCreateRequest/g, to: 'dto.request.CreateRoomRequest' },
    { from: /dto\.RoomPayload\.RoomDto/g, to: 'dto.response.RoomResponse' },
    { from: /dto\.RoomPayload\.RoomTypeCreateRequest/g, to: 'dto.request.CreateRoomTypeRequest' },
    { from: /dto\.RoomPayload\.RoomTypeDto/g, to: 'dto.response.RoomTypeResponse' },
    { from: /dto\.ReservationPayload\.AvailableRoom/g, to: 'dto.response.AvailableRoomResponse' },
    { from: /dto\.ReservationPayload\.CreateHoldRequest/g, to: 'dto.request.CreateReservationRequest' },
    { from: /dto\.ReservationPayload\.ReservationDto/g, to: 'dto.response.ReservationResponse' },
    { from: /dto\.ReservationPayload\.ReservationRoomDto/g, to: 'dto.response.ReservationRoomResponse' },
    { from: /dto\.ReservationPayload\.ReservationGuestDto/g, to: 'dto.response.ReservationGuestResponse' },
    { from: /dto\.ReservationPayload\.GuestStayDto/g, to: 'dto.response.GuestStayResponse' },
    { from: /dto\.ReservationPayload\.ChangeStatusRequest/g, to: 'dto.request.ChangeStatusRequest' },
    { from: /dto\.ReservationPayload\.StatusHistoryDTO/g, to: 'dto.response.StatusHistoryResponse' },
    { from: /dto\.ReservationPayload\.HoldResponse/g, to: 'dto.response.InitialReservationResponse.HoldResponse' },
    { from: /dto\.ReservationPayload\.InitialReservationResponse/g, to: 'dto.response.InitialReservationResponse' },
    { from: /dto\.BillDTO/g, to: 'dto.response.BillResponse' },
    { from: /dto\.ResRoomBillSummary/g, to: 'dto.response.ResRoomBillResponse' },
    { from: /dto\.ReservationBillSummary/g, to: 'dto.response.ReservationBillResponse' },
    { from: /dto\.ServiceCreationRequest/g, to: 'dto.request.CreateServiceRequest' },
    { from: /dto\.ReservationServiceCreationRequest/g, to: 'dto.request.AddReservationServiceRequest' },
    { from: /dto\.ReservationServiceDto/g, to: 'dto.response.ReservationServiceResponse' },
    { from: /dto\.DailyRevenueDto/g, to: 'dto.response.DailyRevenueResponse' },
    { from: /dto\.RevenueReportDto/g, to: 'dto.response.RevenueReportResponse' },
    { from: /dto\.RoomUsageItemDto/g, to: 'dto.response.RoomUsageItemResponse' },
    { from: /dto\.RoomUsageReportDto/g, to: 'dto.response.RoomUsageReportResponse' },
    { from: /dto\.ServiceUsageItemDto/g, to: 'dto.response.ServiceUsageItemResponse' },
    { from: /dto\.ServiceUsageReportDto/g, to: 'dto.response.ServiceUsageReportResponse' },
    { from: /dto\.DailyRevenueProjection/g, to: 'projection.DailyRevenueProjection' },
    { from: /dto\.RoomUsageProjection/g, to: 'projection.RoomUsageProjection' },
    { from: /dto\.ServiceUsageProjection/g, to: 'projection.ServiceUsageProjection' },
];

const classRenames = [
    { from: /\bEmpCreationRequest\b/g, to: 'EmpCreateRequest' },
    { from: /\bGuestCreationRequest\b/g, to: 'GuestCreateRequest' },
    { from: /\bUserCreationRequest\b/g, to: 'UserCreateRequest' },
    { from: /\bCreateUserRequest\b/g, to: 'AdminCreateUserRequest' },
    { from: /\bEmpDto\b/g, to: 'EmpResponse' },
    { from: /\bGuestDto\b/g, to: 'GuestResponse' },
    { from: /\bUserDto\b/g, to: 'UserResponse' },
    { from: /\bRoomDto\b/g, to: 'RoomResponse' },
    { from: /\bRoomCreateRequest\b/g, to: 'CreateRoomRequest' },
    { from: /\bRoomTypeCreateRequest\b/g, to: 'CreateRoomTypeRequest' },
    { from: /\bRoomTypeDto\b/g, to: 'RoomTypeResponse' },
    { from: /\bAvailableRoom\b/g, to: 'AvailableRoomResponse' },
    { from: /\bReservationDto\b/g, to: 'ReservationResponse' },
    { from: /\bReservationGuestDto\b/g, to: 'ReservationGuestResponse' },
    { from: /\bReservationRoomDto\b/g, to: 'ReservationRoomResponse' },
    { from: /\bStatusHistoryDTO\b/g, to: 'StatusHistoryResponse' },
    { from: /\bGuestStayDto\b/g, to: 'GuestStayResponse' },
    { from: /\bBillDTO\b/g, to: 'BillResponse' },
    { from: /\bResRoomBillSummary\b/g, to: 'ResRoomBillResponse' },
    { from: /\bReservationBillSummary\b/g, to: 'ReservationBillResponse' },
    { from: /\bServiceCreationRequest\b/g, to: 'CreateServiceRequest' },
    { from: /\bReservationServiceCreationRequest\b/g, to: 'AddReservationServiceRequest' },
    { from: /\bReservationServiceDto\b/g, to: 'ReservationServiceResponse' },
    { from: /\bDailyRevenueDto\b/g, to: 'DailyRevenueResponse' },
    { from: /\bRevenueReportDto\b/g, to: 'RevenueReportResponse' },
    { from: /\bRoomUsageItemDto\b/g, to: 'RoomUsageItemResponse' },
    { from: /\bRoomUsageReportDto\b/g, to: 'RoomUsageReportResponse' },
    { from: /\bServiceUsageItemDto\b/g, to: 'ServiceUsageItemResponse' },
    { from: /\bServiceUsageReportDto\b/g, to: 'ServiceUsageReportResponse' },
    { from: /\bCreateHoldRequest\b/g, to: 'CreateReservationRequest' },
    { from: /\bHoldResponse\b/g, to: 'InitialReservationResponse.HoldResponse' },
    { from: /\bCreateHoldRequest\.Item\b/g, to: 'CreateReservationRequest.RoomItem' },
    { from: /\bGuestStayDto\.Item\b/g, to: 'GuestStayResponse.Item' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Apply package & import changes
    for (const r of packageReplacements) {
        content = content.replace(r.from, r.to);
    }

    // Apply class renames
    for (const r of classRenames) {
        content = content.replace(r.from, r.to);
    }

    // Fix some specific mapper imports or static fromEntity calls
    content = content.replace(/RoomDto\.fromEntity/g, 'RoomMapper.toResponse');
    content = content.replace(/RoomTypeDto\.fromEntity/g, 'RoomMapper.toTypeResponse');
    content = content.replace(/EmpDto\.fromEntity/g, 'EmpMapper.toResponse');
    content = content.replace(/GuestDto\.fromEntity/g, 'GuestMapper.toResponse');
    content = content.replace(/UserDto\.fromEntity/g, 'UserMapper.toResponse');
    content = content.replace(/ReservationDto\.fromEntity/g, 'ReservationMapper.toResponse');
    content = content.replace(/ReservationRoomDto\.fromEntity/g, 'ReservationMapper.toRoomResponse');
    content = content.replace(/ReservationGuestDto\.fromEntity/g, 'ReservationMapper.toGuestResponse');
    content = content.replace(/StatusHistoryDTO\.fromEntity/g, 'ReservationMapper.toStatusHistoryResponse');
    content = content.replace(/BillDTO\.fromEntity/g, 'BillMapper.toResponse');
    content = content.replace(/ReservationServiceDto\.fromEntity/g, 'ReservationServiceMapper.toResponse');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (f.endsWith('.java')) {
            processFile(p);
        }
    });
}

walk(srcDir);
console.log('Refactoring imports and class names completed.');

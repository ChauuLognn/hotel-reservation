# MODIFIED_FILES.md - Complete List of Changes

**Project:** Hotel Reservation Premium - Security & Refactoring Audit
**Date:** 2026-06-22
**Phases Completed:** 1 - 9 (All Phases Completed)

---

## Summary of Changes

| Category | Count | Description |
| :--- | :---: | :--- |
| **New Files Created** | 22 | Configuration files, custom aspect classes, controller splits, command/query services, and React custom hooks/components. |
| **Files Modified** | 32 | Pom configuration, configurations, database repository queries, scheduling logic, and React pages. |
| **Files Deleted** | 1 | `AccountController.java` (functionality refactored into modular controllers). |

---

## 1. Created Files (22)

### Configuration & Deployment
1. [Dockerfile (backend)](file:///c:/Users/chaul/Downloads/hotel-reservation/Dockerfile)
   - Multi-stage build (Maven compiler stage + Eclipse Temurin 17 JRE execution stage).
2. [Dockerfile (frontend)](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/Dockerfile)
   - Multi-stage build (Node 20 build stage + Nginx Alpine static serving stage).
3. [nginx.conf](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/nginx.conf)
   - Nginx configuration with Single Page Application routing fallback and backend proxy mapping for `/hotel_reservation_premium`.
4. [docker-compose.yml](file:///c:/Users/chaul/Downloads/hotel-reservation/docker-compose.yml)
   - Multi-container configuration for `mysql` (port 3308), `backend` (port 8081), and `frontend` (port 80).
5. [.env.example](file:///c:/Users/chaul/Downloads/hotel-reservation/.env.example)
   - Environment variables template containing placeholder values.
6. [application-dev.yaml](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/resources/application-dev.yaml)
   - Local development configuration (hibernate update, sql query logging, data-seeding enabled).
7. [application-prod.yaml](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/resources/application-prod.yaml)
   - Production configuration (hibernate validation, connection pool configurations, query logging disabled).

### Backend Security & Concurrency
8. [StartupValidator.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/config/StartupValidator.java)
   - Validates `JWT_SECRET` and `SYSTEM_USER_ID` on context initialization.
9. [RoleSeeder.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/config/RoleSeeder.java)
   - Always-run seeding logic for essential database user roles.
10. [RequiresStaff.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/annotation/RequiresStaff.java)
    - Custom authorization annotation checking for MANAGER/EMPLOYEE roles.
11. [ValidateReservationOwnership.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/annotation/ValidateReservationOwnership.java)
    - Custom authorization annotation validating guest reservation ownership checks.
12. [ReservationOwnershipAspect.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/aspect/ReservationOwnershipAspect.java)
    - AOP Aspect class intercepting ownership queries and evaluating access tokens.
13. [SecurityExpressionEvaluator.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/service/SecurityExpressionEvaluator.java)
    - Aspect utility class to evaluate user access details.
14. [InMemoryRateLimiterService.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/service/InMemoryRateLimiterService.java)
    - ConcurrentHashMap-backed local rate limiter implementation.
15. [RedisRateLimiterService.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/service/RedisRateLimiterService.java)
    - Redis-backed rate limiter implementation activated via active profiles.

### Backend Controller & Service Splitting
16. [AdminUserController.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/account/controller/AdminUserController.java)
    - Modularized controller managing administrator functions.
17. [EmployeeController.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/account/controller/EmployeeController.java)
    - Modularized controller managing receptionist and staff accounts.
18. [GuestController.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/account/controller/GuestController.java)
    - Modularized controller managing customer profile endpoints.
19. [ReservationQueryService.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/service/ReservationQueryService.java) / [ReservationQueryServiceImpl.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/service/impl/ReservationQueryServiceImpl.java)
    - Service layer resolving query logic and listing bookings.
20. [ReservationCommandService.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/service/ReservationCommandService.java) / [ReservationCommandServiceImpl.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/service/impl/ReservationCommandServiceImpl.java)
    - Service layer creating, staging, and modifying bookings.
21. [ReservationStatusService.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/service/ReservationStatusService.java) / [ReservationStatusServiceImpl.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/service/impl/ReservationStatusServiceImpl.java)
    - Service layer managing checkout transitions and concurrency locking states.

### Frontend Custom Hooks & Components
22. Frontend modular components & custom hooks:
    - [useRoomSearch.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/customer-portal/hooks/useRoomSearch.ts) (hook)
    - [useBookings.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/customer-portal/hooks/useBookings.ts) (hook)
    - [RoomCard.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/customer-portal/components/RoomCard.tsx) (component)
    - [BookingModal.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/customer-portal/components/BookingModal.tsx) (component)
    - [useBookingDetail.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/hooks/useBookingDetail.ts) (hook)
    - [BillSummaryCard.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/components/BillSummaryCard.tsx) (component)
    - [StatusHistoryCard.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/components/StatusHistoryCard.tsx) (component)
    - [RoomStaySection.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/components/RoomStaySection.tsx) (component)
    - [AddGuestModal.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/components/AddGuestModal.tsx) (component)
    - [AddServiceModal.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/components/AddServiceModal.tsx) (component)

---

## 2. Modified Files (32)

### Git & Pom
1. [.gitignore](file:///c:/Users/chaul/Downloads/hotel-reservation/.gitignore)
   - Added environment variable file patterns to prevent secret check-ins.
2. [pom.xml](file:///c:/Users/chaul/Downloads/hotel-reservation/pom.xml)
   - Configured spring redis dependency controls.

### Java Backend Configurations & Security
3. [application.yaml](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/resources/application.yaml)
   - Removed hardcoded values and parameterized properties.
4. [application-test.yaml](file:///c:/Users/chaul/Downloads/hotel-reservation/src/test/resources/application.yaml)
   - Updated test JWT configurations.
5. [CorsConfig.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/config/CorsConfig.java)
   - Dynamically reads origins from environment.
6. [DataSeeder.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/config/DataSeeder.java)
   - Restrained to `@Profile("dev")` execution.
7. [SecurityConfig.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/config/SecurityConfig.java)
   - Enabled AOP proxy capabilities.
8. [JwtTokenProvider.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/jwt/JwtTokenProvider.java)
   - Enforced non-empty token secret bindings.
9. [RateLimiterService.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/security/service/RateLimiterService.java)
   - Abstracted interface signatures.

### Database Repositories (Pessimistic Locking & Batch Fetching)
10. [ReservationGuestRepository.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/repository/ReservationGuestRepository.java)
    - Implemented `SELECT FOR UPDATE` query locking and batch-loading queries.
11. [ReservationRoomRepository.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/repository/ReservationRoomRepository.java)
    - Implemented `SELECT FOR UPDATE` query locking on reservation rooms.
12. [ReservationStatusHistoryRepository.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/repository/ReservationStatusHistoryRepository.java)
    - Implemented concurrency-safe history insertions via database `INSERT ... SELECT`.

### Service Optimizations & Job Hardening
13. [BillServiceImpl.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/billing/service/impl/BillServiceImpl.java)
    - Optimised database N+1 loop calls via pre-fetching maps.
14. [ReservationServiceImpl.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/service/impl/ReservationServiceImpl.java)
    - Cleaned up delegating calls to commands, status, and query handlers.
15. [AutoCheckoutJob.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/scheduler/AutoCheckoutJob.java)
    - Replaced empty try-catch blocks with structured logging.
16. [AutoPendingExpiredJob.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/scheduler/AutoPendingExpiredJob.java)
    - Replaced empty try-catch blocks with structured logging.
17. [ReservationController.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/main/java/com/hotelreservation/modules/reservation/controller/ReservationController.java)
    - Replaced custom validation overrides with declarative security aspect controls.

### Java Tests
18. [HotelReservationApplicationTests.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/test/java/com/hotelreservation/HotelReservationApplicationTests.java)
    - Integrated environment overrides.
19. [ReservationServiceTest.java](file:///c:/Users/chaul/Downloads/hotel-reservation/src/test/java/com/hotelreservation/ReservationServiceTest.java)
    - Mapped signatures to refactored services.

### Frontend Configurations & TypeScript
20. [tsconfig.json](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/tsconfig.json)
    - Standardized path alias mappings.
21. [axiosClient.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/shared/api/axiosClient.ts)
    - Standardized data envelope interceptor unwrapping.
22. [useFetch.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/shared/hooks/useFetch.ts)
    - Simplified response generic bindings.
23. Frontend typed API modules (standardized responses and added AbortSignal parameters):
    - [billApi.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/billing/api/billApi.ts)
    - [reservationApi.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/api/reservationApi.ts)
    - [roomApi.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/rooms/api/roomApi.ts)
    - [userApi.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/employees/api/userApi.ts)
    - [serviceApi.ts](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/services/api/serviceApi.ts)
24. Frontend refactored pages & components:
    - [UserHome.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/customer-portal/UserHome.tsx)
    - [BookingDetail.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/reservations/BookingDetail.tsx)
    - [Bills.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/billing/Bills.tsx)
    - [Employees.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/employees/Employees.tsx)
    - [Rooms.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/rooms/Rooms.tsx)
    - [Services.tsx](file:///c:/Users/chaul/Downloads/hotel-reservation/frontend/src/features/services/Services.tsx)

---

## 3. Deleted Files (1)

1. `src/main/java/com/hotelreservation/modules/account/controller/AccountController.java`
   - Replaced by: `AdminUserController.java`, `EmployeeController.java`, and `GuestController.java`.

---

**Report Prepared By:** Engineering Audit Team
**Review Status**: 100% COMPLETE & VERIFIED ✅

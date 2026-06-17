package modules.account.dto;

import java.time.LocalDate;
import modules.account.entity.Guest;

public class GuestPayload {

    public static class GuestCreationRequest {
        private String firstName;
        private String lastName;
        private String identityNum;
        private String phone;
        private LocalDate dateOfBirth;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getIdentityNum() {
            return identityNum;
        }

        public void setIdentityNum(String identityNum) {
            this.identityNum = identityNum;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public LocalDate getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

    }

    public static class GuestDto {
        private Integer id;
        private String firstName;
        private String lastName;
        private String identityNum;
        private String phone;
        private LocalDate dateOfBirth;

        public static GuestDto fromEntity(Guest g){
            GuestDto dto = new GuestDto();
            dto.setId(g.getId());
            dto.setFirstName(g.getFirstName());
            dto.setLastName(g.getLastName());
            dto.setIdentityNum(g.getIdentityNum());
            dto.setPhone(g.getPhone());
            dto.setDateOfBirth(g.getDateOfBirth());
            return dto;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getIdentityNum() {
            return identityNum;
        }

        public void setIdentityNum(String identityNum) {
            this.identityNum = identityNum;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public LocalDate getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }


    }
}

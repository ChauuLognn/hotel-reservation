package modules.account.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import modules.account.entity.Emp;

public class EmpDto {
    private Integer id;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String identityNum;
    private String email;
    private String phone;
    private String address;
    private String role;
    private BigDecimal salary;

    public static EmpDto fromEntity(Emp e){
        EmpDto dto = new EmpDto();
        dto.id = e.getId();
        dto.firstName = e.getFirstName();
        dto.lastName = e.getLastName();
        dto.dateOfBirth = e.getDateOfBirth();
        dto.identityNum = e.getIdentityNum();
        dto.email = e.getEmail();
        dto.phone = e.getPhone();
        dto.address = e.getAddress();
        dto.role = e.getRole().getName().name();
        dto.salary = e.getRole().getSalary();
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

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getIdentityNum() {
        return identityNum;
    }

    public void setIdentityNum(String identityNum) {
        this.identityNum = identityNum;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

}
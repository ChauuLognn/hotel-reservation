package modules.account.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @OneToOne
    @JoinColumn(
        name = "empId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_user_emp")
    )
    private Emp emp;

    @Column(name = "account", nullable = false, length = 50, unique = true)
    private String account;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id = id;}
    public Emp getEmp(){return emp;}
    public void setEmp(Emp emp){this.emp = emp;}
    public String getAccount(){return account;}
    public void setAccount(String account){this.account = account;}
    public String getPassword(){return password;}
    public void setPassword(String password){this.password = password;}
}
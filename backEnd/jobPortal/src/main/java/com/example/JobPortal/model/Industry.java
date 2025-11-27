package com.example.JobPortal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter @Setter
@Table(name = "industries")
@NoArgsConstructor@AllArgsConstructor
public class Industry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    // Một ngành có nhiều skill
    @OneToMany(mappedBy = "industry", fetch = FetchType.EAGER)
    private List<Skills> skills;
}


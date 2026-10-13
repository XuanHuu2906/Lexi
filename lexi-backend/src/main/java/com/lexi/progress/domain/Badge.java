
package com.lexi.progress.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "condition", nullable = false)
    private String condition;

    @Column(name = "icon")
    private String icon;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "badge", fetch = FetchType.LAZY)
    private List<UserBadge> userBadges = new ArrayList<>();

    protected Badge() {
    }

    public Badge(
        String id,
        String code,
        String name,
        String description,
        String condition,
        String icon,
        LocalDateTime now
    ) {
        this.id = Objects.requireNonNull(id);
        this.code = Objects.requireNonNull(code);
        this.name = Objects.requireNonNull(name);
        this.description = Objects.requireNonNull(description);
        this.condition = Objects.requireNonNull(condition);
        this.icon = icon;
        this.createdAt = Objects.requireNonNull(now);
    }

    public String getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public List<UserBadge> getUserBadges() {
        return List.copyOf(userBadges);
    }
}

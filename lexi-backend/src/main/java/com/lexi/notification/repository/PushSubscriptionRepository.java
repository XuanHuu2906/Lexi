
package com.lexi.notification.repository;

import com.lexi.notification.domain.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository
        extends JpaRepository<PushSubscription, String> {

    Optional<PushSubscription> findByEndpoint(
        String endpoint
    );

    List<PushSubscription> findAllByUser_Id(
        String userId
    );

    boolean existsByEndpoint(String endpoint);
}

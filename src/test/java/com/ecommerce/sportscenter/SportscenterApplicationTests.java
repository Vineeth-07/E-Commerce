package com.ecommerce.sportscenter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SportscenterApplicationTests {

    @Test
    @DisplayName("Application class is available to the test suite")
    void applicationClassIsAvailable() {
        assertThat(SportscenterApplication.class).isNotNull();
    }
}

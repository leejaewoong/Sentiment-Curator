Feature: System Configuration
  As a user
  I want to update the system configuration
  So that I can change target URLs and AI prompts dynamically

  Scenario: Update Configuration
    Given the current configuration has target URL "https://old-url.com"
    When I send a request to update the target URL to "https://new-url.com"
    Then the configuration should be updated to include "https://new-url.com"
    And the next crawler job should use "https://new-url.com"

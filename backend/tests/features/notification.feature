Feature: Slack Notification
  As a user
  I want to receive notifications for filtered content on Slack
  So that I can quickly review important information

  Scenario: Sending notification for selected posts
    Given a post "AI News" is selected as relevant
    And the configured Slack channel is "#alerts"
    When the notification service runs
    Then a message should be sent to "#alerts"
    And the message should contain the summary of "AI News"
    And the message should contain the link to the original post

  Scenario: Handling user feedback via Emoji
    Given a notification for post "AI News" was sent to Slack
    When a user adds a "thumbsup" reaction to the message
    Then the system should record a positive feedback for post "AI News"
    And this feedback should be used for future filtering

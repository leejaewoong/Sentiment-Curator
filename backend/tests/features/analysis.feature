Feature: AI Sentiment Analysis and Filtering
  As a user
  I want to filter collected content based on my specific interests
  So that I only receive relevant information

  Scenario: Filtering content based on user prompt
    Given the following collected posts exist:
      | id | content                                      |
      | 1  | New AI model released today. It's amazing.   |
      | 2  | Today's lunch menu was delicious.            |
    And the user preference prompt is "AI technology news"
    When the AI analysis process runs
    Then post 1 should be marked as "RELEVANT"
    And post 2 should be marked as "IRRELEVANT"

  Scenario: Selecting top N relevant posts
    Given there are 10 relevant posts
    And the user configured "Top 3" posts
    When the filtering process completes
    Then only the top 3 most relevant posts should be selected for notification

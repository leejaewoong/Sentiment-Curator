Feature: Web Content Crawler
  As a user
  I want to collect content from specific websites
  So that I can analyze trends and sentiments

  Scenario: Manual crawling trigger
    Given the crawler service is ready
    When I trigger the crawler manually for "https://example.com"
    Then the crawler should start a background task
    And the task status should be "RUNNING"

  Scenario: Extracting content from a page
    Given a target page "https://example.com/post/1" exists
    And the page contains the following content:
      | title       | content             | image_url             |
      | Test Title  | This is a test post | http://img.com/1.jpg  |
    When the crawler visits "https://example.com/post/1"
    Then it should extract the title "Test Title"
    And it should extract the content "This is a test post"
    And it should extract the image URL "http://img.com/1.jpg"
    And the extracted data should be saved to the database

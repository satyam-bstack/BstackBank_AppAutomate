@transactions @regression
Feature: Transaction History
  As a BStackBank user
  I want to view my transaction history
  So that I can track my financial activity

  Background:
    Given I am on the home dashboard

   @transactions-list
  Scenario: View transaction history screen TC-15947
    When I navigate to the Transactions screen
    Then I should see the Transactions screen
    And I should see the transaction summary cards

  @transactions-filter-debit
  Scenario: Filter transactions by Debit TC-15948
    When I navigate to the Transactions screen
    And I tap the Debit filter
    Then I should see the Transactions screen

  @transactions-filter-credit
  Scenario: Filter transactions by Credit TC-15949
    When I navigate to the Transactions screen
    And I tap the Credit filter
    Then I should see the Transactions screen

  @transactions-filter-transfer
  Scenario: Filter transactions by Transfer TC-15950
    When I navigate to the Transactions screen
    And I tap the Transfer filter
    Then I should see the Transactions screen

  @transactions-after-transfer
  Scenario: Verify new transfer appears in transaction history TC-15951
    When I navigate to the Transfer screen
    And I select recipient "Aditya"
    And I enter transfer amount "100"
    And I tap the Send Money button
    Then I should see the transaction authorization screen
    When I authenticate the transaction
    Then I should see the transfer success modal
    And I tap the Done button
    When I navigate to the Transactions screen
    Then I should see the Transactions screen
    And I should see "Aditya" in the transaction list

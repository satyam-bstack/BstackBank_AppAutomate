@transfer @regression
Feature: Money Transfer
  As a BStackBank user
  I want to transfer money to other users
  So that I can send funds securely

  Background:
    Given I am on the home dashboard

  @transfer-success
  Scenario: Successful money transfer to a recipient TC-15952
    When I navigate to the Transfer screen
    And I select recipient "Aditya"
    And I enter transfer amount "100"
    And I tap the Send Money button
    Then I should see the transaction authorization screen
    When I authenticate the transaction
    Then I should see the transfer success modal
    And I tap the Done button

  @transfer-quick-amount 
  Scenario: Transfer using a quick-amount chip TC-15953
    When I navigate to the Transfer screen
    And I select recipient "Aditya"
    And I tap the quick amount "$100"
    And I tap the Send Money button
    Then I should see the transaction authorization screen
    When I authenticate the transaction
    Then I should see the transfer success modal
    And I tap the Done button

  @transfer-with-remarks
  Scenario: Transfer with optional remarks TC-15954
    When I navigate to the Transfer screen
    And I select recipient "Aditya"
    And I enter transfer amount "50"
    And I enter transfer remarks "Lunch split"
    And I tap the Send Money button
    Then I should see the transaction authorization screen
    When I authenticate the transaction
    Then I should see the transfer success modal
    And I tap the Done button

  @transfer-cancel-auth
  Scenario: Cancel transaction during authorization TC-15955
    When I navigate to the Transfer screen
    And I select recipient "Aditya"
    And I enter transfer amount "100"
    And I tap the Send Money button
    Then I should see the transaction authorization screen
    When I cancel the transaction authorization
    Then I should be back on the transfer screen

@login @smoke @regression
Feature: User Login
  As a BStackBank user
  I want to log in to the application
  So that I can access my banking features

  Background:
    Given the BStackBank app is launched

  @biometric-fail-cancel-passcode
  Scenario: Login fails when biometric rejected and passcode cancelled TC-15942
    When I tap the autofill regular user button
    And I tap the login button
    And I fail the biometric verification 5 times
    Then I should see the device passcode dialog
    When I cancel the passcode dialog
    Then I should see the biometric failure message

  @biometric-fail-pass-passcode
  Scenario: Login succeeds via passcode after biometric rejected TC-15943
    When I tap the autofill regular user button
    And I tap the login button
    And I fail the biometric verification 5 times
    Then I should see the device passcode dialog
    When I pass the passcode dialog
    Then I should see the home dashboard

  @valid-login
  Scenario: Successful login using autofill Regular User TC-15944
    When I tap the autofill regular user button
    And I tap the login button
    Then I should see the home dashboard

   @password-visibility
  Scenario: Password visibility toggle works on login screen TC-15945
    When I enter password "TestPassword123"
    And I tap the show password button
    Then the password field should be visible

   @invalid-login
  Scenario: Login fails with invalid credentials TC-15946
    When I enter username "invalid@example.com"
    And I enter password "wrongpassword"
    And I tap the login button
    Then I should see an error message

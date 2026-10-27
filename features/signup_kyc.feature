@signup @kyc @regression
Feature: New Customer Sign Up, Biometric and KYC Onboarding
  As a new BStackBank customer
  I want to register, verify my face, my identity and upload a KYC document
  So that I can log in and use my new account

  Background:
    Given the BStackBank app is launched

  @signup-kyc-e2e
  Scenario: New customer completes sign up, liveness, biometric and KYC then logs in
    When I open the sign up screen
    And I sign up as a new customer
    Then I should see the liveness verification screen
    When I open the camera and inject the selfie image
    And I capture the liveness photo and confirm it
    Then the liveness photo should be reported as captured
    When I set the captured photo as my profile photo
    Then I should see the biometric authentication dialog
    When I pass the biometric authentication
    Then I should see the KYC verification screen
    And the complete registration button should be disabled
    When I upload the KYC identity document from Downloads
    Then the KYC document should be listed as uploaded
    And the complete registration button should be enabled
    When I complete the registration
    Then I should see the new customer's home dashboard
    When I sign out of the app
    And I log in with the new customer credentials
    Then I should see the new customer's home dashboard

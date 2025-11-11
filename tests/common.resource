*** Settings ***
Library           SeleniumLibrary
Library           OperatingSystem

*** Variables ***
${URL}                      http://localhost:3000
${BROWSER}                  Chrome
${USERNAME}                 whiskeyhammer@outlook.com
${PASSWORD}                 workouttrackerpassy
${OUTPUT_DIR}               tests/test_logs
${CREATE_NEW_BTN}           //button[contains(text(), 'Create New Workout')]

*** Keywords ***
Open Browser And Login
    Set Screenshot Directory    ${OUTPUT_DIR}
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.5
    Wait Until Page Contains Element    //input[@placeholder='you@example.com']    10s
    Input Text    //input[@placeholder='you@example.com']    ${USERNAME}
    Input Text    //input[@type='password']    ${PASSWORD}
    Click Button    //button[@type='submit']
    Wait Until Page Contains Element    ${CREATE_NEW_BTN}    10s
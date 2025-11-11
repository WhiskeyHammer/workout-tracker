*** Settings ***
Resource         import_page.resource
Resource         workout_tracker.resource
Library          SeleniumLibrary
Suite Setup      Open Browser And Login
Suite Teardown   Close Browser

*** Test Cases ***
Create a workout using csv
    Pass Execution    passing

Create a workout using json
    Pass Execution    passing

Create a manual workout
    Go to import page
    Click Element   ${MANUAL_IMPORT_BTN}
    Wait Until Element Is Visible    ${EXERCISE_NAME_INPUT}
    Input Text    ${EXERCISE_NAME_INPUT}    Pullups
    Input Text    ${EXERCISE_SETS_INPUT}    2
    Click Element    ${SAVE_BTN}
    Wait Until Element Is Visible    ${EXERCISE_TITLE_PULLUPS}
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '2'
    Click Element    ${EDIT_WORKOUT_BTN}  
    Sleep    1s   
    # Add verification here

Cancel the creation of a manual import
    Go to import page
    Click Element   ${MANUAL_IMPORT_BTN}
    Wait Until Element Is Visible    ${EXERCISE_NAME_INPUT}
    Input Text    ${EXERCISE_NAME_INPUT}    Pullups
    Input Text    ${EXERCISE_SETS_INPUT}    2
    Sleep    1s
    Element Should Be Visible    ${MANUAL_IMPORT_BTN}
    # Approved

The back button takes you back to the library page
    Go to import page
    Click Element    ${BACK_BTN}
    Wait Until Element Is Not Visible    ${MANUAL_IMPORT_BTN}
    # Approved
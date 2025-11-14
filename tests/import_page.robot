*** Settings ***
Resource          resources.resource
Suite Setup       Open Browser And Login
Suite Teardown    Delete All Workouts
Test Setup        Go to import page

*** Test Cases ***
Create a workout using csv
    Pass Execution    passing

Create a workout using json
    Pass Execution    passing

Create a manual workout
    Create Manual Exercise    Pullups    2
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '2'
    Click Element    ${EDIT_WORKOUT_BTN}  
    Sleep    1s   
    Element Text Should Be    ${SET1_REPS_VALUE}    0
    Element Text Should Be    ${SET1_WEIGHT_VALUE}    0
    Element Text Should Be    ${SET1_REST_VALUE}    0
    Element Text Should Be    ${SET1_GROUP_VALUE}    Pullups
    Element Text Should Be    ${SET1_NOTES_TEXT}    Click to add notes...
    Element Text Should Be    ${SET2_REPS_VALUE}    0
    Element Text Should Be    ${SET2_WEIGHT_VALUE}    0
    Element Text Should Be    ${SET2_REST_VALUE}    0
    Element Text Should Be    ${SET2_GROUP_VALUE}    Pullups
    Element Text Should Be    ${SET2_NOTES_TEXT}    Click to add notes...
    Element Text Should Be    ${EXERCISE_NOTES_TEXTAREA}    ${EMPTY}
    [Teardown]   Click Element   ${BACK_BUTTON}
    # Approved

Cancel the creation of a manual import
    Click Element    ${MANUAL_IMPORT_BTN}
    Wait Until Element Is Visible    ${EXERCISE_NAME_INPUT}
    Input Text    ${EXERCISE_NAME_INPUT}    Pullups
    Input Text    ${EXERCISE_SETS_INPUT}    2
    Sleep    1s
    Click Element    ${CANCEL_BTN}
    Element Should Be Visible    ${MANUAL_IMPORT_BTN}
    # Approved

The back button takes you back to the library page  
    Click Element    ${BACK_BUTTON}
    Wait Until Element Is Not Visible    ${MANUAL_IMPORT_BTN}
    # Approved

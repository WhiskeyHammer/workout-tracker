*** Settings ***
Documentation    Comprehensive test suite for Workout Tracker - Edit State page
...              Tests all interactive elements and user workflows
Library          SeleniumLibrary
Library          String
Resource         resources.resource
Suite Setup      Open Browser And Login
Suite Teardown   Delete All Workouts
Test Setup       Setup for workout tests


*** Test Cases ***
# Really these test are about data persistence AND data roll forward
# In order to check for data persistence we need to check for every possible edit
    # Simple: exercise title, Reps, Weight, Rest, Group, set notes, exercise notes, new sets, new exercisies, completions
    # Two rounds: deletions, uncompletions, final completion of exercise, final completion of lift, next weight settings,
# There are alos some special roll-over checks
    # The weight group setting
    # The exercise notes carry over
    # The copy button works
# Other
    # You can't accidentally delete (tested organically above)
    # You can't complete a lift without completing the prior lift (actually not tested organically)
    # We should probably individually check the cancel buttons on all edits and deletes and undos
    # The final completion warning if not all exercises are marked as done
    # Limitation on edits until the edit button is hit

Edits persists
    Make edit to field that uses single input modal    ${EXERCISE_TITLE_PULLUPS}    PULLUPS
    Make edit to field that uses single input modal    ${SET1_REPS_VALUE}    99
    Make edit to field that uses single input modal    ${SET1_WEIGHT_VALUE}    98
    Make edit to field that uses single input modal    ${SET1_REST_VALUE}    97
    Make edit to field that uses single input modal    ${SET1_GROUP_VALUE}    96
    Click Element  ${SET1_NOTES_TEXT}    
    Input Text     ${SET1_NOTES_TEXT_INPUT}    95
    Click Element    ${SAVE_WORKOUT_EDIT}
    Type Text Slowly     ${EXERCISE_NOTES_TEXTAREA}    94
    Reload Page
    Go to a workout    Manual Test Workout
    Click Element    ${EDIT_WORKOUT_BTN}
    Element Text Should Be    ${EXERCISE_TITLE_PULLUPS}    PULLUPS
    Element Text Should Be    ${SET1_REPS_VALUE}    99
    Element Text Should Be    ${SET1_WEIGHT_VALUE}    98
    Element Text Should Be    ${SET1_REST_VALUE}    97
    Element Text Should Be    ${SET1_GROUP_VALUE}    96
    Element Text Should Be    ${SET1_NOTES_TEXT}     95
    Element Text Should Be    ${EXERCISE_NOTES_TEXTAREA}    94

*** Keywords ***
Type Text Slowly
    [Arguments]    ${locator}    ${text}
    [Documentation]    Types text character by character without delay
    Click Element    ${locator}
    @{chars}=    Split String To Characters    ${text}
    FOR    ${char}    IN    @{chars}
        Press Keys    ${locator}    ${char}
    END

Setup for workout tests
    Go to a workout    Manual Test Workout
    ${edit_btn_value} =    Get Text    ${EDIT_WORKOUT_BTN}
    IF    $edit_btn_value != 'Done'
        Click Element    ${EDIT_WORKOUT_BTN}
        Sleep   0.5s
    END

Make edit to field that uses single input modal
    [Arguments]    ${elem}    ${value}
    Click Element    ${elem}
    Wait Until Element Is Visible    ${SAVE_WORKOUT_EDIT}
    Input Text    ${INPUT_EDIT_WORKOUT}    ${value}
    Click Element    ${SAVE_WORKOUT_EDIT}

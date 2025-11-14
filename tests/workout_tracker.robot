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
    # One round of edits: exercise title, Reps, Weight, Rest, Group, set notes, exercise notes, deletions, new sets, new exercisies, completions
    # Two rounds: uncompletions, final completion of exercise, final completion of lift, next weight settings,
# There are alos some special roll-over checks
    # The weight group setting
    # The exercise notes carry over
    # The copy button works
# Other
    # You can't accidentally delete (tested organically above)
    # You can't complete a lift without completing the prior lift (actually not tested organically)
    # We should probably individually check the cancel buttons
    # The final completion warning if not all exercises are marked as done


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

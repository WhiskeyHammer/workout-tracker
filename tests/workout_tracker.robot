*** Settings ***
Documentation    Comprehensive test suite for Workout Tracker - Edit State page
...              Tests all interactive elements and user workflows
Library          SeleniumLibrary
Library          String
Resource         resources.resource
Suite Setup      Open Browser And Login
Suite Teardown   Delete All Workouts


*** Test Cases ***
# Really these test are about data persistence AND data roll forward
# In order to check for data persistence we need to check for every possible edit
    # Simple: exercise title, Reps, Weight, Rest, Group, set notes, completions, exercise notes, new exercisies
    # Two rounds: deletions, uncompletions, final completion of exercise
    # Workout rollover
        # final completion of workout, next weight settings, new sets, new exercises
# There are also some special roll-over checks
    # The weight group setting
    # The exercise notes carry over
    # The copy button works
# Other
    # You can't accidentally delete (tested organically above)
    # You can't complete a lift without completing the prior lift (actually not tested organically)
    # We should probably individually check the cancel buttons on all edits and deletes and undos
    # The final completion warning if not all exercises are marked as done
    # Limitation on edits until the edit button is hit
    # Special rest behaviors between sets
        # Length
        # Skippable
        # Time updates as expected

Edits persists
    [Setup]    Setup for workout tests    Manual Test Workout 1
    # Set Normal Modal Fields
    Make edit to field that uses single input modal    Pullups    1    ${EXERCISE_TITLE}    PULLUPS
    Make edit to field that uses single input modal    PULLUPS    1    ${SET_REPS}    99
    Make edit to field that uses single input modal    PULLUPS    1    ${SET_WEIGHT}    98
    Make edit to field that uses single input modal    PULLUPS    1    ${SET_REST}    97
    Make edit to field that uses single input modal    PULLUPS    1    ${SET_GROUP}    96
    # Set Irregular Modal Fields, Set Notes
    Edit set note field    PULLUPS    1    95
    # Set Irregular Non-modal Fields, Complete
    Toggle complete set field    PULLUPS    1    
    # Set Non-modal Fields, Exercise Notes
    Set exercise level notes     PULLUPS    94
    # Create New Exercise
    Click Element    ${ADD_EXERCISE_BUTTON}
    Populate new exercise info    Chin Ups    2
    # Slight pause for the save process
    Wait Until Element Is Visible    ${SYNC_SUCCESS_TOAST}
    Sleep    1s

    # VERIFICATION OF THE ABOVE
    Reload Page
    Go to a workout    Manual Test Workout 1
    Click Element    ${EDIT_WORKOUT_BTN}
    # Verification of the original exercise
    Element Text Should Be    ${EXERCISE_TITLE}    PULLUPS
    Element Text Should Be    ${SET_REPS}    99
    Element Text Should Be    ${SET_WEIGHT}    98
    Element Text Should Be    ${SET_REST}    97
    Element Text Should Be    ${SET_GROUP}    96
    Element Text Should Be    ${SET_NOTES}     95
    Element Should Have Class    ${SET_COMPLETE}    bg-green-500
    Element Text Should Be    ${EXERCISE_NOTES_TEXTAREA}    94
    # Verification of the new exercise
    Verify exercise set field value    Chin Ups    ${EXERCISE_TITLE}   1    Chin Ups
    Verify exercise set field value    Chin Ups    ${SET_REPS}   1    0
    Verify exercise set field value    Chin Ups    ${SET_WEIGHT}   1    0
    Verify exercise set field value    Chin Ups    ${SET_REST}   1    0
    Verify exercise set field value    Chin Ups    ${SET_GROUP}   1    Chin Ups
    Verify exercise set field value    Chin Ups    ${SET_NOTES}   1    Click to add notes...
    Verify exercise set field value    Chin Ups    ${EXERCISE_NOTES_TEXTAREA}    1   ${EMPTY}
    ${new_exercise_complete} =    Get nth set elem of exercise    Chin Ups     ${SET_COMPLETE}   1
    Element Should Have Class    ${new_exercise_complete}    bg-gray-300

Delete function and guards
    [Documentation]    User is prompted to confirm before deleting the set and both options work
    [Setup]    Setup for workout tests    Manual Test Workout 2
    Make edit to field that uses single input modal    Pullups    1    ${SET_REPS}    99
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    98
    Make edit to field that uses single input modal    Pullups    1    ${SET_REST}    97

    Click Element    ${SET_DELETE}
    Wait Until Element Is Visible    ${SET_DELETE_CANCEL}
    Click Element    ${SET_DELETE_CANCEL}
    Sleep    1s

    # Verification that we don't delete the set because we're stupid and ignore the cancel button
    Reload Page
    Go to a workout    Manual Test Workout 2
    Click Element    ${EDIT_WORKOUT_BTN}
    Element Text Should Be    ${SET_REPS}    99
    Element Text Should Be    ${SET_WEIGHT}    98
    Element Text Should Be    ${SET_REST}    97

    # Now actually delete it
    Click Element    ${SET_DELETE}
    Wait Until Element Is Visible    ${SET_DELETE_CONFIRM}
    Click Element    ${SET_DELETE_CONFIRM}
    Sleep    1s

    # Verification that we did actually delete it
    Reload Page
    Go to a workout    Manual Test Workout 2
    Click Element    ${EDIT_WORKOUT_BTN}
    Element Text Should Be    ${SET_REPS}    0
    Element Text Should Be    ${SET_WEIGHT}    0
    Element Text Should Be    ${SET_REST}    0

Uncomplete function and guards
    [Documentation]    User is prompted to confirm before marking a completed set as uncomplete
    [Setup]    Setup for workout tests    Manual Test Workout 3
    Make edit to field that uses single input modal    Pullups    1    ${SET_REPS}    99
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    98
    Make edit to field that uses single input modal    Pullups    1    ${SET_REST}    97
    Toggle complete set field    Pullups    1    

    Click Element    ${SET_COMPLETE}
    Wait Until Element Is Visible    ${SET_COMPLETE_CANCEL}
    Click Element    ${SET_COMPLETE_CANCEL}
    Sleep    1s

    # Verification that we don't delete the set because we're stupid and ignore the cancel button
    Reload Page
    Go to a workout    Manual Test Workout 3
    Click Element    ${EDIT_WORKOUT_BTN}
    Element Text Should Be    ${SET_REPS}    99
    Element Text Should Be    ${SET_WEIGHT}    98
    Element Text Should Be    ${SET_REST}    97
    Element Should Have Class    ${SET_COMPLETE}    bg-green-500

    # Now actually delete it
    Click Element    ${SET_COMPLETE}
    Wait Until Element Is Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Sleep    1s

    # Verification that we did actually delete it
    Reload Page
    Go to a workout    Manual Test Workout 3
    Click Element    ${EDIT_WORKOUT_BTN}
    Element Text Should Be    ${SET_REPS}    99
    Element Text Should Be    ${SET_WEIGHT}    98
    Element Text Should Be    ${SET_REST}    97
    Element Should Have Class    ${SET_COMPLETE}    bg-gray-300

Final exercise completions
    [Documentation]    User sees the Set Weights for Next Lift when appropraite
    [Setup]    Setup for workout tests    Manual Test Workout 4
    Toggle complete set field    Pullups    1
    Toggle complete set field    Pullups    2
    ${set_2_compelte_btn} =    Get nth set elem of exercise    Pullups    ${SET_COMPLETE}    2

    # Verification that the next_weight_btn is visible when it should be
    Element Should Be Visible    ${NEXT_WEIGHT_BTN}

    # Verification that we want the user to confirm before they uncomplete a set
    Toggle complete set field    Pullups    2
    Element Should Be Visible    ${SET_COMPLETE_CONFIRM}

    # Verification that the set uncomplete cancel button works
    Click Element    ${SET_COMPLETE_CANCEL}
    Element Should Have Class    ${set_2_compelte_btn}    bg-green-500   # Stil complete after hitting cancel
    Sleep    1s    
    Reload Page
    Go to a workout    Manual Test Workout 4
    Element Should Have Class    ${set_2_compelte_btn}    bg-green-500   # Stil complete after hitting cancel and relaoding

    # Verification that the user can uncomplete a set
    Toggle complete set field    Pullups    2
    Element Should Be Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Element Should Have Class    ${set_2_compelte_btn}    bg-gray-300   # Stil uncomplete after hitting cancel
    Sleep    1s    
    Reload Page
    Go to a workout    Manual Test Workout 4
    Element Should Have Class    ${set_2_compelte_btn}    bg-gray-300   # Stil uncomplete after hitting cancel and relaoding
    Element Should Not Be Visible    ${NEXT_WEIGHT_BTN}

Next weight settings, single weight group
    [Setup]    Setup for workout tests    Manual Test Workout 5
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    98
    Verify exercise set field value    Pullups    ${SET_GROUP}   1    Pullups
    Verify exercise set field value    Pullups    ${SET_GROUP}   2    Pullups
    ${set_2_compelte_btn} =    Get nth set elem of exercise    Pullups    ${SET_COMPLETE}    2

    Toggle complete set field    Pullups    1
    Toggle complete set field    Pullups    2
    Element Should Be Visible    ${NEXT_WEIGHT_BTN}
    Click Element    ${NEXT_WEIGHT_BTN}
    
    # The label and weight matches what we expect
    Element Text Should Be    ${NEXT_WEIGHT_LABEL}    Pullups
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    98

    # We can cancel with no change
    Input Text    ${NEXT_WEIGHT_INPUT}    50
    Click Element    ${NEXT_WEIGHT_CANCEL}
    Element Should Be Visible    ${NEXT_WEIGHT_BTN}
    Click Element    ${NEXT_WEIGHT_BTN}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    98

    # We can set a next weight
    Input Text    ${NEXT_WEIGHT_INPUT}    50
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50

    # When we reload and come back the next weight setting is retained
    Sleep    1s    
    Reload Page
    Go to a workout    Manual Test Workout 5
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50

    # When we uncomplete and recomplete the new weight settings is respected, this also is a revisit test to make sure that the value is still editable
    Input Text    ${NEXT_WEIGHT_INPUT}    75
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Toggle complete set field    Pullups    2 
    Element Should Be Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Element Should Have Class    ${set_2_compelte_btn}    bg-gray-300
    Toggle complete set field    Pullups    2 
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    75    

Next weight settings, multi weight group
    [Setup]    Setup for workout tests    Manual Test Workout 6
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    98
    Make edit to field that uses single input modal    Pullups    2    ${SET_GROUP}    PULLUPS DROP
    Make edit to field that uses single input modal    Pullups    2    ${SET_WEIGHT}    97

    Verify exercise set field value    Pullups    ${SET_GROUP}   1    Pullups
    Verify exercise set field value    Pullups    ${SET_GROUP}   2    PULLUPS DROP

    ${set_2_compelte_btn} =    Get nth set elem of exercise    Pullups    ${SET_COMPLETE}    2
    ${label_2} =    Set Variable    (${NEXT_WEIGHT_LABEL})[2] 
    ${input_2} =    Set Variable    (${NEXT_WEIGHT_INPUT})[2]

    Toggle complete set field    Pullups    1
    Toggle complete set field    Pullups    2
    Element Should Be Visible    ${NEXT_WEIGHT_BTN}
    Click Element    ${NEXT_WEIGHT_BTN}
    
    # The label and weight matches what we expect
    Element Text Should Be    ${NEXT_WEIGHT_LABEL}    Pullups
    Element Text Should Be    ${label_2}    PULLUPS DROP
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    98
    Element Attribute Value Should Be    ${input_2}    value    97

    # We can cancel with no change
    Input Text    ${NEXT_WEIGHT_INPUT}    50
    Input Text    ${input_2}    50
    Click Element    ${NEXT_WEIGHT_CANCEL}
    Element Should Be Visible    ${NEXT_WEIGHT_BTN}
    Click Element    ${NEXT_WEIGHT_BTN}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    98
    Element Attribute Value Should Be    ${input_2}    value    97

    # We can set a next weight
    Input Text    ${NEXT_WEIGHT_INPUT}    50
    Input Text    ${input_2}    51
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Element Should Be Visible    ${NEXT_WEIGHT_BTN_DONE}
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50
    Element Attribute Value Should Be    ${input_2}    value    51

    # When we reload and come back the next weight setting is retained
    Sleep    1s    
    Reload Page
    Go to a workout    Manual Test Workout 6
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50
    Element Attribute Value Should Be    ${input_2}    value    51

    # When we uncomplete and recomplete the new weight settings is respected, this also is a revisit test to make sure that the value is still editable
    Input Text    ${NEXT_WEIGHT_INPUT}    75
    Input Text    ${input_2}    74
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Toggle complete set field    Pullups    2 
    Element Should Be Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Element Should Have Class    ${set_2_compelte_btn}    bg-gray-300
    Toggle complete set field    Pullups    2 
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    75
    Element Attribute Value Should Be    ${input_2}    value    74

User can create a new set
    [Setup]    Setup for workout tests    Manual Test Workout 7
    ${set_delete_2} =    Set Variable    (${SET_DELETE})[2]

    # Set Normal Modal Fields
    Make edit to field that uses single input modal    Pullups    1    ${SET_REPS}    99
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    98
    Make edit to field that uses single input modal    Pullups    1    ${SET_REST}    97
    Make edit to field that uses single input modal    Pullups    1    ${SET_GROUP}    96
    Edit set note field    Pullups    1    95

    # Copies the last set value
    Click Element    ${ADD_SET}
    Verify exercise set field value    Pullups    ${SET_REPS}   3    0
    Verify exercise set field value    Pullups    ${SET_WEIGHT}   3    0
    Verify exercise set field value    Pullups    ${SET_REST}   3    0
    Verify exercise set field value    Pullups    ${SET_GROUP}   3    Pullups
    Verify exercise set field value    Pullups    ${SET_NOTES}   3    Click to add notes...

    # Delete the new set and the default second set
    Click Element    ${set_delete_2}
    Wait Until Element Is Visible    ${SET_DELETE_CONFIRM}
    Click Element    ${SET_DELETE_CONFIRM}
    Sleep    1s
    Click Element    ${set_delete_2}
    Wait Until Element Is Visible    ${SET_DELETE_CONFIRM}
    Click Element    ${SET_DELETE_CONFIRM}
    Sleep    1s

    # Verify that they've been cleared out
    Reload Page
    Go to a workout    Manual Test Workout 7
    Click Element    ${EDIT_WORKOUT_BTN}
    Element Should Not Be Visible    ${set_delete_2}

    # Copies the last set value but this time with non zero/default value
    Click Element    ${ADD_SET}
    Verify exercise set field value    Pullups    ${SET_REPS}   2    99
    Verify exercise set field value    Pullups    ${SET_WEIGHT}   2    98
    Verify exercise set field value    Pullups    ${SET_REST}   2    97
    Verify exercise set field value    Pullups    ${SET_GROUP}   2    96
    Verify exercise set field value    Pullups    ${SET_NOTES}   2    Click to add notes...

    # From here we just assume that this is a valid and otherwise totally normal set field so I dont bother messign with it
    
    

*** Keywords ***
Type Text Slowly
    [Arguments]    ${locator}    ${text}
    [Documentation]    Types text character by character without delay
    Click Element    ${locator}
    @{chars}=    Split String To Characters    ${text}
    Set Selenium Speed    0
    FOR    ${char}    IN    @{chars}
        Press Keys    ${locator}    ${char}
        Sleep    0.1s
    END
    Set Selenium Speed    ${OPERATION_INTERSTITIAL}

Setup for workout tests
    [Arguments]    ${workout_name}
    Go to a workout    ${workout_name}
    ${edit_btn_value} =    Get Text    ${EDIT_WORKOUT_BTN}
    IF    $edit_btn_value != 'Done'
        Click Element    ${EDIT_WORKOUT_BTN}
        Sleep   0.5s
    END

Make edit to field that uses single input modal
    [Arguments]    ${exerxise}    ${n_set}    ${elem}    ${value}
    ${target} =    Get nth set elem of exercise    ${exerxise}    ${elem}    ${n_set}
    Click Element    ${target}
    Wait Until Element Is Visible    ${SAVE_WORKOUT_EDIT}
    Input Text    ${INPUT_EDIT_WORKOUT}    ${value}
    Click Element    ${SAVE_WORKOUT_EDIT}

Edit set note field
    [Arguments]    ${exercise}   ${n_set}    ${text}
    ${set_note} =    Get nth set elem of exercise    ${exercise}    ${SET_NOTES}    ${n_set}
    Click Element  ${set_note}  
    Input Text     ${SET_NOTES_INPUT}    ${text}
    Click Element    ${SAVE_WORKOUT_EDIT}

Toggle complete set field
    [Arguments]    ${exercise}   ${n_set}
    ${target_compelte} =    Get nth set elem of exercise    ${exercise}    ${SET_COMPLETE}    ${n_set}
    Click Element  ${target_compelte}
    ${is_visible}=    Run Keyword And Return Status    Wait Until Element Is Visible    ${SKIP_WAIT}    timeout=2s
    IF    ${is_visible}
        Click Element    ${SKIP_WAIT}
        Click Element    ${CONFIRM_SKIP_WAIT}
    END

Set exercise level notes
    [Arguments]     ${exercise}    ${text}
    ${target_exercise_notes} =     Get nth set elem of exercise    ${exercise}     ${EXERCISE_NOTES_TEXTAREA}    1
    Type Text Slowly     ${target_exercise_notes}    ${text}

Verify exercise set field value
    [Arguments]    ${exercise}    ${field}    ${n}    ${expected_value}
    ${target_field} =    Get nth set elem of exercise    ${exercise}    ${field}   ${n}
    Element Text Should Be    ${target_field}    ${expected_value}

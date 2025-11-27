*** Settings ***
Documentation    Comprehensive test suite for Workout Tracker - Edit State page
...              Tests all interactive elements and user workflows
Library          SeleniumLibrary
Library          String
Resource         resources.resource
Suite Setup      Open Browser And Login
Suite Teardown   Delete All Workouts
Test Teardown    Delete All Workouts    ${False}


*** Test Cases ***
# =============================================================================
# DATA PERSISTENCE TESTS
# =============================================================================
Edits persists
    [Setup]    Setup for workout tests    Manual Test Workout 1
    # Set Normal Modal Fields
    Edit Complete Exercise Set    Pullups    1
    ...    SET_REPS=99
    ...    SET_WEIGHT=98
    ...    SET_REST=97
    ...    SET_GROUP=96
    ...    SET_NOTES=95
    # Set Irregular Non-modal Fields, Complete
    Toggle complete set field    Pullups    1    
    # Set Non-modal Fields, Exercise Notes
    Set exercise level notes     Pullups    94
    # Edit name to verify that anything tied to the exercise name is proprely accounted for
    Make edit to field that uses single input modal    Pullups    1    ${EXERCISE_TITLE}    PULLUPS
    # Create New Exercise
    Click Element    ${ADD_EXERCISE_BTN}
    Populate New Exercise Info    Chin Ups    2

    # Slight pause for the save process
    Wait Until Element Is Visible    ${SYNC_SUCCESS_TOAST}
    Sleep    1s

    # VERIFICATION OF THE ABOVE
    Reload Page
    Go To A Workout    Manual Test Workout 1
    Click Element    ${EDIT_WORKOUT_BTN}
    # Verification of the original exercise
    Element Text Should Be    ${EXERCISE_TITLE}    PULLUPS
    Verify Complete Exercise Set    PULLUPS    1
    ...    ${SET_REPS}=99
    ...    ${SET_WEIGHT}=98
    ...    ${SET_REST}=97
    ...    ${SET_GROUP}=96
    ...    ${SET_NOTES}=95
    Element Should Have Class    ${SET_COMPLETE}    bg-green-500
    Element Text Should Be    ${EXERCISE_NOTES}    94
    # Verification of the new exercise
    Verify exercise set field value    Chin Ups    ${EXERCISE_TITLE}   1    Chin Ups
    Verify Complete Exercise Set    Chin Ups    1
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Chin Ups
    ...    ${SET_NOTES}=Click to add notes...
    Verify exercise set field value    Chin Ups    ${EXERCISE_NOTES}    1   Click to add notes about this exercise...
    ${new_exercise_complete} =    Get nth set elem of exercise    Chin Ups     ${SET_COMPLETE}   1
    Element Should Have Class    ${new_exercise_complete}    bg-gray-300

Delete function and guards
    [Documentation]    User is prompted to confirm before deleting the set and both options work
    [Setup]    Setup for workout tests    Manual Test Workout 2
    Edit Complete Exercise Set    Pullups    1
    ...    SET_REPS=99
    ...    SET_WEIGHT=98
    ...    SET_REST=97

    Click Element    ${SET_DELETE}
    Wait Until Element Is Visible    ${SET_DELETE_CANCEL}
    Click Element    ${SET_DELETE_CANCEL}
    Sleep    1s

    # Verification that we don't delete the set because we're stupid and ignore the cancel button
    Reload Page
    Go To A Workout    Manual Test Workout 2
    Click Element    ${EDIT_WORKOUT_BTN}
    Verify Complete Exercise Set    Pullups    1
    ...    ${SET_REPS}=99
    ...    ${SET_WEIGHT}=98
    ...    ${SET_REST}=97

    # Now actually delete it
    Click Element    ${SET_DELETE}
    Wait Until Element Is Visible    ${SET_DELETE_CONFIRM}
    Click Element    ${SET_DELETE_CONFIRM}
    Sleep    1s

    # Verification that we did actually delete it
    Reload Page
    Go To A Workout    Manual Test Workout 2
    Click Element    ${EDIT_WORKOUT_BTN}
    Verify Complete Exercise Set    Pullups    1
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0

    # Can't delete a set onces it's marked as complete
    Toggle complete set field    Pullups    1
    ${set_delete_btn} =    Run Keyword And Return Status  Get nth set elem of exercise    Pullups    ${SET_DELETE}    1
    Element Should Not Be Visible    ${set_delete_btn}

Uncomplete function and guards
    [Documentation]    User is prompted to confirm before marking a completed set as uncomplete
    [Setup]    Setup for workout tests    Manual Test Workout 3
    Edit Complete Exercise Set    Pullups    1
    ...    SET_REPS=99
    ...    SET_WEIGHT=98
    ...    SET_REST=97
    Toggle complete set field    Pullups    1

    Click Element    ${SET_COMPLETE}
    Wait Until Element Is Visible    ${SET_COMPLETE_CANCEL}
    Click Element    ${SET_COMPLETE_CANCEL}
    Sleep    1s

    # Verification that we don't delete the set because we're stupid and ignore the cancel button
    Reload Page
    Go To A Workout    Manual Test Workout 3
    Click Element    ${EDIT_WORKOUT_BTN}
    Verify Complete Exercise Set    Pullups    1
    ...    ${SET_REPS}=99
    ...    ${SET_WEIGHT}=98
    ...    ${SET_REST}=97
    Element Should Have Class    ${SET_COMPLETE}    bg-green-500

    # Now actually delete it
    Click Element    ${SET_COMPLETE}
    Wait Until Element Is Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Sleep    1s

    # Verification that we did actually delete it
    Reload Page
    Go To A Workout    Manual Test Workout 3
    Click Element    ${EDIT_WORKOUT_BTN}
    Verify Complete Exercise Set    Pullups    1
    ...    ${SET_REPS}=99
    ...    ${SET_WEIGHT}=98
    ...    ${SET_REST}=97
    Element Should Have Class    ${SET_COMPLETE}    bg-gray-300

# =============================================================================
# EXERCISE COMPLETION WORKFLOW TESTS
# =============================================================================
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
    Go To A Workout    Manual Test Workout 4
    Element Should Have Class    ${set_2_compelte_btn}    bg-green-500   # Stil complete after hitting cancel and relaoding

    # Verification that the user can uncomplete a set
    Toggle complete set field    Pullups    2
    Element Should Be Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Element Should Have Class    ${set_2_compelte_btn}    bg-gray-300   # Stil uncomplete after hitting cancel
    Sleep    1s    
    Reload Page
    Go To A Workout    Manual Test Workout 4
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
    Click Next Weight Done Button
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50

    # When we reload and come back the next weight setting is retained
    Sleep    1s    
    Reload Page
    Go To A Workout    Manual Test Workout 5
    Click Next Weight Done Button
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50

    # When we uncomplete and recomplete the new weight settings is respected, this also is a revisit test to make sure that the value is still editable
    Input Text    ${NEXT_WEIGHT_INPUT}    75
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Toggle complete set field    Pullups    2 
    Element Should Be Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Element Should Have Class    ${set_2_compelte_btn}    bg-gray-300
    Toggle complete set field    Pullups    2 
    Click Next Weight Done Button
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
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Element Should Be Visible    ${NEXT_WEIGHT_BTN_DONE}
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50
    Element Attribute Value Should Be    ${input_2}    value    51

    # When we reload and come back the next weight setting is retained
    Sleep    1s    
    Reload Page
    Go To A Workout    Manual Test Workout 6
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    50
    Element Attribute Value Should Be    ${input_2}    value    51

    # When we uncomplete and recomplete the new weight settings is respected, this also is a revisit test to make sure that the value is still editable
    Input Text    ${NEXT_WEIGHT_INPUT}    75
    Input Text    ${input_2}    74
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Toggle complete set field    Pullups    2 
    Element Should Be Visible    ${SET_COMPLETE_CONFIRM}
    Click Element    ${SET_COMPLETE_CONFIRM}
    Element Should Have Class    ${set_2_compelte_btn}    bg-gray-300
    Toggle complete set field    Pullups    2 
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    75
    Element Attribute Value Should Be    ${input_2}    value    74

# =============================================================================
# SET MANAGEMENT TESTS
# =============================================================================
User can create a new set
    [Setup]    Setup for workout tests    Manual Test Workout 7
    ${set_delete_2} =    Set Variable    (${SET_DELETE})[2]

    # Set Normal Modal Fields
    Edit Complete Exercise Set    Pullups    1
    ...    SET_REPS=99
    ...    SET_WEIGHT=98
    ...    SET_REST=97
    ...    SET_GROUP=96
    ...    SET_NOTES=95

    # Copies the last set value
    Click Element    ${ADD_SET}
    Verify Complete Exercise Set    Pullups    3
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Pullups
    ...    ${SET_NOTES}=Click to add notes...

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
    Go To A Workout    Manual Test Workout 7
    Click Element    ${EDIT_WORKOUT_BTN}
    Element Should Not Be Visible    ${set_delete_2}

    # Copies the last set value but this time with non zero/default value
    Click Element    ${ADD_SET}
    Verify Complete Exercise Set    Pullups    2
    ...    ${SET_REPS}=99
    ...    ${SET_WEIGHT}=98
    ...    ${SET_REST}=97
    ...    ${SET_GROUP}=96
    ...    ${SET_NOTES}=Click to add notes...

    # From here we just assume that this is a valid and otherwise totally normal set field so I dont bother messign with it
    
Lifts must be completed and uncompleted in order
    [Setup]    Setup for workout tests    Manual Test Workout 8

    # Can't complete a set until the one before it is complete
    Toggle complete set field    Pullups    2
    ${complete_2} =    Get nth set elem of exercise    Pullups    ${SET_COMPLETE}    2
    Element Should Be Disabled    ${complete_2}

    # Can't uncomplete a set before the one that preceds is uncomplete
    Toggle complete set field    Pullups    1
    Toggle complete set field    Pullups    2
    Toggle complete set field    Pullups    1
    Element Should Have Class    ${SET_COMPLETE}    bg-green-800   # Still complete bc the toggle failed

# =============================================================================
# UI STATE & VALIDATION TESTS
# =============================================================================
You are warned before trying to complete a workout
    [Setup]    Setup for workout tests    Manual Test Workout 9
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    0.5s
    Click Element    ${COMPLETE_WORKOUT_BTN}
    Element Should Be Visible    ${COMPLETE_WORKOUT_CONFIRM}

Pre-edit toggle visibility and edit rules
    [Setup]    Setup for workout tests    Manual Test Workout 10
    Edit set note field    Pullups    1    More test text
    Click Element    ${EDIT_WORKOUT_BTN}

    # Confirm that the below are visible and editable without toggle engaged and that the cancel button works
    Validate that edit modal opens on click and cancel works   ${SET_REPS}    0
    Validate that edit modal opens on click and cancel works   ${SET_WEIGHT}    0

    Element Should Be Visible    ${COMPLETE_WORKOUT_BTN}
    Click Element    ${COMPLETE_WORKOUT_BTN}
    Wait Until Keyword Succeeds    3x    1s    Click Element    ${COMPLETE_WORKOUT_CANCEL}
    Element Should Be Visible    ${COMPLETE_WORKOUT_BTN}
    
    # Confirm that the below are visible and editable without toggle engaged
    Element Should Be Visible   ${EXERCISE_NOTES}
    Click Element    ${EXERCISE_NOTES}
    Wait Until Element Is Visible    ${EXERCISE_NOTES_INPUT}
    Input Text    ${EXERCISE_NOTES_INPUT}    Test text
    Click Element    ${EXERCISE_NOTES_SAVE}
    Element Text Should Be   ${EXERCISE_NOTES}    Test text
    
    Element Should Be Visible    ${SET_COMPLETE}
    Click Element    ${SET_COMPLETE}
    Element Should Have Class    ${SET_COMPLETE}    bg-green-500   

    # Confirm that the below are visible but not editable
    Page Should Contain    Pullups
    Page should Contain    Rest:
    Page Should Contain    More test text
    Element Should Not Be Visible    ${SET_REST}

Other cancel edit buttons
    [Setup]    Setup for workout tests    Manual Test Workout 11
    Validate that edit modal opens on click and cancel works    ${SET_REST}    0
    Validate that edit modal opens on click and cancel works    ${SET_GROUP}    Pullups
    Click Element  ${SET_NOTES}    
    Input text    ${SET_NOTES_INPUT}    More test bs
    Click Element    ${CANCEL_BTN}
    Element Text Should Be    ${SET_NOTES}    Click to add notes...

The timer works as expected
    [Setup]    Setup for workout tests    Manual Test Workout 12
    Make edit to field that uses single input modal    Pullups    1    ${SET_REST}    0:10
    Make edit to field that uses single input modal    Pullups    2    ${SET_REST}    0:03
    
    # Complete first set and verify timer starts
    ${set_2_complete_btn} =    Get nth set elem of exercise    Pullups    ${SET_COMPLETE}    2
    Click Element    ${SET_COMPLETE}
    
    # Verify timer is visible and set completion buttons are disabled during countdown
    Element Should Be Visible    ${SKIP_WAIT}
    Element Should Be Disabled    ${set_2_complete_btn}
    
    # Test skip rest dialog - cancel functionality
    Click Element    ${SKIP_WAIT}
    Wait Until Element Is Visible    ${CANCEL_SKIP_WAIT}
    Click Element    ${CANCEL_SKIP_WAIT}
    
    # Timer should still be running after cancel
    Element Should Be Visible    ${SKIP_WAIT}
    Element Should Be Disabled    ${set_2_complete_btn}
    
    # Test skip rest dialog - confirm functionality  
    Click Element    ${SKIP_WAIT}
    Wait Until Element Is Visible    ${CONFIRM_SKIP_WAIT}
    Click Element    ${CONFIRM_SKIP_WAIT}
    
    # Timer should be gone and buttons re-enabled
    Wait Until Element Is Not Visible    ${SKIP_WAIT}    timeout=2s
    Element Should Be Enabled    ${set_2_complete_btn}
    
    # Complete second set and verify shorter timer
    Click Element    ${set_2_complete_btn}
    Element Should Be Visible    ${SKIP_WAIT}
    
    # Let this timer expire naturally to verify audio alert
    Wait Until Element Is Not Visible    ${SKIP_WAIT}    timeout=5s
    
When a workout is completed it rolls over as expected
    [Setup]    Setup for workout tests    Manual Test Workout 13
    # Set normal lift fields
    Edit Complete Exercise Set    Pullups    1
    ...    SET_REPS=10
    ...    SET_WEIGHT=30
    ...    SET_REST=60
    ...    SET_GROUP=Pullups
    ...    SET_NOTES=Machine Settings: 2nd pin

    Edit Complete Exercise Set    Pullups    2
    ...    SET_REPS=10
    ...    SET_WEIGHT=30
    ...    SET_REST=0
    ...    SET_GROUP=Pullups

    Click Element    ${ADD_SET}
    Edit Complete Exercise Set    Pullups    3
    ...    SET_WEIGHT=10
    ...    SET_GROUP=Pullups Dropset
    ...    SET_NOTES=DROPSET!

    # Complete the sets
    Toggle complete set field    Pullups    1
    Toggle complete set field    Pullups    2
    Toggle complete set field    Pullups    3

    # Title change and lift notes
    Set exercise level notes     Pullups    9/10 on last dropset. Keeping weight. Form focus.   
    Sleep    2s
    Make edit to field that uses single input modal    Pullups    1    ${EXERCISE_TITLE}    PULLUPS

    # Set next lift info
    Click Element    ${NEXT_WEIGHT_BTN}
    Clear Element Text    (${NEXT_WEIGHT_INPUT})[1]
    Input Text    (${NEXT_WEIGHT_INPUT})[1]    30+2.5
    Sleep   1s
    Input Text    (${NEXT_WEIGHT_INPUT})[2]    15
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Wait Until Element Is Visible    ${NEXT_WEIGHT_BTN_DONE}

    # Create New Exercise
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Click Element    ${ADD_EXERCISE_BTN}
    Populate New Exercise Info    Chin Ups    1
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)

    # Set simple lift fields
    Edit Complete Exercise Set    Chin Ups    1
    ...    SET_REPS=10
    ...    SET_WEIGHT=20
    ...    SET_REST=60
    ...    SET_NOTES=Machine Settings: 2/4 pins
    Sleep    2s

    Click Element    (${ADD_SET})[2]
    Edit Complete Exercise Set    Chin Ups    2
    ...    SET_REST=0

    # Complete the next lift
    Toggle complete set field    Chin Ups    1
    Toggle complete set field    Chin Ups    2
    Set exercise level notes     Chin Ups    8/10 on last set  

    # Set next lift info
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Click Element    ${NEXT_WEIGHT_BTN}
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Click Element    (${COLLAPSE_EXERCISE_BTN})[2]
    Wait Until Element Is Visible    ${NEXT_WEIGHT_BTN_DONE}

    # Slight pause for the save process
    Sleep    1s

    # VERIFICATION OF THE ABOVE
    Reload Page
    Go To A Workout    Manual Test Workout 13
    Click Element    ${EDIT_WORKOUT_BTN}

    # Verify the first exercise group
    Verify exercise set field value    PULLUPS    ${EXERCISE_TITLE}   1    PULLUPS
    
    Verify Complete Exercise Set    PULLUPS    1
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=30
    ...    ${SET_REST}=60
    ...    ${SET_GROUP}=Pullups
    ...    ${SET_NOTES}=Machine Settings: 2nd pin
    Element Should Have Class    ${SET_COMPLETE}    bg-green-800

    Verify Complete Exercise Set    PULLUPS    2
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=30
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Pullups
    ...    ${SET_NOTES}=Click to add notes...
    Element Should Have Class    (${SET_COMPLETE})[2]    bg-green-800

    Verify Complete Exercise Set    PULLUPS    3
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=10
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Pullups Dropset
    ...    ${SET_NOTES}=DROPSET!
    Element Should Have Class    (${SET_COMPLETE})[3]    bg-green-500

    Verify exercise set field value    PULLUPS    ${EXERCISE_NOTES}    1   9/10 on last dropset. Keeping weight. Form focus.
    Click Next Weight Done Button
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    30+2.5
    Element Attribute Value Should Be    (${NEXT_WEIGHT_INPUT})[2]    value    15
    Click Element    ${NEXT_WEIGHT_CANCEL}

    # Verify the second exercise group
    Verify exercise set field value    Chin Ups    ${EXERCISE_TITLE}   1    Chin Ups
    
    Verify Complete Exercise Set    Chin Ups    1
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=20
    ...    ${SET_REST}=60
    ...    ${SET_GROUP}=Chin Ups
    ...    ${SET_NOTES}=Machine Settings: 2/4 pins
    Element Should Have Class    (${SET_COMPLETE})[4]    bg-green-800

    Verify Complete Exercise Set    Chin Ups    2
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=20
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Chin Ups
    ...    ${SET_NOTES}=Click to add notes...
    Element Should Have Class    (${SET_COMPLETE})[5]    bg-green-500

    Verify exercise set field value    Chin Ups    ${EXERCISE_NOTES}    1   8/10 on last set  
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Click Next Weight Done Button    (${NEXT_WEIGHT_BTN_DONE})[2]
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    20
    Click Element    ${NEXT_WEIGHT_CANCEL}

    # ROLL OVER TESTING STARTS
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Click Element    (${COLLAPSE_EXERCISE_BTN})[2]
    Click Element    ${COMPLETE_WORKOUT_BTN}
    Click Element    ${COMPLETE_WORKOUT_CONFIRM}
    Sleep    1s
    Go To A Workout    Manual Test Workout 13
    Click Element    ${EDIT_WORKOUT_BTN}

    # Verify the first exercise group
    Verify exercise set field value    PULLUPS    ${EXERCISE_TITLE}   1    PULLUPS
    Element Text Should Be   //p[contains(@class,'zz_last_lift_notes')]    9/10 on last dropset. Keeping weight. Form focus.
    
    Verify Complete Exercise Set    PULLUPS    1
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=30+2.5
    ...    ${SET_REST}=60
    ...    ${SET_GROUP}=Pullups
    ...    ${SET_NOTES}=Machine Settings: 2nd pin
    Element Should Have Class    ${SET_COMPLETE}    bg-gray-200

    Verify Complete Exercise Set    PULLUPS    2
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=30+2.5
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Pullups
    ...    ${SET_NOTES}=Click to add notes...
    Element Should Have Class    (${SET_COMPLETE})[2]    bg-gray-300

    Verify Complete Exercise Set    PULLUPS    3
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=15
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Pullups Dropset
    ...    ${SET_NOTES}=DROPSET!
    Element Should Have Class    (${SET_COMPLETE})[3]    bg-gray-300

    Verify exercise set field value    PULLUPS    ${EXERCISE_NOTES}    1   Click to add notes about this exercise...
    Element Should Be Visible    //button[contains(@class,'zz_btn_copy_previous_notes')]

    # Verify the second exercise group
    Verify exercise set field value    Chin Ups    ${EXERCISE_TITLE}   1    Chin Ups
    Element Text Should Be   (//p[contains(@class,'zz_last_lift_notes')])[2]    8/10 on last set
    
    Verify Complete Exercise Set    Chin Ups    1
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=20
    ...    ${SET_REST}=60
    ...    ${SET_GROUP}=Chin Ups
    ...    ${SET_NOTES}=Machine Settings: 2/4 pins
    Element Should Have Class    (${SET_COMPLETE})[4]    bg-gray-200

    Verify Complete Exercise Set    Chin Ups    2
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=20
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Chin Ups
    ...    ${SET_NOTES}=Click to add notes...
    Element Should Have Class    (${SET_COMPLETE})[5]    bg-gray-300

    Verify exercise set field value    Chin Ups    ${EXERCISE_NOTES}    1   Click to add notes about this exercise...
    Element Should Be Visible    (//button[contains(@class,'zz_btn_copy_previous_notes')])[2]

    # Copy button works
    Click Element    //button[contains(@class,'zz_btn_copy_previous_notes')]
    Verify exercise set field value    PULLUPS    ${EXERCISE_NOTES}    1   9/10 on last dropset. Keeping weight. Form focus.
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Click Element    (//button[contains(@class,'zz_btn_copy_previous_notes')])[2]
    Verify exercise set field value    Chin Ups    ${EXERCISE_NOTES}    1   8/10 on last set  

    # Nothing weird in the next notes section
    Toggle complete set field    PULLUPS    1
    Toggle complete set field    PULLUPS    2
    Toggle complete set field    PULLUPS    3

    Click Element    ${NEXT_WEIGHT_BTN}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    30+2.5
    Element Attribute Value Should Be    (${NEXT_WEIGHT_INPUT})[2]    value    15
    Click Element    ${NEXT_WEIGHT_CANCEL}

    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Toggle complete set field    Chin Ups    1
    Toggle complete set field    Chin Ups    2

    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Click Element    (${NEXT_WEIGHT_BTN})[2]
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    20
    Click Element    ${NEXT_WEIGHT_CANCEL}

Complete workout button less aggressive until all next weights are set
    [Documentation]    Complete Workout button is disabled until all exercises have next weights set
    [Setup]    Setup for workout tests    Manual Test Workout 18
    
    Element Should Have Class    ${COMPLETE_WORKOUT_BTN}     bg-gray-700

    # Add a weight to first exercise and complete both sets
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    100
    Toggle complete set field    Pullups    1
    Element Should Have Class    ${COMPLETE_WORKOUT_BTN}     bg-gray-700
    Toggle complete set field    Pullups    2
    Element Should Have Class    ${COMPLETE_WORKOUT_BTN}     bg-gray-700
    
    # Verify next weight button appears
    Element Should Be Visible    ${NEXT_WEIGHT_BTN}
    
    # Complete Workout button should be disabled (grayed out)
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    0.5s
    Element Should Be Visible    ${COMPLETE_WORKOUT_BTN}
    ${btn_classes} =    Get Element Attribute    ${COMPLETE_WORKOUT_BTN}    class
    Element Should Have Class    ${COMPLETE_WORKOUT_BTN}     bg-gray-700
    
    # Set all next weights (in the case just the one)
    Click Element    ${NEXT_WEIGHT_BTN}
    Click Element    ${NEXT_WEIGHT_CONFIRM}

    # Now the button should be a lot more in your face
    Element Should Have Class    ${COMPLETE_WORKOUT_BTN}     bg-green-600

Auto-set next weight to dash when all weights are dash
    [Documentation]    When all sets have "-" weight, completing the last set should auto-set next weight to "-"
    [Setup]    Setup for workout tests    Manual Test Workout 19
    
    ${sets_visible} =    Run Keyword And Return Status  Element Should Be Visible    ${SET_REPS}
    IF    not ${sets_visible}
        Click Element    ${COLLAPSE_EXERCISE_BTN}
    END

    # Set all weights to "-"
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    -
    Make edit to field that uses single input modal    Pullups    2    ${SET_WEIGHT}    -
    
    # Verify weights are set to "-"
    Verify exercise set field value    Pullups    ${SET_WEIGHT}    1    -
    Verify exercise set field value    Pullups    ${SET_WEIGHT}    2    -
    
    # Verify exercise has weight group
    Verify exercise set field value    Pullups    ${SET_GROUP}    1    Pullups
    Verify exercise set field value    Pullups    ${SET_GROUP}    2    Pullups
    
    # Verify Set Next Weight button is NOT visible yet
    Element Should Not Be Visible    ${NEXT_WEIGHT_BTN}
    Element Should Not Be Visible    ${NEXT_WEIGHT_BTN_DONE}
    
    # Complete first set - should not auto-set
    Toggle complete set field    Pullups    1
    Element Should Not Be Visible    ${NEXT_WEIGHT_BTN}
    Element Should Not Be Visible    ${NEXT_WEIGHT_BTN_DONE}
    
    # Complete last set - should AUTO-SET next weight to "-"
    Toggle complete set field    Pullups    2
    Sleep    0.5s
    
    # Verify exercise auto-collapsed
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Not Be Visible    ${SET_WEIGHT}
    
    # Verify completion indicator is visible
    Element Should Be Visible    ${EXERCISE_COMPLETE_INDICATOR}
    
    # Verify "Exercise Complete" button is visible (not "Set Next Weight")
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    0.5s
    Element Should Be Visible    ${NEXT_WEIGHT_BTN_DONE}
    
    # verify the next weight was auto-set to "-"
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Wait Until Element Is Visible    ${NEXT_WEIGHT_INPUT}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    -
    
    # Close modal
    Click Element    ${NEXT_WEIGHT_CANCEL}
    
    # Verify state persists after reload
    Sleep    1s
    Reload Page
    Go To A Workout    Manual Test Workout 19
    
    # Should not be collapsed with completion indicator
    Element Should Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_COMPLETE_INDICATOR}
    
    # Verify next weight is still "-"
    Click Element    ${NEXT_WEIGHT_BTN_DONE}
    Wait Until Element Is Visible    ${NEXT_WEIGHT_INPUT}
    Element Attribute Value Should Be    ${NEXT_WEIGHT_INPUT}    value    -
    Click Element    ${NEXT_WEIGHT_CANCEL}
    
    # Verify Complete Workout button is enabled (green)
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    0.5s
    Element Should Have Class    ${COMPLETE_WORKOUT_BTN}    bg-green-600

# =============================================================================
# EXERCISE COLLAPSE TESTS
# =============================================================================
Exercise can be manually collapsed and expanded
    [Documentation]    User can manually collapse and expand exercises using the caret button
    [Setup]    Setup for workout tests    Manual Test Workout 14
    
    ${sets_visible} =    Run Keyword And Return Status  Element Should Be Visible    ${SET_REPS}
    IF    not ${sets_visible}
        Click Element    ${COLLAPSE_EXERCISE_BTN}
    END

    # Verify exercise content is visible initially
    Element Should Be Visible    ${SET_REPS}
    Element Should Be Visible    ${SET_WEIGHT}
    Element Should Be Visible    ${EXERCISE_NOTES}
    
    # Click collapse button
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    0.5s
    
    # Verify exercise content is hidden
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Not Be Visible    ${SET_WEIGHT}
    Element Should Not Be Visible    ${EXERCISE_NOTES}
    
    # Verify exercise title is still visible
    Element Should Be Visible    ${EXERCISE_TITLE}
    
    # Click expand button
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    0.5s
    
    # Verify exercise content is visible again
    Element Should Be Visible    ${SET_REPS}
    Element Should Be Visible    ${SET_WEIGHT}
    Element Should Be Visible    ${EXERCISE_NOTES}
    
    # Verify collapse state persists after page reload
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    1s
    Reload Page
    Go To A Workout    Manual Test Workout 14
    
    # Content should still be hidden after reload
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_TITLE}

Exercise auto-collapses when setting next weights
    [Documentation]    Exercise automatically collapses after user sets weights for next lift
    [Setup]    Setup for workout tests    Manual Test Workout 15

    ${sets_visible} =    Run Keyword And Return Status  Element Should Be Visible    ${SET_REPS}
    IF    not ${sets_visible}
        Click Element    ${COLLAPSE_EXERCISE_BTN}
    END
    
    # Setup and complete sets
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    100
    Toggle complete set field    Pullups    1
    Toggle complete set field    Pullups    2
    
    # Verify exercise is expanded and next weight button is visible
    Element Should Be Visible    ${SET_REPS}
    Element Should Be Visible    ${SET_WEIGHT}
    Element Should Be Visible    ${NEXT_WEIGHT_BTN}
    
    # Open and set next weights
    Click Element    ${NEXT_WEIGHT_BTN}
    Wait Until Element Is Visible    ${NEXT_WEIGHT_INPUT}
    Input Text    ${NEXT_WEIGHT_INPUT}    105
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Sleep    0.5s
    
    # Verify exercise auto-collapsed
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Not Be Visible    ${SET_WEIGHT}
    Element Should Not Be Visible    ${EXERCISE_NOTES}
    
    # Verify exercise title is still visible
    Element Should Be Visible    ${EXERCISE_TITLE}
    
    # Verify collapse persists after reload
    Sleep    1s
    Reload Page
    Go To A Workout    Manual Test Workout 15
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_TITLE}

Completion indicator shows on completed exercises
    [Documentation]    Green checkmark appears next to exercise name when weights are set, regardless of collapse state
    [Setup]    Setup for workout tests    Manual Test Workout 16
    
    ${sets_visible} =    Run Keyword And Return Status  Element Should Be Visible    ${SET_REPS}
    IF    not ${sets_visible}
        Click Element    ${COLLAPSE_EXERCISE_BTN}
    END

    # Setup and complete sets
    Make edit to field that uses single input modal    Pullups    1    ${SET_WEIGHT}    100
    Toggle complete set field    Pullups    1
    Toggle complete set field    Pullups    2
    
    # Verify no checkmark before setting weights
    Element Should Not Be Visible    ${EXERCISE_COMPLETE_INDICATOR}
    
    # Set next weights (this will auto-collapse)
    Click Element    ${NEXT_WEIGHT_BTN}
    Wait Until Element Is Visible    ${NEXT_WEIGHT_INPUT}
    Input Text    ${NEXT_WEIGHT_INPUT}    105
    Click Element    ${NEXT_WEIGHT_CONFIRM}
    Sleep    0.5s
    
    # Verify exercise is collapsed and checkmark is visible
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_COMPLETE_INDICATOR}
    
    # Expand exercise - checkmark should STILL be visible
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    0.5s
    Element Should Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_COMPLETE_INDICATOR}
    
    # Collapse again - checkmark should still be visible
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    0.5s
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_COMPLETE_INDICATOR}
    
    # Verify state persists after reload
    Sleep    1s
    Reload Page
    Go To A Workout    Manual Test Workout 16
    Element Should Not Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_COMPLETE_INDICATOR}
    
    # Expand and verify checkmark still visible
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    0.5s
    Element Should Be Visible    ${SET_REPS}
    Element Should Be Visible    ${EXERCISE_COMPLETE_INDICATOR}

Collapse works with multiple exercises
    [Documentation]    Multiple exercises can be collapsed independently
    [Setup]    Setup for workout tests    Manual Test Workout 17
    
    # Add second exercise
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Click Element    ${ADD_EXERCISE_BTN}
    Populate New Exercise Info    Chin Ups    2
    Sleep    1s
    
    # Collapse first exercise
    ${sets_visible} =    Run Keyword And Return Status  Element Should Be Visible    //div[./div/div/h2[text()='Pullups']]${SET_REPS}
    WHILE    ${sets_visible}
        Execute JavaScript    window.scrollTo(0, 0)
        Click Element    ${COLLAPSE_EXERCISE_BTN}
        Sleep    0.5s
        ${sets_visible} =    Run Keyword And Return Status  Element Should Be Visible    //div[./div/div/h2[text()='Pullups']]${SET_REPS}
    END
    
    # Verify first is collapsed, second is expanded
    ${first_set_reps} =    Get nth set elem of exercise    Pullups    ${SET_REPS}    1
    ${second_set_reps} =    Get nth set elem of exercise    Chin Ups    ${SET_REPS}    1
    Element Should Not Be Visible    ${first_set_reps}
    Element Should Be Visible    ${second_set_reps}
    
    # Collapse second exercise
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    ${second_collapse_btn} =    Set Variable    (${COLLAPSE_EXERCISE_BTN})[2]
    Click Element    ${second_collapse_btn}
    Sleep    0.5s
    
    # Verify both are collapsed
    Element Should Not Be Visible    ${first_set_reps}
    Element Should Not Be Visible    ${second_set_reps}
    
    # Expand first only
    Execute JavaScript    window.scrollTo(0, 0)
    Click Element    ${COLLAPSE_EXERCISE_BTN}
    Sleep    0.5s
    
    # Verify first is expanded, second still collapsed
    Element Should Be Visible    ${first_set_reps}
    Element Should Not Be Visible    ${second_set_reps}

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
    Go To A Workout    ${workout_name}
    ${edit_btn_value} =    Get Text    ${EDIT_WORKOUT_BTN}
    IF    $edit_btn_value != 'Done'
        Click Element    ${EDIT_WORKOUT_BTN}
        Sleep   0.5s
    END

Make edit to field that uses single input modal
    [Arguments]    ${exercise}    ${n_set}    ${elem}    ${value}
    ${target} =    Get nth set elem of exercise    ${exercise}    ${elem}    ${n_set}
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
    ${target_complete} =    Get nth set elem of exercise    ${exercise}    ${SET_COMPLETE}    ${n_set}
    Click Element  ${target_complete}
    ${is_visible}=    Run Keyword And Return Status    Wait Until Element Is Visible    ${SKIP_WAIT}    timeout=2s
    IF    ${is_visible}
        Click Element    ${SKIP_WAIT}
        Click Element    ${CONFIRM_SKIP_WAIT}
    END

Set exercise level notes
    [Arguments]     ${exercise}    ${text}
    ${target_exercise_notes} =     Get nth set elem of exercise    ${exercise}     ${EXERCISE_NOTES}    1
    Click Element    ${target_exercise_notes}
    Wait Until Element Is Visible    ${EXERCISE_NOTES_INPUT}
    Input Text    ${EXERCISE_NOTES_INPUT}    ${text}
    Click Element    ${EXERCISE_NOTES_SAVE}

Validate that edit modal opens on click and cancel works
    [Arguments]    ${elem}    ${expected_value}
    Click Element    ${elem}
    Input Text    ${INPUT_EDIT_WORKOUT}    99
    Element Should Be Visible    ${SAVE_WORKOUT_EDIT}
    Click Element    ${CANCEL_WORKOUT_EDIT}
    Element Text Should Be    ${elem}    ${expected_value}

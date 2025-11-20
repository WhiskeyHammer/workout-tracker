*** Settings ***
Resource          resources.resource
Suite Setup       Open Browser And Login
Suite Teardown    Delete All Workouts
Test Setup        Go To Import Page
Test Teardown     Delete All Workouts    ${False}

*** Test Cases ***
# =============================================================================
# FILE IMPORT TESTS
# =============================================================================
Create a workout using csv
    ${file_input} =    Set Variable    //input[@type='file']
    Choose File    ${file_input}    ${CURDIR}/data/test.csv
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '7'
    Click Element    ${EDIT_WORKOUT_BTN}
    Wait Until Element Is Visible    ${SET_REPS}    5s
    
    # Verify Underhand Pullups exercise (4 sets)
    Verify Complete Exercise Set    Underhand Pullups    1
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=30
    ...    ${SET_REST}=0.05
    ...    ${SET_GROUP}=Underhand Pullups
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Underhand Pullups    2
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=30
    ...    ${SET_REST}=0.05
    ...    ${SET_GROUP}=Underhand Pullups
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Underhand Pullups    3
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=30
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Underhand Pullups
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Underhand Pullups    4
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=72
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Underhand Pullups Dropset
    ...    ${SET_NOTES}=Dropset
    
    Verify exercise set field value    Underhand Pullups    ${EXERCISE_NOTES}    1    Click to add notes about this exercise...
    
    # Verify Incline DB Press exercise (3 sets)
    Verify Complete Exercise Set    Incline DB Press    1
    ...    ${SET_REPS}=8
    ...    ${SET_WEIGHT}=65
    ...    ${SET_REST}=0.05
    ...    ${SET_GROUP}=Incline DB Press
    ...    ${SET_NOTES}=2nd hole
    
    Verify Complete Exercise Set    Incline DB Press    2
    ...    ${SET_REPS}=8
    ...    ${SET_WEIGHT}=65
    ...    ${SET_REST}=0.05
    ...    ${SET_GROUP}=Incline DB Press
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Incline DB Press    3
    ...    ${SET_REPS}=8
    ...    ${SET_WEIGHT}=65
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Incline DB Press
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify exercise set field value    Incline DB Press    ${EXERCISE_NOTES}    1    Click to add notes about this exercise...

Create a workout using json
    ${file_input} =    Set Variable    //input[@type='file']
    Choose File    ${file_input}    ${CURDIR}/data/test.json
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Dumbbell Curls')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '10'
    Click Element    ${EDIT_WORKOUT_BTN}
    Wait Until Element Is Visible    ${SET_REPS}    5s
    
    # Verify Underhand Pullups exercise (4 sets)
    Verify Complete Exercise Set    Underhand Pullups    1
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=10
    ...    ${SET_REST}=0.16
    ...    ${SET_GROUP}=Underhand Pullups
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Underhand Pullups    2
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=10
    ...    ${SET_REST}=0.16
    ...    ${SET_GROUP}=Underhand Pullups
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Underhand Pullups    3
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=10
    ...    ${SET_REST}=0.16
    ...    ${SET_GROUP}=Underhand Pullups
    ...    ${SET_NOTES}=dfsdfsdf
    
    Verify Complete Exercise Set    Underhand Pullups    4
    ...    ${SET_REPS}=10
    ...    ${SET_WEIGHT}=10
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Underhand Pullups - Dropset
    ...    ${SET_NOTES}=drop set but it's okay to flame out
    
    Verify exercise set field value    Underhand Pullups    ${EXERCISE_NOTES}    1    Click to add notes about this exercise...
        
    # Verify Dumbbell Curls exercise (3 sets)
    Verify Complete Exercise Set    Dumbbell Curls    1
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Dumbbell Curls
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Dumbbell Curls    2
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Dumbbell Curls
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Dumbbell Curls    3
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Dumbbell Curls
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify exercise set field value    Dumbbell Curls    ${EXERCISE_NOTES}    1    New notes
    
    # Verify Incline DB Press exercise (3 sets)
    Verify Complete Exercise Set    Incline DB Press    1
    ...    ${SET_REPS}=8
    ...    ${SET_WEIGHT}=65
    ...    ${SET_REST}=2
    ...    ${SET_GROUP}=Incline DB Press
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Incline DB Press    2
    ...    ${SET_REPS}=8
    ...    ${SET_WEIGHT}=65
    ...    ${SET_REST}=2
    ...    ${SET_GROUP}=Incline DB Press
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Incline DB Press    3
    ...    ${SET_REPS}=8
    ...    ${SET_WEIGHT}=65
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Incline DB Press
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify exercise set field value    Incline DB Press    ${EXERCISE_NOTES}    1    Click to add notes about this exercise...

# =============================================================================
# MANUAL WORKOUT CREATION TESTS
# =============================================================================
Create a manual workout
    Create Manual Exercise    Pullups    2
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '2'
    Click Element    ${EDIT_WORKOUT_BTN}
    Wait Until Element Is Visible    ${SET_REPS}    5s
    
    Verify Complete Exercise Set    Pullups    1
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Pullups
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify Complete Exercise Set    Pullups    2
    ...    ${SET_REPS}=0
    ...    ${SET_WEIGHT}=0
    ...    ${SET_REST}=0
    ...    ${SET_GROUP}=Pullups
    ...    ${SET_NOTES}=Click to add notes...
    
    Verify exercise set field value    Pullups    ${EXERCISE_NOTES}    1   Click to add notes about this exercise...
    [Teardown]   Click Element   ${BACK_BUTTON}
    # Approved

Cancel the creation of a manual import
    Click Element    ${MANUAL_IMPORT_BTN}
    Wait Until Element Is Visible    ${EXERCISE_NAME_INPUT}
    Input Text    ${EXERCISE_NAME_INPUT}    Pullups
    Input Text    ${EXERCISE_SETS_INPUT}    2
    Wait Until Element Is Enabled    ${CANCEL_BTN}
    Click Element    ${CANCEL_BTN}
    Wait Until Element Is Visible    ${MANUAL_IMPORT_BTN}
    # Approved

# =============================================================================
# NAVIGATION TESTS
# =============================================================================
The back button takes you back to the library page
    Click Element    ${BACK_BUTTON}
    Wait Until Element Is Not Visible    ${MANUAL_IMPORT_BTN}
    # Approved

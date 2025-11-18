*** Settings ***
Resource          resources.resource
Suite Setup       Open Browser And Login
Suite Teardown    Delete All Workouts
Test Setup        Go to import page

*** Test Cases ***
Create a workout using csv
    ${file_input} =    Set Variable    //input[@type='file']
    Choose File    ${file_input}    ${CURDIR}/data/test.csv
    Sleep    1s
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '7'
    Click Element    ${EDIT_WORKOUT_BTN}
    Sleep    1s
    
    # Verify Underhand Pullups exercise (4 sets)
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    1    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    1    30
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    1    0.05
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    1    Underhand Pullups
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    1    Click to add notes...
    
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    2    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    2    30
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    2    0.05
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    2    Underhand Pullups
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    2    Click to add notes...
    
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    3    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    3    30
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    3    0
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    3    Underhand Pullups
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    3    Click to add notes...
    
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    4    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    4    72
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    4    0
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    4    Underhand Pullups Dropset
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    4    Dropset
    
    Verify exercise set field value    Underhand Pullups    ${EXERCISE_NOTES_TEXTAREA}    1    ${EMPTY}
    
    # Verify Incline DB Press exercise (3 sets)
    Verify exercise set field value    Incline DB Press    ${SET_REPS}    1    8
    Verify exercise set field value    Incline DB Press    ${SET_WEIGHT}    1    65
    Verify exercise set field value    Incline DB Press    ${SET_REST}    1    0.05
    Verify exercise set field value    Incline DB Press    ${SET_GROUP}    1    Incline DB Press
    Verify exercise set field value    Incline DB Press    ${SET_NOTES}    1    2nd hole
    
    Verify exercise set field value    Incline DB Press    ${SET_REPS}    2    8
    Verify exercise set field value    Incline DB Press    ${SET_WEIGHT}    2    65
    Verify exercise set field value    Incline DB Press    ${SET_REST}    2    0.05
    Verify exercise set field value    Incline DB Press    ${SET_GROUP}    2    Incline DB Press
    Verify exercise set field value    Incline DB Press    ${SET_NOTES}    2    Click to add notes...
    
    Verify exercise set field value    Incline DB Press    ${SET_REPS}    3    8
    Verify exercise set field value    Incline DB Press    ${SET_WEIGHT}    3    65
    Verify exercise set field value    Incline DB Press    ${SET_REST}    3    0
    Verify exercise set field value    Incline DB Press    ${SET_GROUP}    3    Incline DB Press
    Verify exercise set field value    Incline DB Press    ${SET_NOTES}    3    Click to add notes...
    
    Verify exercise set field value    Incline DB Press    ${EXERCISE_NOTES_TEXTAREA}    1    ${EMPTY}

Create a workout using json
    ${file_input} =    Set Variable    //input[@type='file']
    Choose File    ${file_input}    ${CURDIR}/data/test.json
    Sleep    1s
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Dumbbell Curls')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '10'
    Click Element    ${EDIT_WORKOUT_BTN}
    Sleep    1s
    
    # Verify Underhand Pullups exercise (4 sets)
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    1    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    1    10
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    1    0.16
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    1    Underhand Pullups
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    1    Click to add notes...
    
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    2    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    2    10
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    2    0.16
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    2    Underhand Pullups
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    2    Click to add notes...
    
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    3    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    3    10
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    3    0.16
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    3    Underhand Pullups
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    3    dfsdfsdf
    
    Verify exercise set field value    Underhand Pullups    ${SET_REPS}    4    10
    Verify exercise set field value    Underhand Pullups    ${SET_WEIGHT}    4    10
    Verify exercise set field value    Underhand Pullups    ${SET_REST}    4    0
    Verify exercise set field value    Underhand Pullups    ${SET_GROUP}    4    Underhand Pullups - Dropset
    Verify exercise set field value    Underhand Pullups    ${SET_NOTES}    4    drop set but it's okay to flame out
    
    Verify exercise set field value    Underhand Pullups    ${EXERCISE_NOTES_TEXTAREA}    1    ${EMPTY}
        
    # Verify Dumbbell Curls exercise (3 sets)
    Verify exercise set field value    Dumbbell Curls    ${SET_REPS}    1    0
    Verify exercise set field value    Dumbbell Curls    ${SET_WEIGHT}    1    0
    Verify exercise set field value    Dumbbell Curls    ${SET_REST}    1    0
    Verify exercise set field value    Dumbbell Curls    ${SET_GROUP}    1    Dumbbell Curls
    Verify exercise set field value    Dumbbell Curls    ${SET_NOTES}    1    Click to add notes...
    
    Verify exercise set field value    Dumbbell Curls    ${SET_REPS}    2    0
    Verify exercise set field value    Dumbbell Curls    ${SET_WEIGHT}    2    0
    Verify exercise set field value    Dumbbell Curls    ${SET_REST}    2    0
    Verify exercise set field value    Dumbbell Curls    ${SET_GROUP}    2    Dumbbell Curls
    Verify exercise set field value    Dumbbell Curls    ${SET_NOTES}    2    Click to add notes...
    
    Verify exercise set field value    Dumbbell Curls    ${SET_REPS}    3    0
    Verify exercise set field value    Dumbbell Curls    ${SET_WEIGHT}    3    0
    Verify exercise set field value    Dumbbell Curls    ${SET_REST}    3    0
    Verify exercise set field value    Dumbbell Curls    ${SET_GROUP}    3    Dumbbell Curls
    Verify exercise set field value    Dumbbell Curls    ${SET_NOTES}    3    Click to add notes...
    
    Verify exercise set field value    Dumbbell Curls    ${EXERCISE_NOTES_TEXTAREA}    1    New notes
    
    # Verify Incline DB Press exercise (3 sets)
    Verify exercise set field value    Incline DB Press    ${SET_REPS}    1    8
    Verify exercise set field value    Incline DB Press    ${SET_WEIGHT}    1    65
    Verify exercise set field value    Incline DB Press    ${SET_REST}    1    2
    Verify exercise set field value    Incline DB Press    ${SET_GROUP}    1    Incline DB Press
    Verify exercise set field value    Incline DB Press    ${SET_NOTES}    1    Click to add notes...
    
    Verify exercise set field value    Incline DB Press    ${SET_REPS}    2    8
    Verify exercise set field value    Incline DB Press    ${SET_WEIGHT}    2    65
    Verify exercise set field value    Incline DB Press    ${SET_REST}    2    2
    Verify exercise set field value    Incline DB Press    ${SET_GROUP}    2    Incline DB Press
    Verify exercise set field value    Incline DB Press    ${SET_NOTES}    2    Click to add notes...
    
    Verify exercise set field value    Incline DB Press    ${SET_REPS}    3    8
    Verify exercise set field value    Incline DB Press    ${SET_WEIGHT}    3    65
    Verify exercise set field value    Incline DB Press    ${SET_REST}    3    0
    Verify exercise set field value    Incline DB Press    ${SET_GROUP}    3    Incline DB Press
    Verify exercise set field value    Incline DB Press    ${SET_NOTES}    3    Click to add notes...
    
    Verify exercise set field value    Incline DB Press    ${EXERCISE_NOTES_TEXTAREA}    1    ${EMPTY}

Create a manual workout
    Create Manual Exercise    Pullups    2
    ${sets} =    Get WebElements    ${SET_ROWS}
    ${set_count} =    Get Length    ${sets}
    Should Be Equal    '${set_count}'    '2'
    Click Element    ${EDIT_WORKOUT_BTN}  
    Sleep    1s   
    Verify exercise set field value    Pullups    ${SET_REPS}   1    0
    Verify exercise set field value    Pullups    ${SET_WEIGHT}   1    0
    Verify exercise set field value    Pullups    ${SET_REST}   1    0
    Verify exercise set field value    Pullups    ${SET_GROUP}   1    Pullups
    Verify exercise set field value    Pullups    ${SET_NOTES}   1    Click to add notes...
    Verify exercise set field value    Pullups    ${SET_REPS}   2    0
    Verify exercise set field value    Pullups    ${SET_WEIGHT}   2    0
    Verify exercise set field value    Pullups    ${SET_REST}   2    0
    Verify exercise set field value    Pullups    ${SET_GROUP}   2    Pullups
    Verify exercise set field value    Pullups    ${SET_NOTES}   2    Click to add notes...
    Verify exercise set field value    Pullups    ${EXERCISE_NOTES_TEXTAREA}    1   ${EMPTY}
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

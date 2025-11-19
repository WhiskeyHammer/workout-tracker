*** Settings ***
Documentation    Combined resource file for all workout tracker tests
Library          SeleniumLibrary
Library          OperatingSystem


*** Variables ***
# =============================================================================
# GLOBAL CONFIGURATION
# =============================================================================
${URL}                       http://localhost:3000
${BROWSER}                   Chrome
${USERNAME}                  whiskeyhammer@outlook.com
${PASSWORD}                  workouttrackerpassy
${OUTPUT_DIR}                tests/test_logs
${OPERATION_INTERSTITIAL}    0.25s

# =============================================================================
# COMMON ELEMENTS (Shared Across Pages)
# =============================================================================
${DARKMODE_BTN}             //button[contains(@class, 'p-2') and contains(@class, 'rounded-lg')]
${LOGOUT_BTN}               //button[contains(@title, 'Logout')]
${BACK_BUTTON}              //button[@title="Back to library"]
${WORKOUT_TITLE}            //h1
${SYNC_SUCCESS_TOAST}       //span[contains(@class,'zz_sync_success')]

# =============================================================================
# WORKOUT LIBRARY PAGE ELEMENTS
# =============================================================================
${CREATE_NEW_BTN}           //button[contains(text(), 'Create New Workout')]
${EDIT_WORKOUTS_BTN}        //button[text()='Edit Workouts' or text()='Done Editing']

# Workout Card XPaths
${WORKOUT_CARDS}            //div[contains(@class, 'rounded-xl') and .//h3[contains(@class, 'font-bold')]]
${START_BUTTON}             //button[contains(text(), 'Start')]
${DELETE_BUTTON}            //button[contains(text(), 'Delete')]

# New Workout Modal XPaths
${NEW_MODAL}                //div[contains(@class, 'fixed') and .//h2[text()='Create New Workout']]
${NEW_MODAL_INPUT}          //input[@placeholder='e.g., Upper Body Day']
${NEW_MODAL_CANCEL}         //div[.//h2[text()='Create New Workout']]//button[text()='Cancel']
${NEW_MODAL_CONTINUE}       //div[.//h2[text()='Create New Workout']]//button[text()='Continue']

# Delete Confirm Modal XPaths
${DELETE_MODAL}             //div[contains(@class, 'fixed') and .//h2[text()='Delete Workout?']]
${DELETE_MODAL_CANCEL}      //div[.//h2[text()='Delete Workout?']]//button[text()='Cancel']
${DELETE_MODAL_DELETE}      //div[.//h2[text()='Delete Workout?']]//button[text()='Delete']

# Edit Name Mode XPaths
${EDIT_NAME_INPUT}          //input[@type='text' and contains(@class, 'border-blue-500')]
${EDIT_NAME_SAVE}           //button[text()='Save' and contains(@class, 'bg-green-600')]
${EDIT_NAME_CANCEL}         //button[text()='Cancel' and contains(@class, 'bg-gray-200')]

# =============================================================================
# IMPORT PAGE ELEMENTS
# =============================================================================
${FILE_IMPORT_BTN}          //label[.//p[contains(text(),'Click to upload CSV or JSON')]]
${MANUAL_IMPORT_BTN}        //button[.//p[contains(text(),'Create Workout Manually')]]

# Add Exercise Modal
${EXERCISE_NAME_INPUT}      //label[text()='Exercise Name']/following-sibling::input
${EXERCISE_SETS_INPUT}      //label[text()='Number of Sets']/following-sibling::input
${CANCEL_BTN}               //button[contains(text(),'Cancel')]
${SAVE_BTN}                 //button[contains(text(),'Add')]

# =============================================================================
# WORKOUT TRACKER PAGE ELEMENTS
# =============================================================================

# Exercise Title
${EXERCISE_TITLE}           //h2[contains(@class, "zz_editable_exercise_name")]

# Common Features
${SET_ROWS}                 //div[./div/button[contains(@class,'rounded-full')]]
${ADD_SET}                  //button[contains(@class, 'zz_btn_add_set')]
${SAVE_WORKOUT_EDIT}        //button[contains(@class,'zz_btn_save')]
${CANCEL_WORKOUT_EDIT}      //button[contains(@class,'zz_btn_cancel_edit ')]
${INPUT_EDIT_WORKOUT}       //input[contains(@class,'zz_input')]

${SKIP_WAIT}                //button[contains(@class,'zz_btn_skip_rest')]
${CONFIRM_SKIP_WAIT}        //button[contains(@class,'zz_btn_confirm_skip_rest')]

${NEXT_WEIGHT_BTN}     //button[contains(@class,'zz_btn_set_next_weight')]
${NEXT_WEIGHT_BTN_DONE}     //button[contains(@class,'zz_btn_exercise_complete')]
${NEXT_WEIGHT_LABEL}        //label[contains(@class,'zz_label_weight_group')]
${NEXT_WEIGHT_INPUT}        //input[contains(@class,'zz_input_weight_group')]
${NEXT_WEIGHT_CONFIRM}      //button[contains(@class,'zz_btn_save_next_weight')]
${NEXT_WEIGHT_CANCEL}       //button[contains(@class,'zz_btn_cancel_next_weight')]

# Exercise Elements
${SET_REPS}                 //span[contains(@class, "zz_editable_reps")]
${SET_WEIGHT}               //span[contains(@class, "zz_editable_weight")]
${SET_REST}                 //span[contains(@class, "zz_editable_rest")]
${SET_GROUP}                //span[contains(@class, "zz_editable_group")]
${SET_NOTES}                //p[contains(@class, "zz_editable_set_notes")]
${SET_DELETE}               //button[contains(@class, "zz_btn_delete_set")]
${SET_DELETE_CONFIRM}       //button[contains(@class, "zz_btn_confirm_delete")]
${SET_DELETE_CANCEL}        //button[contains(@class, "zz_btn_cancel_delete")]
${SET_COMPLETE}             //button[contains(@class, "zz_btn_toggle_set_complete")]
${SET_COMPLETE_CONFIRM}     //button[contains(@class, "zz_btn_confirm_uncomplete")]
${SET_COMPLETE_CANCEL}      //button[contains(@class, "zz_btn_cancel_uncomplete")]
${SET_NOTES_INPUT}          //textarea[contains(@class, "zz_input_edit_notes")]
${ADD_SET_BUTTON}           //button[contains(@class, "zz_btn_add_set")]
${EXERCISE_NOTES_TEXTAREA}  //textarea[contains(@class, "zz_textarea_exercise_notes")]

${ADD_EXERCISE_BUTTON}       //button[contains(@class, "zz_btn_add_exercise_between") or contains(@class, "zz_btn_add_exercise_end")]
${COMPLETE_WORKOUT_BUTTON}   //button[contains(@class, "zz_btn_complete_workout")]
${COMPLETE_WORKOUT_CONFIRM}  //button[contains(@class, "zz_btn_confirm_complete_workout")]
${COMPLETE_WORKOUT_CANCEL}   //button[contains(@class, "zz_btn_cancel_complete_workout")]

# Bottom Bar
${THEME_TOGGLE_BUTTON}      //div[contains(@class, "fixed") and contains(@class, "bottom-0")]//button[contains(@class, "inline-flex") and .//circle[@cx="12"]]
${EDIT_WORKOUT_BTN}         //button[contains(@class,'zz_btn_edit_mode')]
${DONE_BUTTON}              //div[contains(@class, "fixed") and contains(@class, "bottom-0")]//button[.//span[text()="Done"]]
${PROGRESS_TEXT}            //span[contains(@class, "text-blue-600") and contains(text(), "completed")]
${PROGRESS_BAR_CONTAINER}   //div[contains(@class, "w-full") and contains(@class, "bg-gray-200") and contains(@class, "rounded-full") and contains(@class, "h-2")]
${PROGRESS_BAR_FILL}        //div[contains(@class, "bg-blue-600") and contains(@class, "h-2") and contains(@class, "rounded-full")]

*** Keywords ***
# =============================================================================
# COMMON KEYWORDS (Shared Across Tests)
# =============================================================================
Open Browser And Login
    [Documentation]    Open browser, navigate to app, and login with credentials
    Set Screenshot Directory    ${OUTPUT_DIR}
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    ${OPERATION_INTERSTITIAL}
    Wait Until Page Contains Element    //input[@placeholder='you@example.com']    10s
    Input Text    //input[@placeholder='you@example.com']    ${USERNAME}
    Input Text    //input[@type='password']    ${PASSWORD}
    Click Button    //button[@type='submit']
    Wait Until Page Contains Element    ${CREATE_NEW_BTN}    10s

Go To Library Page
    Reload Page
    Wait Until Element Is Visible    ${CREATE_NEW_BTN}

Go to import page
    ${exists} =     Run Keyword And Return Status    Element should be visible    ${CREATE_NEW_BTN}
    IF    ${exists}
        Click Element    ${CREATE_NEW_BTN}
        Input Text    ${NEW_MODAL_INPUT}    Test Workout
        Click Element    ${NEW_MODAL_CONTINUE}
        Wait Until Element Is Visible    ${WORKOUT_TITLE}
        Element Text Should Be    ${WORKOUT_TITLE}    Test Workout
    END
    Wait Until Element Is Visible    ${MANUAL_IMPORT_BTN}

Create Manual Exercise
    [Documentation]    Create a manual exercise with specified name and number of sets
    [Arguments]    ${exercise_name}    ${num_sets}
    Click Element    ${MANUAL_IMPORT_BTN}
    Populate new exercise info    ${exercise_name}    ${num_sets}

Populate new exercise info
    [Arguments]    ${exercise_name}    ${sets}
    Wait Until Element Is Visible    ${EXERCISE_NAME_INPUT}
    Input Text    ${EXERCISE_NAME_INPUT}    ${exercise_name}
    Input Text    ${EXERCISE_SETS_INPUT}    ${sets}
    Click Element    ${SAVE_BTN}
    Wait Until Element Is Visible    //h2[contains(@class, "text-xl") and text()="${exercise_name}"]

Go to a workout
    [Arguments]    ${workout_name}
    ${on_workout_page} =     Run Keyword And Return Status    Element should be visible    ${COMPLETE_WORKOUT_BUTTON}
    IF    ${on_workout_page}
        ${title} =    Get Text    ${WORKOUT_TITLE}
        IF    $title != $workout_name
            Reload Page
        ELSE
            RETURN
        END
    END
    ${workout_elem} =    Set Variable    //h3[text()='${workout_name}']
    ${on_library_page} =     Run Keyword And Return Status    Element should be visible    ${workout_elem}
    IF    ${on_library_page}
        Click Element    ${workout_elem}
        Wait Until Element Is Visible    ${SET_COMPLETE}
    ELSE
        Click Element    ${CREATE_NEW_BTN}
        Input Text    ${NEW_MODAL_INPUT}    ${workout_name}
        Click Element    ${NEW_MODAL_CONTINUE}
        Wait Until Element Is Visible    ${WORKOUT_TITLE}
        Element Text Should Be    ${WORKOUT_TITLE}    ${workout_name}
        Create Manual Exercise    Pullups    2
    END
    

# =============================================================================
# WORKOUT LIBRARY PAGE KEYWORDS
# =============================================================================
Open New Workout Modal
    [Documentation]    Click the create new workout button to open modal
    Click Element    ${CREATE_NEW_BTN}
    Wait Until Page Contains Element    ${NEW_MODAL}    5s

Close New Workout Modal
    [Documentation]    Cancel and close the new workout modal
    Click Element    ${NEW_MODAL_CANCEL}
    Wait For Modal To Disappear    ${NEW_MODAL}

Enter Edit Mode
    [Documentation]    Click edit workouts button to enter edit mode
    Click Element    ${EDIT_WORKOUTS_BTN}
    Wait Until Page Contains Element    ${DELETE_BUTTON}    5s

Exit Edit Mode
    [Documentation]    Click done editing button to exit edit mode
    Click Element    ${EDIT_WORKOUTS_BTN}
    Wait Until Page Does Not Contain Element    ${DELETE_BUTTON}    5s

Open Delete Modal For First Workout
    [Documentation]    Enter edit mode and open delete modal for first workout
    Enter Edit Mode
    Click Element    xpath=(${DELETE_BUTTON})[1]
    Wait Until Page Contains Element    ${DELETE_MODAL}    5s

Open Edit Name Mode For First Workout
    [Documentation]    Enter edit mode and open edit name mode for first workout
    Enter Edit Mode
    ${workout_names}=    Get WebElements    //h3[contains(@class, 'font-bold')]
    Click Element    ${workout_names}[0]
    Wait Until Page Contains Element    ${EDIT_NAME_INPUT}    5s

Delete All Workouts
    [Documentation]    Delete all workouts from the library page
    [Arguments]    ${close_browser}=${True}
    Go To Library Page
    Run Keyword And Ignore Error  Enter Edit Mode
    
    # Loop until no more workout cards exist
    FOR    ${i}    IN RANGE    100
        ${workout_count}=    Get Element Count    ${WORKOUT_CARDS}
        Exit For Loop If    ${workout_count} == 0
        
        # Click the first delete button
        Click Element    xpath=(${DELETE_BUTTON})[1]
        Wait Until Page Contains Element    ${DELETE_MODAL}    5s
        
        # Confirm deletion
        @{delete_modal_confirm_btns}=    Get WebElements    ${DELETE_MODAL_DELETE}
        FOR    ${delete_modal_confirm_btn}    IN    @{delete_modal_confirm_btns}
            Run Keyword And Ignore Error    Click Element    ${delete_modal_confirm_btn}
        END
        
        # Wait for modal to close
        Wait For Modal To Disappear    ${DELETE_MODAL}
    END
    IF     ${close_browser}
        Close Browser
    END

Element Should Have Class
    [Arguments]    ${locator}    ${class_name}
    ${classes}=    Get Element Attribute    ${locator}    class
    Should Contain    ${classes}    ${class_name}

Get nth set elem of exercise
    [Arguments]    ${exercise}    ${elem}    ${n}
    RETURN    (//div[./h2[contains(text(),'${exercise}')]]${elem})[${n}]

Verify exercise set field value
    [Documentation]    Verify that a specific field of an exercise set has the expected value
    [Arguments]    ${exercise}    ${field}    ${n}    ${expected_value}
    ${target_field} =    Get nth set elem of exercise    ${exercise}    ${field}   ${n}
    Element Text Should Be    ${target_field}    ${expected_value}

Verify Complete Exercise Set
    [Documentation]    Verify all fields of an exercise set with a single keyword call
    ...                Accepts a dictionary of field:value pairs to verify
    [Arguments]    ${exercise}    ${set_number}    &{expected_values}
    FOR    ${field}    ${value}    IN    &{expected_values}
        ${target_field} =    Get nth set elem of exercise    ${exercise}    ${field}    ${set_number}
        Element Text Should Be    ${target_field}    ${value}
    END

Wait For Modal To Disappear
    [Documentation]    Wait for a modal to disappear with configurable timeout
    [Arguments]    ${modal_locator}    ${timeout}=5s
    Wait Until Page Does Not Contain Element    ${modal_locator}    ${timeout}

Wait For Element And Click
    [Documentation]    Wait for element to be visible and clickable, then click it
    [Arguments]    ${locator}    ${timeout}=5s
    Wait Until Element Is Visible    ${locator}    ${timeout}
    Wait Until Element Is Enabled    ${locator}    ${timeout}
    Click Element    ${locator}

Edit Complete Exercise Set
    [Documentation]    Edit multiple fields of an exercise set with a single keyword call
    ...                Accepts named parameters for each field to edit
    ...                Example: Edit Complete Exercise Set    Pullups    1
    ...                ...    SET_REPS=10    SET_WEIGHT=30    SET_REST=60    SET_GROUP=Pullups    SET_NOTES=Some note
    [Arguments]    ${exercise}    ${set_number}    &{field_values}
    FOR    ${field}    ${value}    IN    &{field_values}
        IF    '${field}' == 'SET_NOTES'
            ${set_note} =    Get nth set elem of exercise    ${exercise}    ${SET_NOTES}    ${set_number}
            Click Element    ${set_note}
            Input Text    ${SET_NOTES_INPUT}    ${value}
            Click Element    ${SAVE_WORKOUT_EDIT}
        ELSE
            ${field_variable} =    Set Variable    ${${field}}
            ${target} =    Get nth set elem of exercise    ${exercise}    ${field_variable}    ${set_number}
            Click Element    ${target}
            Wait Until Element Is Visible    ${SAVE_WORKOUT_EDIT}
            Input Text    ${INPUT_EDIT_WORKOUT}    ${value}
            Click Element    ${SAVE_WORKOUT_EDIT}
        END
    END

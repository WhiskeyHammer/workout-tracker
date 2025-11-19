*** Settings ***
Resource          resources.resource
Suite Setup       Open Browser And Login
Suite Teardown    Delete All Workouts
Test Setup        Go to library page

*** Test Cases ***
# =============================================================================
# PAGE LOADING & VERIFICATION TESTS
# =============================================================================

Verify Page Loads With All Main Buttons
    [Documentation]    Verify that the workout library page loads with all main buttons visible
    Open New Workout Modal
    Input Text    ${NEW_MODAL_INPUT}    Test Workout
    Click Element    ${NEW_MODAL_CONTINUE}
    Click Element    ${BACK_BUTTON}
    Wait Until Page Contains Element    ${DARKMODE_BTN}    5s
    Wait Until Page Contains Element    ${LOGOUT_BTN}    5s
    Wait Until Page Contains Element    ${CREATE_NEW_BTN}    5s
    Wait Until Page Contains Element    ${EDIT_WORKOUTS_BTN}    5s
    Page Should Contain Element    ${WORKOUT_CARDS}
    # Are these all the buttons?

Verify All Workout Cards Have Start Buttons
    [Documentation]    Verify each workout card has a Start button
    ${workout_cards}=    Get WebElements    ${WORKOUT_CARDS}
    ${start_buttons}=    Get WebElements    ${START_BTN}
    ${card_count}=    Get Length    ${workout_cards}
    ${button_count}=    Get Length    ${start_buttons}
    Should Be Equal    ${card_count}    ${button_count}
    # Approved

# =============================================================================
# UI CONTROLS TESTS
# =============================================================================

Click Dark Mode Toggle Button
    [Documentation]    Test clicking the dark mode toggle button
    ${initial_bg}=    Get Element Attribute    //div[contains(@class, 'min-h-screen')]    class
    Click Element    ${DARKMODE_BTN}
    Sleep    0.5s
    ${new_bg}=    Get Element Attribute    //div[contains(@class, 'min-h-screen')]    class
    Should Not Be Equal    ${initial_bg}    ${new_bg}
    Click Element    ${DARKMODE_BTN}
    Sleep    0.5s
    # Approved

# =============================================================================
# NEW WORKOUT MODAL TESTS
# =============================================================================

Click Create New Workout Button Opens Modal
    [Documentation]    Test that clicking Create New Workout opens the modal
    Open New Workout Modal
    Page Should Contain Element    ${NEW_MODAL_INPUT}
    Page Should Contain Element    ${NEW_MODAL_CANCEL}
    Page Should Contain Element    ${NEW_MODAL_CONTINUE}
    # Approved

New Workout Modal Cancel Button
    [Documentation]    Test the Cancel button in the new workout modal
    Open New Workout Modal
    Close New Workout Modal
    Page Should Not Contain Element    ${NEW_MODAL}
    # Approved

New Workout Modal Continue Button Disabled When Empty
    [Documentation]    Test that Continue button is disabled when input is empty
    Open New Workout Modal
    ${disabled}=    Get Element Attribute    ${NEW_MODAL_CONTINUE}    disabled
    Should Be Equal    ${disabled}    true
    Close New Workout Modal
    # Approved

New Workout Modal Continue Button Enabled With Input
    [Documentation]    Test that Continue button is enabled when input has text
    Open New Workout Modal
    Input Text    ${NEW_MODAL_INPUT}    Test Workout
    ${disabled}=    Get Element Attribute    ${NEW_MODAL_CONTINUE}    disabled
    Should Be Equal    ${disabled}    ${None}
    Close New Workout Modal
    # Approved

Create a new workout
    Open New Workout Modal
    Input Text    ${NEW_MODAL_INPUT}    Test Workout
    Click Element    ${NEW_MODAL_CONTINUE}
    Click Element    ${BACK_BUTTON}
    
# =============================================================================
# EDIT MODE TESTS
# =============================================================================

Click Edit Workouts Button
    [Documentation]    Test clicking the Edit Workouts button to enter edit mode
    Enter Edit Mode
    Element Text Should Be    ${EDIT_WORKOUTS_BTN}    Done Editing
    # Approved

Click Done Editing Button
    [Documentation]    Test clicking Done Editing to exit edit mode
    Enter Edit Mode
    Exit Edit Mode
    Page Should Not Contain Element    ${DELETE_BTN}
    Element Text Should Be    ${EDIT_WORKOUTS_BTN}    Edit Workouts
    # Approved

Verify Delete Buttons Appear In Edit Mode
    [Documentation]    Verify delete buttons appear for all workouts in edit mode
    ${start_buttons_before}=    Get WebElements    ${START_BTN}
    ${count_before}=    Get Length    ${start_buttons_before}
    Enter Edit Mode
    ${delete_buttons}=    Get WebElements    ${DELETE_BTN}
    ${delete_count}=    Get Length    ${delete_buttons}
    Should Be Equal    ${count_before}    ${delete_count}
    Exit Edit Mode
    # Approved

# =============================================================================
# DELETE WORKOUT TESTS
# =============================================================================

Click Delete Button Opens Confirmation Modal
    [Documentation]    Test that clicking Delete button opens confirmation modal
    Open Delete Modal For First Workout
    Page Should Contain Element    ${DELETE_MODAL_CANCEL}
    Page Should Contain Element    ${DELETE_MODAL_DELETE}
    # Approved

Delete Modal Cancel Button
    [Documentation]    Test the Cancel button in delete confirmation modal
    Open Delete Modal For First Workout
    Click Element    ${DELETE_MODAL_CANCEL}
    Sleep    1s
    Page Should Not Contain Element    ${DELETE_MODAL}
    Exit Edit Mode
    # Approved

# =============================================================================
# EDIT WORKOUT NAME TESTS
# =============================================================================

Click Workout Name To Edit In Edit Mode
    [Documentation]    Test clicking workout name in edit mode opens inline editor
    Open Edit Name Mode For First Workout
    Page Should Contain Element    ${EDIT_NAME_SAVE}
    Page Should Contain Element    ${EDIT_NAME_CANCEL}
    # Approved

Edit Name Cancel Button
    [Documentation]    Test the Cancel button in edit name mode
    Open Edit Name Mode For First Workout
    Click Element    ${EDIT_NAME_CANCEL}
    Sleep    1s
    Page Should Not Contain Element    ${EDIT_NAME_INPUT}
    Exit Edit Mode
    # Approved

Edit Name Save Button
    [Documentation]    Test the Save button in edit name mode
    Enter Edit Mode
    ${workout_names}=    Get WebElements    //h3[contains(@class, 'font-bold')]
    ${original_name}=    Get Text    ${workout_names}[0]
    Click Element    ${workout_names}[0]
    Sleep    1s
    Wait Until Page Contains Element    ${EDIT_NAME_INPUT}    5s
    Press Keys    ${EDIT_NAME_INPUT}    CTRL+A
    Input Text    ${EDIT_NAME_INPUT}    ${original_name}
    Click Element    ${EDIT_NAME_SAVE}
    Sleep    2s
    Page Should Not Contain Element    ${EDIT_NAME_INPUT}
    Exit Edit Mode
    # Needs to be modified to use a test data import and manipulate that name to something useful AFTER a refresh

# =============================================================================
# WORKOUT ACTIONS TESTS
# =============================================================================

Click Start Button On First Workout
    [Documentation]    Test clicking the Start button on the first workout card
    ${start_buttons}=    Get WebElements    ${START_BTN}
    ${count}=    Get Length    ${start_buttons}
    Should Be True    ${count} > 0
    Click Element    xpath=(${START_BTN})[1]
    Sleep    2s
    # This needs work, could piggy back off the the import behaviors

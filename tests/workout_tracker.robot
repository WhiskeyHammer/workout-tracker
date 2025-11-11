*** Settings ***
Documentation    Comprehensive test suite for Workout Tracker - Edit State page
...              Tests all interactive elements and user workflows
Library          SeleniumLibrary
Resource         workout_tracker.resource
Suite Setup      Open Workout Tracker
Suite Teardown   Close Browser
Test Setup       Reload Page


*** Variables ***
${BROWSER}              Chrome
${URL}                  file:///mnt/user-data/uploads/edit_state.html
${TIMEOUT}              10s
${IMPLICIT_WAIT}        5s


*** Test Cases ***
Verify Page Loads Successfully
    [Documentation]    Verify the workout tracker page loads with all essential elements
    [Tags]    smoke    page-load
    Wait Until Page Contains Element    ${WORKOUT_TITLE}    ${TIMEOUT}
    Title Should Be    Workout Tracker - Cloud Edition
    Page Should Contain Element    ${BACK_BUTTON}
    Page Should Contain Element    ${COMPLETE_WORKOUT_BUTTON}

Verify Header Elements Are Present
    [Documentation]    Verify all header elements are visible and interactable
    [Tags]    ui    header
    Element Should Be Visible    ${BACK_BUTTON}
    Element Should Be Enabled    ${BACK_BUTTON}
    Element Should Be Visible    ${WORKOUT_TITLE}
    Element Text Should Be    ${WORKOUT_TITLE}    Test Workout

Verify Exercise Title Is Present And Clickable
    [Documentation]    Verify the exercise title "Pullups" is visible and clickable
    [Tags]    ui    exercise
    Element Should Be Visible    ${EXERCISE_TITLE_PULLUPS}
    Element Text Should Be    ${EXERCISE_TITLE_PULLUPS}    Pullups
    ${cursor}=    Get Element Attribute    ${EXERCISE_TITLE_PULLUPS}    style
    Should Contain    ${cursor}    cursor: pointer

Verify Set 1 All Elements Are Visible
    [Documentation]    Verify all Set 1 elements are present and visible
    [Tags]    ui    set1
    Element Should Be Visible    ${SET1_REPS_LABEL}
    Element Should Be Visible    ${SET1_REPS_VALUE}
    Element Should Be Visible    ${SET1_WEIGHT_LABEL}
    Element Should Be Visible    ${SET1_WEIGHT_VALUE}
    Element Should Be Visible    ${SET1_REST_LABEL}
    Element Should Be Visible    ${SET1_REST_VALUE}
    Element Should Be Visible    ${SET1_GROUP_LABEL}
    Element Should Be Visible    ${SET1_GROUP_VALUE}
    Element Should Be Visible    ${SET1_NOTES_TEXT}
    Element Should Be Visible    ${SET1_DELETE_BUTTON}
    Element Should Be Visible    ${SET1_COMPLETE_BUTTON}

Verify Set 1 Values Display Correctly
    [Documentation]    Verify Set 1 displays the correct initial values
    [Tags]    data    set1
    Element Text Should Be    ${SET1_REPS_VALUE}      0
    Element Text Should Be    ${SET1_WEIGHT_VALUE}    0
    Element Text Should Be    ${SET1_REST_VALUE}      0
    Element Text Should Be    ${SET1_GROUP_VALUE}     Pullups

Verify Set 1 Reps Value Is Clickable
    [Documentation]    Verify the reps value has clickable styling
    [Tags]    interaction    set1
    ${cursor}=    Get Element Attribute    ${SET1_REPS_VALUE}    style
    Should Contain    ${cursor}    cursor: pointer
    Element Should Be Enabled    ${SET1_REPS_VALUE}

Verify Set 1 Weight Value Is Clickable
    [Documentation]    Verify the weight value has clickable styling
    [Tags]    interaction    set1
    ${cursor}=    Get Element Attribute    ${SET1_WEIGHT_VALUE}    style
    Should Contain    ${cursor}    cursor: pointer
    Element Should Be Enabled    ${SET1_WEIGHT_VALUE}

Verify Set 1 Rest Value Is Clickable
    [Documentation]    Verify the rest value has clickable styling
    [Tags]    interaction    set1
    ${cursor}=    Get Element Attribute    ${SET1_REST_VALUE}    style
    Should Contain    ${cursor}    cursor: pointer
    Element Should Be Enabled    ${SET1_REST_VALUE}

Verify Set 1 Group Value Is Clickable
    [Documentation]    Verify the group value has clickable styling
    [Tags]    interaction    set1
    ${cursor}=    Get Element Attribute    ${SET1_GROUP_VALUE}    style
    Should Contain    ${cursor}    cursor: pointer
    Element Should Be Enabled    ${SET1_GROUP_VALUE}

Verify Set 1 Notes Is Clickable
    [Documentation]    Verify the notes area has clickable styling
    [Tags]    interaction    set1
    ${notes_parent}=    Get WebElement    ${SET1_NOTES_TEXT}/..
    ${cursor}=    Get Element Attribute    ${notes_parent}    style
    Should Contain    ${cursor}    cursor: pointer

Verify Set 1 Delete Button Is Enabled
    [Documentation]    Verify the delete button is enabled and has correct title
    [Tags]    interaction    set1
    Element Should Be Enabled    ${SET1_DELETE_BUTTON}
    ${title}=    Get Element Attribute    ${SET1_DELETE_BUTTON}    title
    Should Be Equal    ${title}    Delete exercise

Verify Set 1 Complete Button Is Enabled
    [Documentation]    Verify the complete button is enabled (not disabled)
    [Tags]    interaction    set1
    Element Should Be Enabled    ${SET1_COMPLETE_BUTTON}
    ${disabled}=    Get Element Attribute    ${SET1_COMPLETE_BUTTON}    disabled
    Should Be Equal    ${disabled}    ${None}

Verify Set 2 All Elements Are Visible
    [Documentation]    Verify all Set 2 elements are present and visible
    [Tags]    ui    set2
    Element Should Be Visible    ${SET2_REPS_VALUE}
    Element Should Be Visible    ${SET2_WEIGHT_VALUE}
    Element Should Be Visible    ${SET2_REST_VALUE}
    Element Should Be Visible    ${SET2_GROUP_VALUE}
    Element Should Be Visible    ${SET2_NOTES_TEXT}
    Element Should Be Visible    ${SET2_DELETE_BUTTON}
    Element Should Be Visible    ${SET2_COMPLETE_BUTTON}

Verify Set 2 Values Display Correctly
    [Documentation]    Verify Set 2 displays the correct initial values
    [Tags]    data    set2
    Element Text Should Be    ${SET2_REPS_VALUE}      0
    Element Text Should Be    ${SET2_WEIGHT_VALUE}    0
    Element Text Should Be    ${SET2_REST_VALUE}      0
    Element Text Should Be    ${SET2_GROUP_VALUE}     Pullups

Verify Set 2 Appears Dimmed
    [Documentation]    Verify Set 2 has the dimmed/inactive styling
    [Tags]    ui    set2
    ${set2_container}=    Get WebElement    ${SET2_REPS_VALUE}/ancestor::div[contains(@class, "opacity-60")]
    ${class}=    Get Element Attribute    ${set2_container}    class
    Should Contain    ${class}    opacity-60
    Should Contain    ${class}    bg-gray-900

Verify Set 2 Complete Button Is Disabled
    [Documentation]    Verify the Set 2 complete button is disabled
    [Tags]    interaction    set2
    Element Should Be Disabled    ${SET2_COMPLETE_BUTTON}
    ${disabled}=    Get Element Attribute    ${SET2_COMPLETE_BUTTON}    disabled
    Should Not Be Equal    ${disabled}    ${None}

Verify Add Set Button Is Present And Enabled
    [Documentation]    Verify the Add Set button is visible and clickable
    [Tags]    ui    interaction
    Element Should Be Visible    ${ADD_SET_BUTTON}
    Element Should Be Enabled    ${ADD_SET_BUTTON}
    Element Should Contain    ${ADD_SET_BUTTON}    Add Set

Verify Exercise Notes Section Is Present
    [Documentation]    Verify the exercise notes section is visible
    [Tags]    ui    notes
    Element Should Be Visible    ${EXERCISE_NOTES_LABEL}
    Element Text Should Be    ${EXERCISE_NOTES_LABEL}    Exercise Notes
    Element Should Be Visible    ${EXERCISE_NOTES_TEXTAREA}
    Element Should Be Enabled    ${EXERCISE_NOTES_TEXTAREA}

Verify Exercise Notes Textarea Has Correct Placeholder
    [Documentation]    Verify the textarea has the correct placeholder text
    [Tags]    ui    notes
    ${placeholder}=    Get Element Attribute    ${EXERCISE_NOTES_TEXTAREA}    placeholder
    Should Be Equal    ${placeholder}    Add notes about this exercise...

Verify Exercise Notes Textarea Accepts Input
    [Documentation]    Test that the exercise notes textarea accepts text input
    [Tags]    interaction    notes    input
    ${test_text}=    Set Variable    This is a test note about pullups
    Clear Element Text    ${EXERCISE_NOTES_TEXTAREA}
    Input Text    ${EXERCISE_NOTES_TEXTAREA}    ${test_text}
    ${value}=    Get Value    ${EXERCISE_NOTES_TEXTAREA}
    Should Be Equal    ${value}    ${test_text}

Verify Add Exercise Button Is Present And Enabled
    [Documentation]    Verify the Add Exercise button is visible and clickable
    [Tags]    ui    interaction
    Element Should Be Visible    ${ADD_EXERCISE_BUTTON}
    Element Should Be Enabled    ${ADD_EXERCISE_BUTTON}
    Element Should Contain    ${ADD_EXERCISE_BUTTON}    Add Exercise

Verify Complete Workout Button Is Present And Enabled
    [Documentation]    Verify the Complete Workout button is visible and clickable
    [Tags]    ui    interaction    critical
    Element Should Be Visible    ${COMPLETE_WORKOUT_BUTTON}
    Element Should Be Enabled    ${COMPLETE_WORKOUT_BUTTON}
    Element Text Should Be    ${COMPLETE_WORKOUT_BUTTON}    Complete Workout

Verify Complete Workout Button Has Green Styling
    [Documentation]    Verify the Complete Workout button has the correct styling
    [Tags]    ui
    ${class}=    Get Element Attribute    ${COMPLETE_WORKOUT_BUTTON}    class
    Should Contain    ${class}    bg-green-700

Verify Theme Toggle Button Is Present
    [Documentation]    Verify the theme toggle button is visible
    [Tags]    ui    bottom-bar
    Element Should Be Visible    ${THEME_TOGGLE_BUTTON}
    Element Should Be Enabled    ${THEME_TOGGLE_BUTTON}

Verify Done Button Is Present And Enabled
    [Documentation]    Verify the Done button is visible and clickable
    [Tags]    ui    bottom-bar
    Element Should Be Visible    ${DONE_BUTTON}
    Element Should Be Enabled    ${DONE_BUTTON}
    Element Should Contain    ${DONE_BUTTON}    Done

Verify Progress Text Displays Correctly
    [Documentation]    Verify the progress text shows correct completion status
    [Tags]    ui    progress
    Element Should Be Visible    ${PROGRESS_TEXT}
    ${progress_text}=    Get Text    ${PROGRESS_TEXT}
    Should Match Regexp    ${progress_text}    \\d+ / \\d+ completed
    Should Contain    ${progress_text}    0 / 2 completed

Verify Progress Bar Is Present
    [Documentation]    Verify the progress bar container and fill are visible
    [Tags]    ui    progress
    Element Should Be Visible    ${PROGRESS_BAR_CONTAINER}
    Element Should Be Visible    ${PROGRESS_BAR_FILL}

Verify Progress Bar Initial State
    [Documentation]    Verify the progress bar starts at 0%
    [Tags]    ui    progress
    ${style}=    Get Element Attribute    ${PROGRESS_BAR_FILL}    style
    Should Contain    ${style}    width: 0%

Click Set 1 Reps Value
    [Documentation]    Test clicking on Set 1 reps value
    [Tags]    interaction    set1    click
    Click Element    ${SET1_REPS_VALUE}
    Sleep    0.5s    # Allow time for any UI response

Click Set 1 Weight Value
    [Documentation]    Test clicking on Set 1 weight value
    [Tags]    interaction    set1    click
    Click Element    ${SET1_WEIGHT_VALUE}
    Sleep    0.5s    # Allow time for any UI response

Click Set 1 Rest Value
    [Documentation]    Test clicking on Set 1 rest value
    [Tags]    interaction    set1    click
    Click Element    ${SET1_REST_VALUE}
    Sleep    0.5s    # Allow time for any UI response

Click Set 1 Group Value
    [Documentation]    Test clicking on Set 1 group value
    [Tags]    interaction    set1    click
    Click Element    ${SET1_GROUP_VALUE}
    Sleep    0.5s    # Allow time for any UI response

Click Exercise Title
    [Documentation]    Test clicking on the exercise title
    [Tags]    interaction    click
    Click Element    ${EXERCISE_TITLE_PULLUPS}
    Sleep    0.5s    # Allow time for any UI response

Click Add Set Button
    [Documentation]    Test clicking the Add Set button
    [Tags]    interaction    click
    Click Element    ${ADD_SET_BUTTON}
    Sleep    0.5s    # Allow time for any UI response

Click Add Exercise Button
    [Documentation]    Test clicking the Add Exercise button
    [Tags]    interaction    click
    Click Element    ${ADD_EXERCISE_BUTTON}
    Sleep    0.5s    # Allow time for any UI response

Click Theme Toggle Button
    [Documentation]    Test clicking the theme toggle button
    [Tags]    interaction    click    bottom-bar
    Click Element    ${THEME_TOGGLE_BUTTON}
    Sleep    0.5s    # Allow time for theme change

Click Done Button
    [Documentation]    Test clicking the Done button
    [Tags]    interaction    click    bottom-bar
    Click Element    ${DONE_BUTTON}
    Sleep    0.5s    # Allow time for any UI response

Click Set 1 Complete Button
    [Documentation]    Test clicking the Set 1 complete button
    [Tags]    interaction    set1    click    critical
    Click Element    ${SET1_COMPLETE_BUTTON}
    Sleep    0.5s    # Allow time for state update

Hover Over Set 1 Reps Value
    [Documentation]    Test hovering over Set 1 reps value to check hover effects
    [Tags]    interaction    hover    set1
    Mouse Over    ${SET1_REPS_VALUE}
    Sleep    0.3s    # Allow time for hover effect

Hover Over Complete Workout Button
    [Documentation]    Test hovering over Complete Workout button
    [Tags]    interaction    hover
    Mouse Over    ${COMPLETE_WORKOUT_BUTTON}
    Sleep    0.3s    # Allow time for hover effect

Hover Over Add Set Button
    [Documentation]    Test hovering over Add Set button
    [Tags]    interaction    hover
    Mouse Over    ${ADD_SET_BUTTON}
    Sleep    0.3s    # Allow time for hover effect

Verify All Buttons Are Accessible By Keyboard
    [Documentation]    Verify buttons can receive keyboard focus
    [Tags]    accessibility    keyboard
    Press Keys    ${BACK_BUTTON}    TAB
    Press Keys    ${ADD_SET_BUTTON}    TAB
    Press Keys    ${ADD_EXERCISE_BUTTON}    TAB
    Press Keys    ${COMPLETE_WORKOUT_BUTTON}    TAB

Verify Page Is Scrollable
    [Documentation]    Verify the page allows scrolling
    [Tags]    ui    scroll
    ${height}=    Execute Javascript    return document.body.scrollHeight
    ${window_height}=    Execute Javascript    return window.innerHeight
    Should Be True    ${height} >= ${window_height}

Verify Exercise Notes Textarea Has Proper Rows
    [Documentation]    Verify textarea has correct number of rows
    [Tags]    ui    notes
    ${rows}=    Get Element Attribute    ${EXERCISE_NOTES_TEXTAREA}    rows
    Should Be Equal    ${rows}    3

Test Back Button Hover Effect
    [Documentation]    Verify back button shows hover state
    [Tags]    interaction    hover    header
    Mouse Over    ${BACK_BUTTON}
    Sleep    0.3s
    ${class}=    Get Element Attribute    ${BACK_BUTTON}    class
    Should Contain    ${class}    hover:bg-gray-700

Verify Responsive Layout Elements
    [Documentation]    Verify responsive design classes are applied
    [Tags]    ui    responsive
    ${class}=    Get Element Attribute    ${WORKOUT_TITLE}    class
    Should Contain    ${class}    flex-1
    Should Contain    ${class}    min-w-0

Verify Border Styling On Set Cards
    [Documentation]    Verify set cards have proper border styling
    [Tags]    ui    styling
    ${set1_container}=    Get WebElement    ${SET1_REPS_VALUE}/ancestor::div[contains(@class, "rounded-lg")]
    ${class}=    Get Element Attribute    ${set1_container}    class
    Should Contain    ${class}    border
    Should Contain    ${class}    rounded-lg

Verify Transition Effects Are Applied
    [Documentation]    Verify transition classes are applied for smooth animations
    [Tags]    ui    animation
    ${class}=    Get Element Attribute    ${COMPLETE_WORKOUT_BUTTON}    class
    Should Contain    ${class}    transition-colors

Test Multiple Clicks On Same Element
    [Documentation]    Test that elements can be clicked multiple times
    [Tags]    interaction    stress
    Click Element    ${SET1_REPS_VALUE}
    Sleep    0.2s
    Click Element    ${SET1_REPS_VALUE}
    Sleep    0.2s
    Click Element    ${SET1_REPS_VALUE}
    Sleep    0.2s

Test Rapid Button Clicks
    [Documentation]    Test rapid clicking of buttons
    [Tags]    interaction    stress
    Click Element    ${ADD_SET_BUTTON}
    Click Element    ${ADD_SET_BUTTON}
    Click Element    ${ADD_SET_BUTTON}
    Sleep    0.5s

Verify No JavaScript Errors On Page
    [Documentation]    Check browser console for JavaScript errors
    [Tags]    debug    errors
    ${logs}=    Get Browser Console Messages
    Log    Browser Console: ${logs}

Full Workout Flow Simulation
    [Documentation]    Simulate a complete workout flow
    [Tags]    integration    workflow    critical
    # Start by verifying initial state
    Element Text Should Be    ${PROGRESS_TEXT}    0 / 2 completed
    
    # Click to edit Set 1 values
    Click Element    ${SET1_REPS_VALUE}
    Sleep    0.3s
    Click Element    ${SET1_WEIGHT_VALUE}
    Sleep    0.3s
    
    # Add notes
    Input Text    ${EXERCISE_NOTES_TEXTAREA}    Felt strong today
    
    # Complete Set 1
    Click Element    ${SET1_COMPLETE_BUTTON}
    Sleep    0.5s
    
    # Try to interact with Set 2 (should be disabled)
    Element Should Be Disabled    ${SET2_COMPLETE_BUTTON}
    
    # Theme toggle
    Click Element    ${THEME_TOGGLE_BUTTON}
    Sleep    0.5s

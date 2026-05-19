*** Settings ***
Documentation    Tests for the per-workout Export and Replace-from-file buttons
...              that live in the workout tracker header.
Library          SeleniumLibrary
Resource         resources.resource
Suite Setup      Open Browser And Login
Suite Teardown   Delete All Workouts
Test Setup       Go To Import Page
Test Teardown    Delete All Workouts    ${False}


*** Test Cases ***
Export and Replace buttons hidden on empty workout
    [Documentation]    Before any exercises exist, the toolbar Export/Replace buttons
    ...                must NOT render — otherwise their hidden file input would collide
    ...                with the empty-state dropzone's file input.
    Wait Until Element Is Visible    ${MANUAL_IMPORT_BTN}    5s
    Element Should Not Be Visible    ${EXPORT_WORKOUT_BTN}
    Element Should Not Be Visible    ${REPLACE_WORKOUT_BTN}
    ${file_input_count} =    Get Element Count    //input[@type='file']
    Should Be Equal As Numbers    ${file_input_count}    1

Export and Replace buttons appear once a workout has exercises
    [Documentation]    Loading exercises (via the dropzone) must reveal both toolbar
    ...                buttons; the hidden replace file input is now also in the DOM.
    ${file_input} =    Set Variable    //input[@type='file']
    Choose File    ${file_input}    ${CURDIR}/data/test.json
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Element Should Be Visible    ${EXPORT_WORKOUT_BTN}
    Element Should Be Visible    ${REPLACE_WORKOUT_BTN}
    Element Should Be Visible    ${BACK_BUTTON}

Cancel replace leaves workout untouched
    [Documentation]    Picking a file then hitting Cancel in the confirm modal must
    ...                NOT modify the workout. Mutate by adding a new exercise on
    ...                top of the imported workout; assert it survives the cancel.
    Add Squats On Top Of Imported Workout

    # Pick the file, then bail out of the confirm modal
    Choose File    ${REPLACE_FILE_INPUT}    ${CURDIR}/data/test.json
    Wait Until Element Is Visible    ${REPLACE_CONFIRM_MODAL}    5s
    Element Should Contain    ${REPLACE_CONFIRM_MODAL}    test.json
    Click Element    ${REPLACE_CANCEL_BTN}
    Wait For Modal To Disappear    ${REPLACE_CONFIRM_MODAL}

    # The Squats exercise we added must still be there
    Element Should Be Visible    //h2[contains(text(),'Squats')]
    Element Should Be Visible    //h2[contains(text(),'Underhand Pullups')]

Confirming replace overwrites local edits with file contents
    [Documentation]    Add a new exercise on top of an imported workout, then Replace
    ...                from the same file → the added exercise must be gone, and
    ...                only the file's exercises remain.
    Add Squats On Top Of Imported Workout

    # Replace from the same file → confirm
    Choose File    ${REPLACE_FILE_INPUT}    ${CURDIR}/data/test.json
    Wait Until Element Is Visible    ${REPLACE_CONFIRM_MODAL}    5s
    Click Element    ${REPLACE_CONFIRM_BTN}
    Wait For Modal To Disappear    ${REPLACE_CONFIRM_MODAL}

    # File contents present, Squats reverted away
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Dumbbell Curls')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s
    Element Should Not Be Visible    //h2[contains(text(),'Squats')]

Replace persists to server (survives reload)
    [Documentation]    After Replace, the auto-save debounce (~1s) must persist the new
    ...                state. Reloading the page should still show the imported values.
    Click Element    ${MANUAL_IMPORT_BTN}
    Populate New Exercise Info    Squats

    # Confirm Squats is the only exercise on this fresh workout
    Wait Until Element Is Visible    //h2[contains(text(),'Squats')]    5s

    # Replace with the test.json contents
    Choose File    ${REPLACE_FILE_INPUT}    ${CURDIR}/data/test.json
    Wait Until Element Is Visible    ${REPLACE_CONFIRM_MODAL}    5s
    Click Element    ${REPLACE_CONFIRM_BTN}
    Wait For Modal To Disappear    ${REPLACE_CONFIRM_MODAL}

    # Imported exercises should appear; Squats should be gone
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Dumbbell Curls')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s
    Element Should Not Be Visible    //h2[contains(text(),'Squats')]

    # Wait for the debounced auto-save to flush
    Wait Until Element Is Visible    ${SYNC_SUCCESS_TOAST}    10s
    Sleep    1s

    # Reload — imported state should still be there
    Reload Page
    Go To A Workout    Test Workout
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Dumbbell Curls')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s
    Element Should Not Be Visible    //h2[contains(text(),'Squats')]

Export click does not error on a populated workout
    [Documentation]    Clicking Export must not throw and must leave the page intact.
    ...                We do not verify the downloaded file content here — that would
    ...                require Chrome download-dir configuration. We just smoke-test
    ...                that the click is wired up and the page state is unchanged.
    ${file_input} =    Set Variable    //input[@type='file']
    Choose File    ${file_input}    ${CURDIR}/data/test.json
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s

    Click Element    ${EXPORT_WORKOUT_BTN}
    Sleep    0.5s

    # Still on the tracker page, no info-modal popped up
    Element Should Be Visible    //h2[contains(text(),'Underhand Pullups')]
    Element Should Not Be Visible    //h2[text()='Nothing to Export']


*** Keywords ***
Add Squats On Top Of Imported Workout
    [Documentation]    Drop test.json via the empty-state dropzone, then add an extra
    ...                "Squats" exercise via the in-tracker add-exercise button so the
    ...                workout differs from a clean re-import of test.json.
    ${file_input} =    Set Variable    //input[@type='file']
    Choose File    ${file_input}    ${CURDIR}/data/test.json
    Wait Until Element Is Visible    //h2[contains(text(),'Underhand Pullups')]    5s
    Wait Until Element Is Visible    //h2[contains(text(),'Incline DB Press')]    5s

    # Enter edit mode so the inline add-exercise buttons render
    ${edit_btn_value} =    Get Text    ${EDIT_WORKOUT_BTN}
    IF    $edit_btn_value != 'Done'
        Click Element    ${EDIT_WORKOUT_BTN}
        Wait Until Element Is Visible    ${ADD_EXERCISE_BTN}    5s
    END

    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    0.3s
    Click Element    xpath=(${ADD_EXERCISE_BTN})[last()]
    Populate New Exercise Info    Squats
    Wait Until Element Is Visible    //h2[contains(text(),'Squats')]    5s

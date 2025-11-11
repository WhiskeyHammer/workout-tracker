*** Settings ***
Resource          common.resource

*** Variables ***

# Main Page XPaths
${DARKMODE_BTN}       //button[contains(@class, 'p-2') and contains(@class, 'rounded-lg')]
${LOGOUT_BTN}         //button[contains(@title, 'Logout')]
${EDIT_WORKOUTS_BTN}  //button[text()='Edit Workouts' or text()='Done Editing']

# Workout Card XPaths
${WORKOUT_CARDS}      //div[contains(@class, 'rounded-xl') and .//h3[contains(@class, 'font-bold')]]
${START_BUTTON}       //button[contains(text(), 'Start')]
${DELETE_BUTTON}      //button[contains(text(), 'Delete')]

# New Workout Modal XPaths
${NEW_MODAL}          //div[contains(@class, 'fixed') and .//h2[text()='Create New Workout']]
${NEW_MODAL_INPUT}    //input[@placeholder='e.g., Upper Body Day']
${NEW_MODAL_CANCEL}   //div[.//h2[text()='Create New Workout']]//button[text()='Cancel']
${NEW_MODAL_CONTINUE}    //div[.//h2[text()='Create New Workout']]//button[text()='Continue']

# Delete Confirm Modal XPaths
${DELETE_MODAL}       //div[contains(@class, 'fixed') and .//h2[text()='Delete Workout?']]
${DELETE_MODAL_CANCEL}    //div[.//h2[text()='Delete Workout?']]//button[text()='Cancel']
${DELETE_MODAL_DELETE}    //div[.//h2[text()='Delete Workout?']]//button[text()='Delete']

# Edit Name Mode XPaths
${EDIT_NAME_INPUT}    //input[@type='text' and contains(@class, 'border-blue-500')]
${EDIT_NAME_SAVE}     //button[text()='Save' and contains(@class, 'bg-green-600')]
${EDIT_NAME_CANCEL}   //button[text()='Cancel' and contains(@class, 'bg-gray-200')]

*** Keywords ***
Go To Library Page
    Go To    ${URL}
    Wait Until Page Contains Element    ${CREATE_NEW_BTN}    10s

Open New Workout Modal
    Click Element    ${CREATE_NEW_BTN}
    Wait Until Page Contains Element    ${NEW_MODAL}    5s

Close New Workout Modal
    Click Element    ${NEW_MODAL_CANCEL}
    Sleep    1s

Enter Edit Mode
    Click Element    ${EDIT_WORKOUTS_BTN}
    Sleep    1s
    Wait Until Page Contains Element    ${DELETE_BUTTON}    5s

Exit Edit Mode
    Click Element    ${EDIT_WORKOUTS_BTN}
    Sleep    1s

Open Delete Modal For First Workout
    Enter Edit Mode
    Click Element    xpath=(${DELETE_BUTTON})[1]
    Wait Until Page Contains Element    ${DELETE_MODAL}    5s

Open Edit Name Mode For First Workout
    Enter Edit Mode
    ${workout_names}=    Get WebElements    //h3[contains(@class, 'font-bold')]
    Click Element    ${workout_names}[0]
    Sleep    1s
    Wait Until Page Contains Element    ${EDIT_NAME_INPUT}    5s


Delete all workouts
    [Documentation]    Deletes all workouts from the library page
    Go To Library Page
    Enter Edit Mode
    
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
        Sleep    1s
        
        # Wait for modal to close
        Wait Until Page Does Not Contain Element    ${DELETE_MODAL}    5s
    END
    
    Close Browser

*** Settings ***
Documentation    Page object for Import Page with all dynamic states discovered through systematic exploration
Resource         common.resource
Resource         workout_library.resource
Library          SeleniumLibrary

*** Variables ***
# ============================================================================
# STATE: Initial Import Page
# ============================================================================
${FILE_IMPORT_BTN}            //label[.//p[contains(text(),'Click to upload CSV or JSON')]]
${MANUAL_IMPORT_BTN}          //button[.//p[contains(text(),'Create Workout Manually')]]
${BACK_BTN}                   //button[@title="Back to library"]
${WORKOUT_TITLE}              //h1


# ============================================================================
# STATE: Add Exercise Modal
# ============================================================================
${EXERCISE_NAME_INPUT}    //label[text()='Exercise Name']/following-sibling::input
${EXERCISE_SETS_INPUT}    //label[text()='Number of Sets']/following-sibling::input
${CANCEL_BTN}             //button[contains(text(),'Cancel')]
${SAVE_BTN}               //button[contains(text(),'Add')]


*** Keywords ***
Go to import page
    Open New Workout Modal
    Input Text    ${NEW_MODAL_INPUT}    Test Workout
    Click Element    ${NEW_MODAL_CONTINUE}
    Wait Until Element Is Visible    ${WORKOUT_TITLE}
    Element Text Should Be    ${WORKOUT_TITLE}    Test Workout

    
    
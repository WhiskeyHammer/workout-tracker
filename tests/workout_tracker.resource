*** Settings ***
Resource          common.resource


*** Variables ***
# =============================================================================
# HEADER ELEMENTS
# =============================================================================
${BACK_BUTTON}                      //button[@title="Back to library"]
${WORKOUT_TITLE}                    //h1[contains(@class, "text-xl") and text()="Test Workout"]

# =============================================================================
# EXERCISE TITLE
# =============================================================================
${EXERCISE_TITLE_PULLUPS}           //h2[contains(@class, "text-xl") and text()="Pullups"]

# =============================================================================
# COMMON SET FEATURES
# =============================================================================
${SET_ROWS}                         //div[./div/button[contains(@class,'rounded-full')]]
${ADD_SET}                          //button[contains(@class, 'zz_btn_add_set')]

# =============================================================================
# SET 1 (Active/Highlighted Set)
# =============================================================================
${SET1_REPS_VALUE}                  (//span[contains(@class, "zz_editable_reps")])[1]
${SET1_WEIGHT_VALUE}                (//span[contains(@class, "zz_editable_weight")])[1]
${SET1_REST_VALUE}                  (//span[contains(@class, "zz_editable_rest")])[1]
${SET1_GROUP_VALUE}                 (//span[contains(@class, "zz_editable_group")])[1]
${SET1_NOTES_TEXT}                  (//p[contains(@class, "zz_editable_set_notes")])[1]
${SET1_DELETE_BUTTON}               (//button[contains(@class, "zz_btn_delete_set")])[1]
${SET1_COMPLETE_BUTTON}             (//button[contains(@class, "zz_btn_toggle_set_complete") and not(@disabled)])[1]

# =============================================================================
# SET 2 (Inactive/Dimmed Set)
# =============================================================================
${SET2_REPS_VALUE}                  (//span[contains(@class, "zz_editable_reps")])[2]
${SET2_WEIGHT_VALUE}                (//span[contains(@class, "zz_editable_weight")])[2]
${SET2_REST_VALUE}                  (//span[contains(@class, "zz_editable_rest")])[2]
${SET2_GROUP_VALUE}                 (//span[contains(@class, "zz_editable_group")])[2]
${SET2_NOTES_TEXT}                  (//p[contains(@class, "zz_editable_set_notes")])[2]
${SET2_DELETE_BUTTON}               (//button[contains(@class, "zz_btn_delete_set")])[2]
${SET2_COMPLETE_BUTTON}             (//button[contains(@class, "zz_btn_toggle_set_complete") and @disabled])[1]

# =============================================================================
# EXERCISE ACTIONS
# =============================================================================
${ADD_SET_BUTTON}                   //button[contains(@class, "zz_btn_add_set")]
${EXERCISE_NOTES_TEXTAREA}          //textarea[contains(@class, "zz_textarea_exercise_notes")]
${ADD_EXERCISE_BUTTON}              //button[contains(@class, "zz_btn_add_exercise_between") or contains(@class, "zz_btn_add_exercise_end")]

# =============================================================================
# WORKOUT ACTIONS
# =============================================================================
${COMPLETE_WORKOUT_BUTTON}          //button[contains(@class, "zz_btn_complete_workout")]

# =============================================================================
# BOTTOM BAR
# =============================================================================
${THEME_TOGGLE_BUTTON}              //div[contains(@class, "fixed") and contains(@class, "bottom-0")]//button[contains(@class, "inline-flex") and .//circle[@cx="12"]]
${DONE_BUTTON}                      //div[contains(@class, "fixed") and contains(@class, "bottom-0")]//button[.//span[text()="Done"]]
${PROGRESS_TEXT}                    //span[contains(@class, "text-blue-600") and contains(text(), "completed")]
${PROGRESS_BAR_CONTAINER}           //div[contains(@class, "w-full") and contains(@class, "bg-gray-200") and contains(@class, "rounded-full") and contains(@class, "h-2")]
${PROGRESS_BAR_FILL}                //div[contains(@class, "bg-blue-600") and contains(@class, "h-2") and contains(@class, "rounded-full")]
${EDIT_WORKOUT_BTN}                 //button[./span]

*** Keywords ***
Open Workout Tracker
    [Documentation]    Open the workout tracker page in browser
    Open Browser And Login

Get Browser Console Messages
    [Documentation]    Retrieve console messages from browser (if supported)
    [Return]    No console access in SeleniumLibrary

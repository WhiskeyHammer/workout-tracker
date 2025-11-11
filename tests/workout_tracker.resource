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

# =============================================================================
# SET 1 (Active/Highlighted Set)
# =============================================================================
${SET1_REPS_LABEL}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Reps: "])[1]
${SET1_REPS_VALUE}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Reps: "]/following-sibling::span)[1]
${SET1_WEIGHT_LABEL}                (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Weight: "])[1]
${SET1_WEIGHT_VALUE}                (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Weight: "]/following-sibling::span)[1]
${SET1_REST_LABEL}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Rest: "])[1]
${SET1_REST_VALUE}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Rest: "]/following-sibling::span)[1]
${SET1_GROUP_LABEL}                 (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Group: "])[1]
${SET1_GROUP_VALUE}                 (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//span[text()="Group: "]/following-sibling::span)[1]
${SET1_NOTES_TEXT}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//p[contains(@class, "italic")]//span[text()="Click to add notes..."])[1]
${SET1_DELETE_BUTTON}               (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//button[@title="Delete exercise"])[1]
${SET1_COMPLETE_BUTTON}             (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-700")]//button[contains(@class, "w-14") and contains(@class, "h-14") and not(@disabled)])[1]

# =============================================================================
# SET 2 (Inactive/Dimmed Set)
# =============================================================================
${SET2_REPS_VALUE}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-900") and contains(@class, "opacity-60")]//span[text()="Reps: "]/following-sibling::span)[1]
${SET2_WEIGHT_VALUE}                (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-900") and contains(@class, "opacity-60")]//span[text()="Weight: "]/following-sibling::span)[1]
${SET2_REST_VALUE}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-900") and contains(@class, "opacity-60")]//span[text()="Rest: "]/following-sibling::span)[1]
${SET2_GROUP_VALUE}                 (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-900") and contains(@class, "opacity-60")]//span[text()="Group: "]/following-sibling::span)[1]
${SET2_NOTES_TEXT}                  (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-900") and contains(@class, "opacity-60")]//p[contains(@class, "italic")]//span[text()="Click to add notes..."])[1]
${SET2_DELETE_BUTTON}               (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-900") and contains(@class, "opacity-60")]//button[@title="Delete exercise"])[1]
${SET2_COMPLETE_BUTTON}             (//div[contains(@class, "border-gray-600") and contains(@class, "bg-gray-900") and contains(@class, "opacity-60")]//button[contains(@class, "w-14") and contains(@class, "h-14") and @disabled])[1]

# =============================================================================
# EXERCISE ACTIONS
# =============================================================================
${ADD_SET_BUTTON}                   //button[contains(@class, "border-dashed") and .//span[text()="Add Set"]]
${EXERCISE_NOTES_LABEL}             //label[text()="Exercise Notes"]
${EXERCISE_NOTES_TEXTAREA}          //textarea[@placeholder="Add notes about this exercise..."]
${ADD_EXERCISE_BUTTON}              //button[contains(@class, "border-dashed") and .//span[text()="Add Exercise"]]

# =============================================================================
# WORKOUT ACTIONS
# =============================================================================
${COMPLETE_WORKOUT_BUTTON}          //button[contains(@class, "bg-green-700") and text()="Complete Workout"]

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

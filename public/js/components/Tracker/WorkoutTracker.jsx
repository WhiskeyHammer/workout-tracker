// Full WorkoutTracker component - Loaded as global
function WorkoutTracker({
  exercises: propExercises,
  setExercises: propSetExercises,
  exerciseNotes: propExerciseNotes,
  setExerciseNotes: propSetExerciseNotes,
  nextWeightValues: propNextWeightValues,
  setNextWeightValues: propSetNextWeightValues,
  exercisesWithWeightSet: propExercisesWithWeightSet,
  setExercisesWithWeightSet: propSetExercisesWithWeightSet,
  darkMode: propDarkMode,
  setDarkMode: propSetDarkMode,
  hideFileUpload = false,
  onComplete,
  autoImportData,
  initialEditMode = false,
} = {}) {
  const { useState, useEffect, useRef } = React;
  
  // Use props if provided, otherwise use internal state
  const [exercises, setExercises] = useState(propExercises || []);
  const [fileName, setFileName] = useState("");
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [timerJustStarted, setTimerJustStarted] = useState(false);
  const [showUncompleteDialog, setShowUncompleteDialog] = useState(false);
  const [exerciseToUncomplete, setExerciseToUncomplete] = useState(null);
  const [showSkipRestDialog, setShowSkipRestDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState(propExerciseNotes || {});
  const [importedExerciseNotes, setImportedExerciseNotes] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState("1");
  const [insertAfterGroup, setInsertAfterGroup] = useState(null);
  const [editingExerciseName, setEditingExerciseName] = useState(null);
  const [editMode, setEditMode] = useState(() => {
    console.log('🎯 WorkoutTracker: Initializing editMode with initialEditMode =', initialEditMode);
    return initialEditMode;
  });
  const [internalDarkMode, setInternalDarkMode] = useState(true);
  const [showWeightGroupModal, setShowWeightGroupModal] = useState(false);
  const [weightGroupValues, setWeightGroupValues] = useState({});
  const [currentExerciseForWeightGroup, setCurrentExerciseForWeightGroup] =
    useState(null);
  const [exercisesWithWeightSet, setExercisesWithWeightSet] = useState(
    propExercisesWithWeightSet || new Set(),
  );
  const [nextWeightValues, setNextWeightValues] = useState(
    propNextWeightValues || {},
  );
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState(new Set());
  const exerciseRefs = useRef({});
  const [editingExerciseNotes, setEditingExerciseNotes] = useState(null);
  const [editExerciseNotesValue, setEditExerciseNotesValue] = useState("");
  const exerciseNotesTextareaRef = useRef(null);
  const setNotesTextareaRef = useRef(null);
  const isAutoImporting = useRef(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' });
  const [bypassImportScreen, setBypassImportScreen] = useState(false);

  // Use external darkMode if provided, otherwise use internal state
  const darkMode = propDarkMode !== undefined ? propDarkMode : internalDarkMode;
  const setDarkMode = propSetDarkMode !== undefined ? propSetDarkMode : setInternalDarkMode;

  // Sync props to local state when props change
  useEffect(() => {
    if (propExercises !== undefined) setExercises(propExercises);
  }, [propExercises]);

  useEffect(() => {
    if (propExerciseNotes !== undefined) setExerciseNotes(propExerciseNotes);
  }, [propExerciseNotes]);

  useEffect(() => {
    if (propNextWeightValues !== undefined)
      setNextWeightValues(propNextWeightValues);
  }, [propNextWeightValues]);

  useEffect(() => {
    if (propExercisesWithWeightSet !== undefined)
      setExercisesWithWeightSet(propExercisesWithWeightSet);
  }, [propExercisesWithWeightSet]);

  // Request Wake Lock when exercises are loaded
  useEffect(() => {
    if (exercises.length > 0) {
      // Request wake lock to keep screen on during workout
      if (window.wakeLockManager) {
        window.wakeLockManager.request();
      }
    }
    
    // Release wake lock when component unmounts (user leaves workout)
    return () => {
      if (window.wakeLockManager) {
        window.wakeLockManager.release();
      }
    };
  }, [exercises.length > 0]);

  // Sync local state changes back to parent if setter functions provided
  useEffect(() => {
    if (propSetExercises) propSetExercises(exercises);
  }, [exercises]);

  useEffect(() => {
    if (propSetExerciseNotes) propSetExerciseNotes(exerciseNotes);
  }, [exerciseNotes]);

  useEffect(() => {
    if (propSetNextWeightValues) propSetNextWeightValues(nextWeightValues);
  }, [nextWeightValues]);

  useEffect(() => {
    if (propSetExercisesWithWeightSet)
      propSetExercisesWithWeightSet(exercisesWithWeightSet);
  }, [exercisesWithWeightSet]);
  const handleFileUpload = async (e) => {
    const t = e.target.files[0];
    if (!t) return;
    setFileName(t.name);
    const r = await t.text();
    if (t.name.endsWith(".json")) {
      try {
        const data = JSON.parse(r);
        let n;
        const newNotes = {};
        let newNextWeights = {};
        if (data.exercises && data.nextWeights) {
          const e = data.exercises;
          n = [];
          let idCounter = 0;
          e.forEach((group) => {
            const exerciseName = group.exercise;
            group.sets.forEach((set) => {
              n.push({
                ...set,
                exercise: exerciseName,
                id: idCounter++,
                completed: set.completed || !1,
              });
            });
            if (group.exerciseNotes) {
              newNotes[exerciseName] = group.exerciseNotes;
            }
          });
          newNextWeights = data.nextWeights || {};
          if (data.weightsSet) {
            setExercisesWithWeightSet(new Set(data.weightsSet));
          }
        } else if (Array.isArray(data) && data.length > 0 && data[0].sets) {
          n = [];
          let idCounter = 0;
          data.forEach((group) => {
            const exerciseName = group.exercise;
            group.sets.forEach((set) => {
              n.push({
                ...set,
                exercise: exerciseName,
                id: idCounter++,
                completed: set.completed || !1,
              });
            });
            if (group.exerciseNotes) {
              newNotes[exerciseName] = group.exerciseNotes;
            }
          });
          setExercisesWithWeightSet(new Set());
          setImportedExerciseNotes({});
        } else {
          n = data.map((e, t) => ({
            ...e,
            id: t,
            completed: e.completed || !1,
          }));
          setExercisesWithWeightSet(new Set());
          setImportedExerciseNotes({});
        }
        setExercises(n);
        setExerciseNotes(newNotes);
        setImportedExerciseNotes({});
        setNextWeightValues(newNextWeights);
      } catch (err) {
        setInfoModalContent({
          title: 'Error',
          message: 'Error parsing JSON file: ' + err.message
        });
        setShowInfoModal(true);
      }
    } else {
      const n = r.split("\n").filter((e) => e.trim()),
        s = n[0].split(",").map((e) => e.trim().toLowerCase()),
        i = n.slice(1).map((e, t) => {
          const r = e.split(",").map((e) => e.trim()),
            n = {
              id: t,
              completed: !1,
            };
          return (
            s.forEach((e, t) => {
              n[e] = r[t] || "";
            }),
            n
          );
        });
      setExercises(i);
      setExercisesWithWeightSet(new Set());
      setNextWeightValues({});
      setImportedExerciseNotes({});
    }
  };
  const groupedExercises = exercises.reduce((e, t) => {
    const r = t.exercise || t.name || "Exercise";
    return (e[r] || (e[r] = []), e[r].push(t), e);
  }, {});
  const parseRestTime = (e) => {
    if (!e) return 0;
    const t = e.toString().toLowerCase().trim();
    if ("n/a" === t || "na" === t || "-" === t) return 0;
    if (t.includes(":")) {
      const e = t.split(":");
      return 60 * parseInt(e[0]) + parseInt(e[1]);
    } else {
      const e = parseFloat(t.replace(/[^0-9.]/g, ""));
      return isNaN(e) ? 0 : Math.round(60 * e);
    }
  };
  const toggleComplete = (e) => {
    const t = exercises.find((t) => t.id === e),
      r = t.exercise || t.name || "Exercise",
      n = groupedExercises[r],
      s = n.findIndex((t) => t.id === e);
    if (s > 0 && !t.completed && !n[s - 1].completed) return;
    if (t.completed) {
      if (n.some((e, t) => t > s && e.completed)) return;
      (setExerciseToUncomplete(e), setShowUncompleteDialog(!0));
    } else {
      if (
        (exerciseRefs.current[e] &&
          exerciseRefs.current[e].scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        t.rest)
      ) {
        const r = parseRestTime(t.rest);
        if (r > 0) {
          setTimerJustStarted(true);
          setActiveTimer(e);
          setTimeRemaining(r);
          setTimeRemainingMs(r * 1000);  // Initialize with full time in milliseconds
          setTimerEndTime(Date.now() + (r * 1000));
        }
      }
      setExercises(
        exercises.map((t) =>
          t.id === e
            ? {
                ...t,
                completed: !0,
              }
            : t,
        ),
      );
      
      // Check if this is the last set being completed
      const isLastSet = s === n.length - 1;
      const allSetsWillBeComplete = n.every((set, idx) => 
        idx === s ? true : set.completed
      );
      
      if (isLastSet && allSetsWillBeComplete) {
        // Check if exercise has weight groups and all weights are "-"
        const hasWeightGroups = n.some((set) => set["weight group"]);
        const allWeightsAreDash = n.every((set) => 
          set.weight === "-" || set.weight === "- "
        );
        
        if (hasWeightGroups && allWeightsAreDash) {
          // Automatically set next weight values to "-" for all weight groups in this exercise
          const weightGroups = n
            .filter((set) => set["weight group"])
            .map((set) => set["weight group"])
            .filter((group, idx, arr) => arr.indexOf(group) === idx);
          
          const autoWeightValues = {};
          weightGroups.forEach((group) => {
            autoWeightValues[group] = "-";
          });
          
          // Update state to mark weights as set
          const newSet = new Set(exercisesWithWeightSet);
          newSet.add(r);
          setExercisesWithWeightSet(newSet);
          setNextWeightValues({
            ...nextWeightValues,
            ...autoWeightValues,
          });
          
          // Collapse the exercise after auto-setting weights
          setCollapsedExercises(prev => {
            const newCollapsed = new Set(prev);
            newCollapsed.add(r);
            return newCollapsed;
          });
        }
      }
    }
  };
  const confirmUncomplete = () => {
    (null !== exerciseToUncomplete &&
      (activeTimer === exerciseToUncomplete &&
        (setActiveTimer(null), setTimeRemaining(0), setTimerEndTime(null)),
      setExercises(
        exercises.map((e) =>
          e.id === exerciseToUncomplete
            ? {
                ...e,
                completed: !1,
              }
            : e,
        ),
      )),
      setShowUncompleteDialog(!1),
      setExerciseToUncomplete(null));
  };
  const cancelUncomplete = () => {
    (setShowUncompleteDialog(!1), setExerciseToUncomplete(null));
  };
  const handleSkipRestClick = () => {
    setShowSkipRestDialog(!0);
  };
  const confirmSkipRest = () => {
    (setActiveTimer(null), setTimeRemaining(0), setTimerEndTime(null), setShowSkipRestDialog(!1));
  };
  const cancelSkipRest = () => {
    setShowSkipRestDialog(!1);
  };
  const openEditDialog = (e, t, r) => {
    (setEditingField({
      exerciseId: e,
      field: t,
    }),
      setEditValue(r || ""));
  };
  const closeEditDialog = () => {
    (setEditingField(null), setEditValue(""));
  };
  const saveEdit = () => {
    (editingField &&
      setExercises(
        exercises.map((e) =>
          e.id === editingField.exerciseId
            ? {
                ...e,
                [editingField.field]: editValue,
              }
            : e,
        ),
      ),
      closeEditDialog());
  };
  const updateExerciseNote = (e, t) => {
    setExerciseNotes((prevNotes) => ({
      ...prevNotes,
      [e]: t,
    }));
  };
  const openEditExerciseNotesDialog = (exerciseName, currentValue) => {
    setEditingExerciseNotes(exerciseName);
    setEditExerciseNotesValue(currentValue || "");
  };
  const closeEditExerciseNotesDialog = () => {
    setEditingExerciseNotes(null);
    setEditExerciseNotesValue("");
  };
  const saveExerciseNotes = () => {
    if (editingExerciseNotes) {
      updateExerciseNote(editingExerciseNotes, editExerciseNotesValue);
    }
    closeEditExerciseNotesDialog();
  };
  const openDeleteDialog = (e) => {
    (setExerciseToDelete(e), setShowDeleteDialog(!0));
  };
  const confirmDelete = () => {
    (null !== exerciseToDelete &&
      (activeTimer === exerciseToDelete &&
        (setActiveTimer(null), setTimeRemaining(0), setTimerEndTime(null)),
      setExercises(exercises.filter((e) => e.id !== exerciseToDelete))),
      setShowDeleteDialog(!1),
      setExerciseToDelete(null));
  };
  const cancelDelete = () => {
    (setShowDeleteDialog(!1), setExerciseToDelete(null));
  };
  const openAddExerciseDialog = (e) => {
    (setInsertAfterGroup(e),
      setShowAddExerciseDialog(!0),
      setNewExerciseName(""),
      setNewExerciseSets("1"));
  };
  const closeAddExerciseDialog = () => {
    (setShowAddExerciseDialog(!1),
      setNewExerciseName(""),
      setNewExerciseSets("1"),
      setInsertAfterGroup(null));
  };
  const confirmAddExercise = () => {
    if (!newExerciseName.trim()) return;
    const e = parseInt(newExerciseSets) || 1,
      t = exercises.length > 0 ? Math.max(...exercises.map((e) => e.id)) : -1,
      r = [];
    for (let n = 0; n < e; n++)
      r.push({
        id: t + 1 + n,
        exercise: newExerciseName.trim(),
        reps: "0",
        weight: "0",
        rest: "0",
        notes: "",
        "weight group": newExerciseName.trim(),
        completed: !1,
      });
    if (null === insertAfterGroup) setExercises([...exercises, ...r]);
    else {
      const e = Object.keys(groupedExercises),
        t = e.indexOf(insertAfterGroup);
      if (t >= 0) {
        const n = e.slice(0, t + 1),
          s = exercises.filter((e) => {
            const t = e.exercise || e.name || "Exercise";
            return n.includes(t);
          }),
          i = exercises.filter((e) => {
            const t = e.exercise || e.name || "Exercise";
            return !n.includes(t);
          });
        setExercises([...s, ...r, ...i]);
      } else setExercises([...exercises, ...r]);
    }
    closeAddExerciseDialog();
  };
  const addSetToExercise = (exerciseName) => {
    const exerciseGroup = groupedExercises[exerciseName];
    if (!exerciseGroup || exerciseGroup.length === 0) return;
    
    // Get the last set in this exercise group
    const lastSet = exerciseGroup[exerciseGroup.length - 1];
    
    // Generate new ID
    const maxId = exercises.length > 0 ? Math.max(...exercises.map((e) => e.id)) : -1;
    
    // Create new set copying last set's properties
    const newSet = {
      id: maxId + 1,
      exercise: exerciseName,
      reps: lastSet.reps || "0",
      weight: lastSet.weight || "0",
      rest: lastSet.rest || "0",
      notes: "",
      "weight group": lastSet["weight group"] || exerciseName,
      completed: false,
    };
    
    // Find the index where to insert (after the last set of this exercise)
    const lastSetIndex = exercises.findIndex((e) => e.id === lastSet.id);
    
    // Insert the new set
    const newExercises = [...exercises];
    newExercises.splice(lastSetIndex + 1, 0, newSet);
    
    setExercises(newExercises);
  };
  const openEditExerciseName = (e, t) => {
    setEditingExerciseName({
      oldName: e,
      newName: t,
    });
  };
  const closeEditExerciseName = () => {
    setEditingExerciseName(null);
  };
  const saveExerciseName = () => {
    if (editingExerciseName && editingExerciseName.newName.trim()) {
      const e = editingExerciseName.oldName,
        t = editingExerciseName.newName.trim();
      setExercises(
        exercises.map((r) =>
          r.exercise === e || r.name === e
            ? {
                ...r,
                exercise: t,
              }
            : r,
        ),
      );
      
      // Update exercise notes to use the new exercise name as key
      if (exerciseNotes[e]) {
        setExerciseNotes((prevNotes) => {
          const updatedNotes = { ...prevNotes };
          updatedNotes[t] = prevNotes[e];
          delete updatedNotes[e];
          return updatedNotes;
        });
      }
      
      // Update nextWeightValues if the old name was used as a weight group
      if (nextWeightValues[e]) {
        setNextWeightValues((prevValues) => {
          const updatedValues = { ...prevValues };
          updatedValues[t] = prevValues[e];
          delete updatedValues[e];
          return updatedValues;
        });
      }
      
      // Update exercisesWithWeightSet if it contains the old name
      if (exercisesWithWeightSet.has(e)) {
        setExercisesWithWeightSet((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.delete(e);
          newSet.add(t);
          return newSet;
        });
      }
    }
    closeEditExerciseName();
  };
  const isWeightGroupComplete = (e, t) => {
    const r = t.filter(
      (t) => t["weight group"] === e["weight group"] && t["weight group"],
    );
    return r.length > 0 && r.every((e) => e.completed);
  };
  const openWeightGroupModal = (e, t) => {
    const r = t
      .filter((e) => e["weight group"])
      .map((e) => e["weight group"])
      .filter((e, t, r) => r.indexOf(e) === t);
    const n = {};
    r.forEach((group) => {
      const ex = t.find((e) => e["weight group"] === group);
      n[group] = nextWeightValues[group] || (ex ? ex.weight : "");
    });
    setWeightGroupValues(n);
    setCurrentExerciseForWeightGroup(e);
    setShowWeightGroupModal(!0);
  };
  const closeWeightGroupModal = () => {
    setShowWeightGroupModal(!1);
    setWeightGroupValues({});
    setCurrentExerciseForWeightGroup(null);
  };
  const updateWeightGroupValue = (e, t) => {
    setWeightGroupValues({
      ...weightGroupValues,
      [e]: t,
    });
  };
  const saveWeightGroups = () => {
    const newSet = new Set(exercisesWithWeightSet);
    newSet.add(currentExerciseForWeightGroup);
    setExercisesWithWeightSet(newSet);
    setNextWeightValues({
      ...nextWeightValues,
      ...weightGroupValues,
    });
    
    // Collapse the exercise after saving weights
    setCollapsedExercises(prev => {
      const newCollapsed = new Set(prev);
      newCollapsed.add(currentExerciseForWeightGroup);
      return newCollapsed;
    });
    
    closeWeightGroupModal();
  };
  const moveExercise = (exerciseName, direction) => {
    const exerciseNames = Object.keys(groupedExercises);
    const currentIndex = exerciseNames.indexOf(exerciseName);
    
    // Can't move if already at the boundary
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === exerciseNames.length - 1)) {
      return;
    }
    
    // Calculate new index
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Create a new order array
    const newOrder = [...exerciseNames];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    // Rebuild exercises array in the new order
    const newExercises = [];
    newOrder.forEach(name => {
      const exerciseSets = groupedExercises[name];
      newExercises.push(...exerciseSets);
    });
    
    setExercises(newExercises);
  };

  const toggleExerciseCollapse = (exerciseName) => {
    setCollapsedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseName)) {
        newSet.delete(exerciseName);
      } else {
        newSet.add(exerciseName);
      }
      return newSet;
    });
  };
  
  // Load collapsed exercises from localStorage on mount or when exercises change
  useEffect(() => {
    if (exercises.length > 0 && !isAutoImporting.current) {
      try {
        const exerciseNames = Object.keys(groupedExercises).join('|');
        const storageKey = `collapsedExercises_${exerciseNames}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setCollapsedExercises(new Set(JSON.parse(saved)));
        }
      } catch (err) {
        console.error('Failed to load collapsed exercises:', err);
      }
    }
  }, [exercises.length]); // Only run when exercises are first loaded
  
  // Save collapsed exercises to localStorage whenever they change
  useEffect(() => {
    if (exercises.length > 0) {
      try {
        const exerciseNames = Object.keys(groupedExercises).join('|');
        const storageKey = `collapsedExercises_${exerciseNames}`;
        localStorage.setItem(storageKey, JSON.stringify(Array.from(collapsedExercises)));
      } catch (err) {
        console.error('Failed to save collapsed exercises:', err);
      }
    }
  }, [collapsedExercises, exercises.length]);
  
  const processImportData = (data) => {
    const importedNotes = {};
    let n = [];
    let idCounter = 0;
    data.exercises.forEach((group) => {
      const exerciseName = group.exercise;
      group.sets.forEach((set) => {
        const weightGroup = set["weight group"];
        const newWeight =
          weightGroup && data.nextWeights[weightGroup]
            ? data.nextWeights[weightGroup]
            : set.weight;
        n.push({
          ...set,
          exercise: exerciseName,
          weight: newWeight,
          id: idCounter++,
          completed: false,
        });
      });
      if (group.exerciseNotes) {
        importedNotes[exerciseName] = group.exerciseNotes;
      }
    });
    setExercises(n);
    setImportedExerciseNotes(importedNotes);
    setExerciseNotes({});
    setNextWeightValues({});
    setExercisesWithWeightSet(new Set());
  };

  const handleImportNextWorkout = async (e) => {
    const t = e.target.files[0];
    if (!t) return;
    if (!t.name.endsWith(".json")) {
      setInfoModalContent({
        title: 'Invalid File',
        message: 'Please select a JSON file'
      });
      setShowInfoModal(true);
      return;
    }
    setFileName(t.name);
    const r = await t.text();
    try {
      const data = JSON.parse(r);
      if (!data.exercises || !data.nextWeights) {
        setInfoModalContent({
          title: 'Invalid File Format',
          message: 'This file does not contain nextWeights data. Please export a completed workout first.'
        });
        setShowInfoModal(true);
        return;
      }
      processImportData(data);
    } catch (err) {
      setInfoModalContent({
        title: 'Error',
        message: 'Error parsing JSON file: ' + err.message
      });
      setShowInfoModal(true);
    }
  };

  const exportWorkout = () => {
    const grouped = {};
    exercises.forEach((ex) => {
      const exerciseName = ex.exercise || ex.name || "Exercise";
      if (!grouped[exerciseName]) {
        grouped[exerciseName] = {
          exercise: exerciseName,
          exerciseNotes: exerciseNotes[exerciseName] || "",
          sets: [],
        };
      }
      const { exercise, name, ...setData } = ex;
      grouped[exerciseName].sets.push(setData);
    });
    const exportData = {
      exercises: Object.values(grouped),
      nextWeights: nextWeightValues,
      weightsSet: Array.from(exercisesWithWeightSet),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().split("T")[0];
    const name = fileName ? fileName.replace(/\.[^/.]+$/, "") : "workout";
    link.download = `${name}-export-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Auto-import lastCompletedSession data when provided
  useEffect(() => {
    if (autoImportData) {
      if (autoImportData.exercises && Array.isArray(autoImportData.exercises)) {
        // Set flag to prevent localStorage from overwriting our cleared state
        isAutoImporting.current = true;
        
        // Ensure nextWeights exists, default to empty object if not
        const dataToProcess = {
          ...autoImportData,
          nextWeights: autoImportData.nextWeights || {}
        };
        processImportData(dataToProcess);
        // Clear collapsed state when auto-importing so exercises start expanded
        setCollapsedExercises(new Set());
        
        // Reset flag after a short delay to allow normal localStorage behavior
        setTimeout(() => {
          isAutoImporting.current = false;
        }, 100);
      }
    }
  }, [autoImportData]);
  
  // Position cursor at end of text when exercise notes modal opens
  useEffect(() => {
    if (editingExerciseNotes && exerciseNotesTextareaRef.current) {
      const textarea = exerciseNotesTextareaRef.current;
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      textarea.focus();
    }
  }, [editingExerciseNotes]);
  
  // Position cursor at end of text when set notes modal opens
  useEffect(() => {
    if (editingField && editingField.field === "notes" && setNotesTextareaRef.current) {
      const textarea = setNotesTextareaRef.current;
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      textarea.focus();
    }
  }, [editingField]);
  // Reset timerJustStarted flag after initial fill
  useEffect(() => {
    if (timerJustStarted) {
      // Use setTimeout to allow the instant fill to happen first
      const timeoutId = setTimeout(() => {
        setTimerJustStarted(false);
      }, 50); // Reset after initial render
      
      return () => clearTimeout(timeoutId);
    }
  }, [timerJustStarted]);

  useEffect(() => {
    if (null !== activeTimer && timerEndTime !== null) {
      // Use timestamp-based timer for accuracy even when app is backgrounded
      const intervalId = setInterval(() => {
        const now = Date.now();
        const remainingMs = Math.max(0, timerEndTime - now);
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        
        setTimeRemaining(remainingSeconds);
        setTimeRemainingMs(remainingMs);
        
        if (remainingMs === 0) {
          // Play audio alert
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          
          // Second beep
          setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            oscillator2.frequency.value = 800;
            oscillator2.type = "sine";
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.5);
          }, 200);
          
          setActiveTimer(null);
          setTimerEndTime(null);
        }
      }, 100); // Check every 100ms for better accuracy
      
      return () => clearInterval(intervalId);
    }
  }, [activeTimer, timerEndTime]);
  return (
    <div
      className={`min-h-screen pb-20 transition-colors overflow-x-hidden ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {0 === exercises.length && !bypassImportScreen && (
        <div className="p-4">
          <label
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${darkMode ? "border-gray-600 bg-gray-800 hover:bg-gray-750" : "border-gray-300 bg-white hover:bg-gray-50"}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p
                className={`mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-500"}`}
              >
                Click to upload CSV or JSON
              </p>
              <p
                className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                CSV or JSON with exercise data
              </p>
            </div>
            <input
              type="file"
              className="hidden zz_btn_upload_workout_file"
              accept=".csv,.json"
              onChange={handleFileUpload}
            />
          </label>
          <div className="mt-4">
            <button
              onClick={() => {
                console.log('✨ WorkoutTracker: Create Workout Manually clicked. Bypassing import screen, enabling edit mode, and opening add exercise dialog');
                setBypassImportScreen(true);
                setEditMode(true);
                openAddExerciseDialog(null);
              }}
              className={`zz_btn_create_workout_manual w-full py-4 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-3 ${darkMode ? "border-green-700 bg-gray-800 hover:bg-gray-750 text-green-400" : "border-green-400 bg-green-50 hover:bg-green-100 text-green-600"}`}
            >
              <Plus className="w-6 h-6" />
              <div className="text-left">
                <p className="text-sm font-semibold">
                  Create Workout Manually
                </p>
                <p className={`text-xs ${darkMode ? "text-green-500" : "text-green-500"}`}>
                  Add exercises one by one
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
      {(exercises.length > 0 || bypassImportScreen) && (
        <div className="p-4 space-y-8">
          {Object.entries(groupedExercises).map(([exerciseName, t], r) => (
            <React.Fragment key={exerciseName}>
              <div
                className={`rounded-xl shadow-md border p-6 space-y-3 transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <div className={`flex items-center justify-between ${!collapsedExercises.has(exerciseName) ? 'mb-3' : ''}`}>
                  <div className="flex items-center gap-4">
                    <h2
                      onClick={
                        editMode ? () => openEditExerciseName(exerciseName, exerciseName) : undefined
                      }
                      style={{
                        cursor: editMode ? "pointer" : "default",
                        userSelect: "none",
                      }}
                      className={`zz_editable_exercise_name text-xl font-bold pl-1 transition-colors ${editMode ? "hover:text-blue-600" : ""} ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                    >
                      {exerciseName}
                    </h2>
                    {editMode && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveExercise(exerciseName, 'up')}
                          disabled={r === 0}
                          className={`zz_btn_move_exercise_up p-1 rounded transition-colors ${
                            r === 0
                              ? 'opacity-30 cursor-not-allowed'
                              : darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveExercise(exerciseName, 'down')}
                          disabled={r === Object.entries(groupedExercises).length - 1}
                          className={`zz_btn_move_exercise_down p-1 rounded transition-colors ${
                            r === Object.entries(groupedExercises).length - 1
                              ? 'opacity-30 cursor-not-allowed'
                              : darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {exercisesWithWeightSet.has(exerciseName) && (
                      <div className="flex items-center">
                        <Check className={`w-5 h-5 ${darkMode ? "text-green-400" : "text-green-600"}`} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExerciseCollapse(exerciseName)}
                      className={`zz_btn_toggle_collapse p-2 rounded-lg transition-all ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                      aria-label={collapsedExercises.has(exerciseName) ? "Expand exercise" : "Collapse exercise"}
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${collapsedExercises.has(exerciseName) ? "-rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>
                {!collapsedExercises.has(exerciseName) && (
                  <>
                    {importedExerciseNotes[exerciseName] && (
                      <div
                        className={`mb-3 px-3 py-2 rounded-lg border-l-4 ${darkMode ? "bg-gray-750 border-blue-600 text-gray-400" : "bg-blue-50 border-blue-400 text-gray-600"}`}
                      >
                        <p className="zz_last_lift_notes text-sm italic">{importedExerciseNotes[exerciseName]}</p>
                      </div>
                    )}
                {t.map((e, r) => {
                  const n = 0 === r || t[r - 1].completed,
                    s = !e.completed && !n,
                    i = t.some((t, n) => n > r && t.completed),
                    o = e.completed && i,
                    isLastSet = r === t.length - 1;
                  return (
                    <React.Fragment key={e.id}>
                    <div
                      key={e.id}
                      ref={(t) => (exerciseRefs.current[e.id] = t)}
                      className={`rounded-lg border transition-all ${e.completed ? (darkMode ? "border-green-600 bg-green-900/30" : "border-green-500 bg-green-50") : s ? (darkMode ? "border-gray-600 bg-gray-900 opacity-60" : "border-gray-300 bg-gray-100 opacity-60") : darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"}`}
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                            {e.reps && (
                              <div className="flex items-baseline gap-1">
                                <span
                                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  Reps:{" "}
                                </span>
                                <span
                                  onClick={() =>
                                    openEditDialog(e.id, "reps", e.reps)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                  }}
                                  className={`zz_editable_reps text-sm hover:text-blue-500 hover:underline transition-colors ${darkMode ? "text-gray-100" : "text-gray-900"}`}
                                >
                                  {e.reps}
                                </span>
                              </div>
                            )}
                            {e.weight && (
                              <div className="flex items-baseline gap-1">
                                <span
                                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  Weight:{" "}
                                </span>
                                <span
                                  onClick={() =>
                                    openEditDialog(e.id, "weight", e.weight)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                  }}
                                  className={`zz_editable_weight text-sm font-semibold hover:text-blue-500 hover:underline transition-colors ${darkMode ? "text-gray-100" : "text-gray-900"}`}
                                >
                                  {e.weight}
                                </span>
                              </div>
                            )}
                            {e.rest !== undefined && e.rest !== null && e.rest !== '' && (
                              <div className="flex items-baseline gap-1">
                                <span
                                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  Rest:{" "}
                                </span>
                                <span
                                  onClick={
                                    editMode
                                      ? () =>
                                          openEditDialog(e.id, "rest", e.rest)
                                      : undefined
                                  }
                                  style={{
                                    cursor: editMode ? "pointer" : "default",
                                    userSelect: "none",
                                  }}
                                  className={
                                    editMode
                                      ? `zz_editable_rest text-sm hover:text-blue-500 hover:underline transition-colors ${darkMode ? "text-gray-100" : "text-gray-900"}`
                                      : `text-sm transition-colors ${darkMode ? "text-gray-100" : "text-gray-900"}`
                                  }
                                >
                                  {e.rest}
                                </span>
                              </div>
                            )}
                            {editMode && (
                              <div className="flex items-baseline gap-1">
                                <span
                                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  Group:{" "}
                                </span>
                                <span
                                  onClick={() =>
                                    openEditDialog(
                                      e.id,
                                      "weight group",
                                      e["weight group"],
                                    )
                                  }
                                  style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                  }}
                                  className={`zz_editable_group text-sm font-medium hover:text-blue-500 hover:underline transition-colors ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                                >
                                  {e["weight group"] || "None"}
                                </span>
                              </div>
                            )}
                          </div>
                          {(e.notes || editMode) && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p
                                onClick={
                                  editMode
                                    ? () =>
                                        openEditDialog(e.id, "notes", e.notes)
                                    : undefined
                                }
                                style={{
                                  cursor: editMode ? "pointer" : "default",
                                  userSelect: "none",
                                }}
                                className={
                                  editMode
                                    ? `zz_editable_set_notes text-sm italic hover:text-blue-500 transition-colors ${darkMode ? "text-gray-400" : "text-gray-600"}`
                                    : `text-sm italic transition-colors ${darkMode ? "text-gray-400" : "text-gray-600"}`
                                }
                              >
                                {e.notes || (
                                  <span
                                    className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}
                                  >
                                    Click to add notes...
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {!e.completed && editMode && (
                            <button
                              onClick={() => openDeleteDialog(e.id)}
                              className="zz_btn_delete_set text-gray-400 hover:text-red-500 transition-colors p-2"
                              title="Delete exercise"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => toggleComplete(e.id)}
                            disabled={s || (activeTimer !== null && timeRemaining > 0)}
                            className={`zz_btn_toggle_set_complete flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-colors ${e.completed ? (o ? "bg-green-800 text-white cursor-not-allowed" : "bg-green-500 text-white") : (s || (activeTimer !== null && timeRemaining > 0)) ? "bg-gray-300 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-400 hover:bg-gray-300"}`}
                          >
                            <Check className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {editMode && isLastSet && (
                      <button
                        onClick={() => addSetToExercise(exerciseName)}
                        className={`zz_btn_add_set w-full mt-2 py-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${darkMode ? "border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400" : "border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600"}`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Set</span>
                      </button>
                    )}
                    </React.Fragment>
                  );
                })}
                <div
                  className={`rounded-lg border p-4 mt-4 transition-colors ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Exercise Notes
                    </label>
                    {importedExerciseNotes[exerciseName] && (
                      <button
                        onClick={() =>
                          updateExerciseNote(exerciseName, importedExerciseNotes[exerciseName])
                        }
                        className={`zz_btn_copy_previous_notes text-xs px-2 py-1 rounded transition-colors ${darkMode ? "bg-gray-700 text-blue-400 hover:bg-gray-600" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                      >
                        Copy from previous
                      </button>
                    )}
                  </div>
                  <p
                    onClick={() => openEditExerciseNotesDialog(exerciseName, exerciseNotes[exerciseName])}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    className={`zz_editable_exercise_notes w-full px-3 py-2 border rounded-lg text-sm hover:text-blue-500 hover:border-blue-400 transition-colors min-h-[60px] ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                  >
                    {exerciseNotes[exerciseName] || (
                      <span className={`italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Click to add notes about this exercise...
                      </span>
                    )}
                  </p>
                </div>
                {t.some((e) => e["weight group"]) &&
                  t.every((e) => e.completed) &&
                  (exercisesWithWeightSet.has(exerciseName) ? (
                    <button
                      onClick={() => openWeightGroupModal(exerciseName, t)}
                      className={`zz_btn_exercise_complete w-full mt-3 py-3 rounded-lg font-medium transition-colors ${darkMode ? "bg-green-900/40 text-green-300 hover:bg-green-900/60" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                    >
                      Exercise Complete
                    </button>
                  ) : (
                    <button
                      onClick={() => openWeightGroupModal(exerciseName, t)}
                      className={`zz_btn_set_next_weight w-full mt-3 py-3 text-white rounded-lg font-medium transition-colors ${darkMode ? "bg-green-700 hover:bg-green-600" : "bg-green-600 hover:bg-green-700"}`}
                    >
                      Complete Exercise & Set Next Weight
                    </button>
                  ))}
                  </>
                )}
              </div>
              {r < Object.entries(groupedExercises).length - 1 && editMode && (
                <button
                  onClick={() => openAddExerciseDialog(exerciseName)}
                  className={`zz_btn_add_exercise_between w-full py-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${darkMode ? "border-gray-600 text-gray-500 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"}`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">Add Exercise</span>
                </button>
              )}
            </React.Fragment>
          ))}
          {editMode && (
            <button
              onClick={() => openAddExerciseDialog(null)}
              className={`zz_btn_add_exercise_end w-full py-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${darkMode ? "border-gray-600 text-gray-500 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"}`}
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Exercise</span>
            </button>
          )}
          <button
            onClick={() => setShowCompleteDialog(true)}
            className={`zz_btn_complete_workout w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
              (() => {
                // Get all exercise names that have weight groups (regardless of completion)
                const exercisesWithWeightGroups = Object.entries(groupedExercises)
                  .filter(([name, sets]) => sets.some(s => s["weight group"]))
                  .map(([name]) => name);
                
                // If no exercises have weight groups, button can be green
                if (exercisesWithWeightGroups.length === 0) {
                  return darkMode 
                    ? "bg-green-700 text-white hover:bg-green-600" 
                    : "bg-green-600 text-white hover:bg-green-700";
                }
                
                // Get exercise names that have weight groups AND all sets complete
                const exercisesNeedingWeightSet = Object.entries(groupedExercises)
                  .filter(([name, sets]) => 
                    sets.some(s => s["weight group"]) && 
                    sets.every(s => s.completed)
                  )
                  .map(([name]) => name);
                
                // If not all weight-group exercises are complete, button should be gray
                if (exercisesNeedingWeightSet.length < exercisesWithWeightGroups.length) {
                  return darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-650"
                    : "bg-gray-300 text-gray-600 hover:bg-gray-400";
                }
                
                // Check if all completed weight-group exercises have weights set
                const allWeightsSet = exercisesNeedingWeightSet.every(name => 
                  exercisesWithWeightSet.has(name)
                );
                
                return allWeightsSet
                  ? darkMode 
                    ? "bg-green-700 text-white hover:bg-green-600" 
                    : "bg-green-600 text-white hover:bg-green-700"
                  : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-650"
                    : "bg-gray-300 text-gray-600 hover:bg-gray-400";
              })()
            }`}
          >
            Complete Workout
          </button>
        </div>
      )}
      {showUncompleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-20 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Uncomplete Exercise?
            </h2>
            <p className={`mb-6 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to mark this lift as incomplete?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelUncomplete}
                className={`zz_btn_cancel_uncomplete flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmUncomplete}
                className="zz_btn_confirm_uncomplete flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Uncomplete
              </button>
            </div>
          </div>
        </div>
      )}
      {showSkipRestDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Skip Rest Period?
            </h2>
            <p className={`mb-6 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to skip the remaining rest time?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelSkipRest}
                className={`zz_btn_cancel_skip_rest flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmSkipRest}
                className="zz_btn_confirm_skip_rest flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`zz_title_edit_field text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Edit{" "}
              {"reps" === editingField.field
                ? "Reps"
                : "weight" === editingField.field
                  ? "Weight"
                  : "rest" === editingField.field
                    ? "Rest"
                    : "weight group" === editingField.field
                      ? "Weight Group"
                      : "Notes"}
            </h2>
            {"notes" === editingField.field ? (
              <textarea
                ref={setNotesTextareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={`zz_input_edit_notes w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none mb-6 resize-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'border-gray-300 text-gray-900 focus:border-blue-500'}`}
                placeholder="Add notes..."
                rows="4"
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onFocus={(e) => e.target.select()}
                className={`zz_input_edit_field w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none mb-6 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'border-gray-300 text-gray-900 focus:border-blue-500'}`}
                placeholder={
                  "reps" === editingField.field
                    ? "e.g. 10"
                    : "weight" === editingField.field
                      ? "e.g. 135 lbs"
                      : "weight group" === editingField.field
                        ? "e.g. Bench Press"
                        : "e.g. 1.5"
                }
                autoFocus
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={closeEditDialog}
                className={`zz_btn_cancel_edit flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="zz_btn_save_edit flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {editingExerciseName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Edit Exercise Name
            </h2>
            <input
              type="text"
              value={editingExerciseName.newName}
              onChange={(e) =>
                setEditingExerciseName({
                  ...editingExerciseName,
                  newName: e.target.value,
                })
              }
              onFocus={(e) => e.target.select()}
              className={`zz_input_edit_exercise_name w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none mb-6 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'border-gray-300 text-gray-900 focus:border-blue-500'}`}
              placeholder="e.g. Bench Press"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={closeEditExerciseName}
                className={`zz_btn_cancel_edit_name flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={saveExerciseName}
                disabled={!editingExerciseName.newName.trim()}
                className={`zz_btn_save_exercise_name flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:cursor-not-allowed ${darkMode ? 'disabled:bg-gray-600' : 'disabled:bg-gray-300'}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Delete Exercise?
            </h2>
            <p className={`mb-6 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete this exercise? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className={`zz_btn_cancel_delete flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="zz_btn_confirm_delete flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddExerciseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Add New Exercise
            </h2>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Exercise Name
              </label>
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                className={`zz_input_new_exercise_name w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'border-gray-300 text-gray-900 focus:border-blue-500'}`}
                placeholder="e.g. Dumbbell Curls"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeAddExerciseDialog}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmAddExercise}
                disabled={!newExerciseName.trim()}
                className={`flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:cursor-not-allowed ${darkMode ? 'disabled:bg-gray-600' : 'disabled:bg-gray-300'}`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showWeightGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Complete Exercise & Set Next Weight
            </h2>
            <div className="mb-6 space-y-4">
              {Object.keys(weightGroupValues).map((group) => (
                <div key={group} className="space-y-2">
                  <label className={`zz_label_weight_group block text-sm font-medium transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {group}
                  </label>
                  <input
                    type="text"
                    value={weightGroupValues[group]}
                    onChange={(e) =>
                      updateWeightGroupValue(group, e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className={`zz_input_weight_group w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'border-gray-300 text-gray-900 focus:border-blue-500'}`}
                    placeholder="e.g. 40 lbs"
                    autoFocus={Object.keys(weightGroupValues)[0] === group}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeWeightGroupModal}
                className={`zz_btn_cancel_next_weight flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={saveWeightGroups}
                className="zz_btn_save_next_weight flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {editingExerciseNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Edit Exercise Notes
            </h2>
            <textarea
              ref={exerciseNotesTextareaRef}
              value={editExerciseNotesValue}
              onChange={(e) => setEditExerciseNotesValue(e.target.value)}
              className={`zz_input_edit_exercise_notes w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none mb-6 resize-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'border-gray-300 text-gray-900 focus:border-blue-500'}`}
              placeholder="Add notes about this exercise..."
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={closeEditExerciseNotesDialog}
                className={`zz_btn_cancel_edit_exercise_notes flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={saveExerciseNotes}
                className="zz_btn_save_exercise_notes flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showCompleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-30 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Complete Workout?
            </h2>
            <p className={`mb-6 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to complete this workout? It will be saved and you'll return to the workout library.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteDialog(false)}
                className={`zz_btn_cancel_complete_workout flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCompleteDialog(false);
                  if (onComplete) {
                    onComplete();
                  }
                }}
                className="zz_btn_confirm_complete_workout flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Countdown Timer Bar - appears above footer when active */}
      {exercises.length > 0 && activeTimer !== null && timeRemaining > 0 && (
        <div
          className={`fixed left-0 right-0 border-t shadow-lg transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          style={{ bottom: '73px', marginBottom: '8px' }}
        >
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 flex justify-center">
                <button
                  onClick={handleSkipRestClick}
                  className={`zz_btn_skip_rest inline-flex items-center gap-2 px-4 py-1 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <Clock className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                  <span className={`text-lg font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Timer progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`bg-sky-500 h-2 rounded-full ${timerJustStarted ? '' : 'transition-all duration-50 ease-linear'}`}
                style={{
                  width: `${(timeRemainingMs / ((exercises.find((e) => e.id === activeTimer)?.rest ? parseRestTime(exercises.find((e) => e.id === activeTimer).rest) : timeRemaining) * 1000)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Bar */}
      {exercises.length > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 border-t shadow-lg transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Empty space for symmetry */}
              <div className="w-[100px]"></div>
              
              {/* Center: Progress */}
              <div className="flex-1 flex justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {exercises.filter((e) => e.completed).length} / {exercises.length} completed
                </span>
              </div>
              
              {/* Right: Edit button */}
              <button
                onClick={() => {
                  console.log('🔧 WorkoutTracker: Edit mode toggle clicked. Current editMode =', editMode, '→ New editMode =', !editMode);
                  setEditMode(!editMode);
                }}
                className={`zz_btn_edit_mode inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg font-medium transition-colors ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                <Edit className="w-5 h-5" />
                <span>{editMode ? "Done" : "Edit"}</span>
              </button>
            </div>
            
            {/* Exercise completion progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(exercises.filter((e) => e.completed).length / exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-[15vh]">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {infoModalContent.title}
            </h2>
            <p className={`mb-6 whitespace-pre-line transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {infoModalContent.message}
            </p>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

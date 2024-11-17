const tabs = document.querySelectorAll("#questions-section .tab");
const contentContainer = document.querySelector(
  "#questions-section .content-container"
);

let questions = [];
let filtered_questions = [];

// Add this at the top of the file after the initial variable declarations
const TOAST_TYPES = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  ERROR: "error",
};

// Initialize questions from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize localStorage with empty structure if it doesn't exist
  if (!localStorage.getItem("questions")) {
    const initialStructure = [
      {
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      },
      {
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      },
      {
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      },
      {
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      },
      {
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      },
      {
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      },
    ];
    localStorage.setItem("questions", JSON.stringify(initialStructure));
  }

  // Set initial active states
  const firstLevelBtn = document.querySelector(".level-btn");
  const firstTab = document.querySelector("#questions-section .tab");
  if (firstLevelBtn)
    firstLevelBtn.classList.add(
      "active",
      "bg-indigo-50",
      "ring-2",
      "ring-indigo-500"
    );
  if (firstTab)
    firstTab.classList.add("active", "border-blue-500", "text-blue-500");

  // Load questions from localStorage and render initial view
  renderQuestion(0, 0, "Grammaire");

  // Initialize all modal handlers
  initializeModalHandlers();

  initializeDeleteHandler();
});

function initializeModalHandlers() {
  // Initialize containers
  const createModal = document.getElementById("createModal");
  const editModal = document.getElementById("editModal");
  const newOptionsContainer = document.getElementById("newOptionsContainer");
  const editOptionsContainer = document.getElementById("optionsContainer");

  // Helper function to create option HTML
  function createOptionHTML(option = "", index = 0, isCorrect = false) {
    return `
      <div class="option-input flex items-center gap-3 mb-3 p-4 rounded-lg ${
        isCorrect ? "is-correct" : ""
      }">
        <input type="text" value="${option}"
          class="option flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
          placeholder="Enter option" />
        <div class="custom-radio">
          <input type="radio" name="correctAnswer" value="${index}" ${
      isCorrect ? "checked" : ""
    } />
          <span class="radio-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        ${
          index > 1
            ? `
          <button class="remove-option text-gray-400 hover:text-red-500 transition-colors">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        `
            : ""
        }
      </div>
    `;
  }

  // Helper function to add radio change handlers
  function addRadioHandlers(container) {
    container.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        container.querySelectorAll(".option-input").forEach((div) => {
          div.classList.remove("is-correct");
        });
        e.target.closest(".option-input").classList.add("is-correct");
      });
    });
  }

  // Initialize create modal options
  if (newOptionsContainer) {
    // Add initial options
    newOptionsContainer.innerHTML =
      createOptionHTML("", 0) + createOptionHTML("", 1);
    addRadioHandlers(newOptionsContainer);

    // Add option button handler
    const addOptionButton = document.getElementById("addOptionButton");
    if (addOptionButton) {
      addOptionButton.addEventListener("click", () => {
        const optionsCount =
          newOptionsContainer.querySelectorAll(".option-input").length;
        if (optionsCount >= 4) return;

        const newOptionHTML = createOptionHTML("", optionsCount);
        newOptionsContainer.insertAdjacentHTML("beforeend", newOptionHTML);
        addRadioHandlers(newOptionsContainer);

        // Update button visibility
        addOptionButton.classList.toggle("hidden", optionsCount + 1 >= 4);
      });
    }
  }

  /** */

  // Edit modal population
  window.handleEdit = function (index) {
    const level = getCurrentLevel();
    const category = getCurrentCategory();
    const questions = getQuestionsFromLocalStorage();
    const question = questions[level].categories[category][index];

    if (!question) return;

    // Store metadata
    editModal.dataset.index = index;
    editModal.dataset.level = level;
    editModal.dataset.category = category;

    // Populate question
    document.getElementById("question").value = question.question;

    // Populate options
    if (editOptionsContainer) {
      editOptionsContainer.innerHTML = question.options
        .map((option, i) =>
          createOptionHTML(option, i, option === question.answer)
        )
        .join("");
      addRadioHandlers(editOptionsContainer);

      // Update add option button visibility
      const addEditOption = document.getElementById("addEditOption");
      if (addEditOption) {
        addEditOption.classList.toggle("hidden", question.options.length >= 4);

        addEditOption.onclick = () => {
          const optionsCount =
            editOptionsContainer.querySelectorAll(".option-input").length;
          if (optionsCount >= 4) return;

          const newOptionHTML = createOptionHTML("", optionsCount);
          editOptionsContainer.insertAdjacentHTML("beforeend", newOptionHTML);
          addRadioHandlers(editOptionsContainer);
          addEditOption.classList.toggle("hidden", optionsCount + 1 >= 4);
        };
      }
    }

    editModal.classList.remove("hidden");
  };

  window.handleDelete = function (index) {
    const deleteModal = document.getElementById("deleteModal");
    const confirmDelete = document.getElementById("confirmDelete");

    // Store data for delete operation
    confirmDelete.dataset.index = index;
    confirmDelete.dataset.level = getCurrentLevel();
    confirmDelete.dataset.category = getCurrentCategory();

    deleteModal.classList.remove("hidden");
  };

  // Initialize delete confirmation handler
  const confirmDelete = document.getElementById("confirmDelete");
  if (confirmDelete) {
    confirmDelete.addEventListener("click", () => {
      const index = parseInt(confirmDelete.dataset.index);
      const level = parseInt(confirmDelete.dataset.level);
      const category = confirmDelete.dataset.category;

      const questions = getQuestionsFromLocalStorage();
      const questionText =
        questions[level].categories[category][index].question;

      questions[level].categories[category].splice(index, 1);
      saveQuestionsToLocalStorage(questions);

      // Show delete success toast
      showToast(
        `Question "${questionText}" successfully deleted`,
        TOAST_TYPES.DELETE
      );

      renderQuestion(level, getCurrentTabIndex(), category);
      document.getElementById("deleteModal").classList.add("hidden");
    });
  }

  // Add edit modal button handlers
  if (editModal) {
    // Close and Cancel buttons
    editModal.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        editModal.classList.add("hidden");
      });
    });

    // Save Changes button
    const saveChangesBtn = editModal.querySelector("#saveChanges");
    if (saveChangesBtn) {
      saveChangesBtn.addEventListener("click", () => {
        const questionData = validateEditInputs();
        if (!questionData) return;

        const questions = getQuestionsFromLocalStorage();
        const level = parseInt(editModal.dataset.level);
        const category = editModal.dataset.category;
        const index = parseInt(editModal.dataset.index);

        // Update question in storage
        questions[level].categories[category][index] = questionData;
        saveQuestionsToLocalStorage(questions);

        // Show update toast (blue)
        showToast(
          `Question "${questionData.question}" successfully updated`,
          TOAST_TYPES.UPDATE
        );

        // Re-render and close modal
        renderQuestion(level, getCurrentTabIndex(), category);
        editModal.classList.add("hidden");
      });
    }

    // Remove option buttons
    editModal.addEventListener("click", (e) => {
      if (e.target.closest(".remove-option")) {
        const optionsContainer = editModal.querySelector("#optionsContainer");
        if (optionsContainer.children.length > 2) {
          e.target.closest(".option-input").remove();
          // Show add option button if below 4 options
          const addEditOption = document.getElementById("addEditOption");
          addEditOption.classList.toggle(
            "hidden",
            optionsContainer.children.length >= 4
          );
        }
      }
    });
  }
}

function validateEditInputs() {
  const editModal = document.getElementById("editModal");
  const questionInput = editModal.querySelector("#question");
  const optionsContainer = editModal.querySelector("#optionsContainer");

  const question = questionInput.value.trim();
  const options = Array.from(optionsContainer.querySelectorAll(".option")).map(
    (input) => input.value.trim()
  );
  const selectedAnswer = optionsContainer.querySelector(
    'input[type="radio"]:checked'
  );

  if (!question) {
    showToast("Please enter a question", TOAST_TYPES.ERROR);
    return null;
  }

  if (options.length < 2) {
    showToast("Please provide at least 2 options", TOAST_TYPES.ERROR);
    return null;
  }

  if (options.some((opt) => !opt)) {
    showToast("Please fill in all options", TOAST_TYPES.ERROR);
    return null;
  }

  if (!selectedAnswer) {
    showToast("Please select the correct answer", TOAST_TYPES.ERROR);
    return null;
  }

  return {
    question,
    options,
    answer: options[selectedAnswer.value],
  };
}

// Helper function to show errors
function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");
    setTimeout(() => {
      errorContainer.classList.add("hidden");
    }, 3000);
  }
}

// Helper functions to get current state
function getCurrentLevel() {
  const activeLevel = document.querySelector(".level-btn.active");
  if (!activeLevel) return 0; // Default to first level if none active

  const levelButtons = document.querySelectorAll(".level-btn");
  const index = Array.from(levelButtons).indexOf(activeLevel);
  return index !== -1 ? index : 0;
}

function getCurrentCategory() {
  const activeTab = document.querySelector("#questions-section .tab.active");
  if (!activeTab) return "Grammaire"; // Default to Grammaire if no tab active

  const category = activeTab.textContent.trim();
  return category || "Grammaire";
}

function getCurrentTabIndex() {
  const tabs = document.querySelectorAll("#questions-section .tab");
  const activeTab = document.querySelector("#questions-section .tab.active");
  if (!activeTab) return 0;

  const index = Array.from(tabs).indexOf(activeTab);
  return index !== -1 ? index : 0;
}

// Update the tab click handlers
tabs.forEach((tab, index) => {
  tab.addEventListener("click", (e) => {
    // Update active tab
    tabs.forEach((t) =>
      t.classList.remove("active", "border-blue-500", "text-blue-500")
    );
    e.target.classList.add("active", "border-blue-500", "text-blue-500");

    // Determine category and render with current level
    const category =
      index === 0 ? "Grammaire" : index === 1 ? "Compréhension" : "Vocabulaire";
    const currentLevel = getCurrentLevel();
    renderQuestion(currentLevel, index, category);
  });
});

// Update level selection handling
const levelButtons = document.querySelectorAll(".level-btn");

levelButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    // Update active state
    levelButtons.forEach((b) => {
      b.classList.remove("active", "bg-indigo-50", "ring-2", "ring-indigo-500");
    });
    btn.classList.add("active", "bg-indigo-50", "ring-2", "ring-indigo-500");

    // Get current category from active tab
    const currentTab = getCurrentTabIndex();
    const category = getCurrentCategory();

    // Update current level and re-render
    renderQuestion(index, currentTab, category);
  });
});

function renderQuestion(level, tab_index, category) {
  const questions = getQuestionsFromLocalStorage();
  const categoryQuestions = questions[level].categories[category];

  // Add header with question count and add button
  contentContainer.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">${category}</h2>
        <p class="text-sm text-gray-500">Level ${
          ["A1", "A2", "B1", "B2", "C1", "C2"][level]
        } • ${categoryQuestions.length} questions</p>
      </div>
      <button onclick="handleQuestionCreation()" id="addQuestionBtn" class="bg-[#525CEB] hover:bg-[#6A64DA] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
        <i class="fas fa-plus"></i>
        Add Question
      </button>
    </div>
  `;

  // Render each question with action buttons
  categoryQuestions.forEach((question, index) => {
    const questionHTML = `
      <div class="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-all duration-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2">
              <div class="bg-purple-100 p-2 rounded-lg">
                <i class="fas fa-question text-[#525CEB]"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900">${
                question.question
              }</h3>
              </div>
                        <div class="flex items-start space-x-2">
            <button onclick="handlePreview(${index})" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200" title="Preview">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
            </button>
            <button onclick="handleEdit(${index})" class="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all duration-200" title="Edit">
                          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button onclick="handleDelete(${index})" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200" title="Delete">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>            
          </button>
          </div>
            </div>
            
            <div class="pl-11 space-y-2">
              ${question.options
                .map(
                  (option, optIndex) => `
                <div class="flex items-center gap-2 p-2 ${
                  option === question.answer ? "bg-green-50" : "bg-gray-50"
                } rounded-lg">
                  <i class="fas ${
                    option === question.answer
                      ? "fa-check-circle text-green-500"
                      : "fa-circle text-gray-400"
                  } w-5"></i>
                  <span class="${
                    option === question.answer
                      ? "text-green-700 font-medium"
                      : "text-gray-600"
                  }">${option}</span>
                  ${
                    option === question.answer
                      ? '<span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full ml-auto">Correct Answer</span>'
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
          </div>


        </div>
      </div>
    `;
    contentContainer.innerHTML += questionHTML;
  });
}

function saveQuestion() {
  const newQuestion = validateInputs();
  if (!newQuestion) return;

  // Get fresh data from localStorage
  const questions = getQuestionsFromLocalStorage();
  const currentLevel = 0;
  const category = getCurrentCategory();

  // Ensure the structure exists
  if (!questions[currentLevel]) {
    questions[currentLevel] = { categories: {} };
  }
  if (!questions[currentLevel].categories[category]) {
    questions[currentLevel].categories[category] = [];
  }

  // Add new question
  questions[currentLevel].categories[category].push(newQuestion);

  // Save to localStorage
  saveQuestionsToLocalStorage(questions);

  // Get current tab index
  const currentTabIndex = Array.from(tabs).findIndex((tab) =>
    tab.classList.contains("active")
  );

  // Re-render the current view
  renderQuestion(currentLevel, currentTabIndex, category);

  // Close modal and clear form
  document.getElementById("createModal").classList.add("hidden");
  clearForm();

  // Show create toast (green)
  showToast(
    `Question "${newQuestion.question}" successfully created`,
    TOAST_TYPES.CREATE
  );
}

// Helper functions
function getQuestionsFromLocalStorage() {
  const questions = localStorage.getItem("questions");
  if (!questions) {
    // Return default structure if localStorage is empty
    return Array(6)
      .fill()
      .map(() => ({
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      }));
  }
  return JSON.parse(questions);
}

function saveQuestionsToLocalStorage(questions) {
  localStorage.setItem("questions", JSON.stringify(questions));
}

function getCurrentCategory() {
  const currentTabIndex = Array.from(tabs).findIndex((tab) =>
    tab.classList.contains("active")
  );
  return currentTabIndex === 0
    ? "Grammaire"
    : currentTabIndex === 1
    ? "Compréhension"
    : "Vocabulaire";
}

function handleEventListeners(level, category) {
  // Add Question button
  document.querySelector(".bg-purple-500").addEventListener("click", () => {
    handleQuestionCreation();
    document.getElementById("createModal").classList.remove("hidden");
  });

  // Preview buttons
  document.querySelectorAll(".preview-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      handlePreview(index, level, category);
    });
  });

  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      window.handleEdit(index, getCurrentLevel(), getCurrentCategory());
    });
  });

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      handleDelete(index, getCurrentLevel(), getCurrentCategory());
    });
  });
}

// Helper functions for question actions
function handlePreview(index, level, category) {
  const questions = getQuestionsFromLocalStorage();
  const question = questions[level].categories[category][index];
  const previewModal = document.getElementById("previewModal");
  const previewContent = previewModal.querySelector(".preview-content");

  previewContent.innerHTML = `
    <div class="bg-white rounded-lg">
      <div class="mb-6">
        <span class="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
          Question Preview
        </span>
      </div>
      
      <div class="text-lg font-medium text-gray-900 mb-6">
        ${question.question}
      </div>

      <div class="space-y-3">
              ${question.options
                .map(
                  (option) => `
                <div class="flex items-center gap-2 p-2 ${
                  option === question.answer ? "bg-green-50" : "bg-gray-50"
                } rounded-lg">
                  <i class="fas ${
                    option === question.answer
                      ? "fa-check-circle text-green-500"
                      : "fa-circle text-gray-400"
                  } w-5"></i>
                  <span class="${
                    option === question.answer
                      ? "text-green-700 font-medium"
                      : "text-gray-600"
                  }">${option}</span>
                </div>
              `
                )
                .join("")}
      </div>

      <div class="mt-6 pt-4 border-t">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <i class="fas fa-info-circle"></i>
          <span>This is how the question will appear to students.</span>
        </div>
      </div>
    </div>
  `;

  previewModal.classList.remove("hidden");

  // Add close button handlers
  previewModal.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      previewModal.classList.add("hidden");
    });
  });
}

function handleEdit(index) {
  const editModal = document.getElementById("editModal");
  const level = getCurrentLevel();
  const category = getCurrentCategory();
  const questions = getQuestionsFromLocalStorage();
  const questionData = questions[level].categories[category][index];

  if (!questionData) {
    console.error("Question not found");
    return;
  }

  // Store metadata for save operation
  editModal.dataset.index = index;
  editModal.dataset.level = level;
  editModal.dataset.category = category;

  // Populate question text
  const questionTextarea = document.getElementById("question");
  questionTextarea.value = questionData.question;

  // Clear and populate options container
  optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  questionData.options.forEach((option, idx) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "option-input flex items-center gap-2 mb-2";
    optionDiv.innerHTML = `
      <input type="text" value="${option}"
        class="option flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Enter option" />
      <input type="radio" name="editCorrectAnswer" value="${idx}" ${
      option === questionData.answer ? "checked" : ""
    } />
      <button class="remove-option text-gray-400 hover:text-red-500 ${
        questionData.options.length <= 2 ? "hidden" : ""
      }">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    optionsContainer.appendChild(optionDiv);
  });

  // Regroup radio buttons after populating options
  regroupRadioButtons(optionsContainer, "editCorrectAnswer");

  // Update add option button visibility
  const addEditOption = document.getElementById("addEditOption");
  addEditOption.classList.toggle("hidden", questionData.options.length >= 4);

  // Show modal
  editModal.classList.remove("hidden");

  // Add radio change handlers
  const optionsContainer = document.getElementById("optionsContainer");
  if (optionsContainer) {
    optionsContainer
      .querySelectorAll('input[type="radio"]')
      .forEach((radio) => {
        radio.addEventListener("change", (e) => {
          optionsContainer.querySelectorAll(".option-input").forEach((div) => {
            div.classList.remove("is-correct");
          });
          e.target.closest(".option-input").classList.add("is-correct");
        });
      });
  }
}

function handleDelete(index) {
  const deleteModal = document.getElementById("deleteModal");
  const confirmDelete = document.getElementById("confirmDelete");

  // Get current state
  const level = getCurrentLevel();
  const category = getCurrentCategory();

  // Debug log to verify values before setting
  console.log("Setting delete data:", { index, level, category });

  // Store data for delete operation
  confirmDelete.setAttribute("data-index", index);
  confirmDelete.setAttribute("data-level", level);
  confirmDelete.setAttribute("data-category", category);

  // Show the modal
  deleteModal.classList.remove("hidden");
}

function generateQuestionHTML(question, index) {
  return `
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center justify-between gap-3 mb-4">
        <div class="flex items-center gap-2">
          <div class="bg-purple-100 p-2 rounded-lg">
            <svg class="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">${
            question.question
          }</h3>
          </div>
                <div class="flex items-start space-x-2">
        <button onclick="handlePreview(${index})" 
          class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200" 
          title="Preview">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button onclick="handleEdit(${index})" 
          class="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all duration-200" 
          title="Edit">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onclick="handleDelete(${index})" 
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200" 
          title="Delete">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
        </div>
        
        <div class="pl-11 space-y-2">
          ${question.options
            .map(
              (option) => `
            <div class="flex items-center gap-2 p-2 ${
              option === question.answer ? "bg-green-50" : "bg-gray-50"
            } rounded-lg">
              <i class="fas ${
                option === question.answer
                  ? "fa-check-circle text-green-500"
                  : "fa-circle text-gray-400"
              } w-5"></i>
              <span class="${
                option === question.answer
                  ? "text-green-700 font-medium"
                  : "text-gray-600"
              }">${option}</span>
                ${
                  option === question.answer
                    ? '<span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full ml-auto">Correct Answer</span>'
                    : ""
                }
            </div>
          `
            )
            .join("")}
        </div>
      </div>


    </div>
  `;
}

function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");
  setTimeout(() => {
    errorContainer.classList.add("hidden");
  }, 3000);
}

function handleQuestionCreation() {
  const createModal = document.getElementById("createModal");
  const addOptionBtn = document.getElementById("addOptionButton");
  const optionsContainer = document.getElementById("newOptionsContainer");
  const saveBtn = document.getElementById("saveNewQuestion");
  const errorContainer = document.getElementById("errorContainer");

  // Show the modal
  createModal.classList.remove("hidden");

  function addOptionInput() {
    const optionCount =
      optionsContainer.querySelectorAll(".option-input").length;
    if (optionCount >= 4) return; // Maximum 4 options

    const optionHTML = `
      <div class="option-input flex items-center gap-3 mb-3 p-4 rounded-lg">
        <input type="text" class="option flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
          placeholder="Enter option" />
        <div class="custom-radio">
          <input type="radio" name="newCorrectAnswer" value="${optionCount}" />
          <span class="radio-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        ${
          optionCount > 1
            ? `
          <button class="remove-option text-gray-400 hover:text-red-500 transition-colors">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        `
            : ""
        }
      </div>
    `;
    optionsContainer.insertAdjacentHTML("beforeend", optionHTML);

    // Update add option button visibility
    addOptionBtn.classList.toggle("hidden", optionCount + 1 >= 4);

    // Regroup radio buttons after adding new option
    regroupRadioButtons(optionsContainer, "newCorrectAnswer");
  }

  // Clear form and add initial options
  function clearForm() {
    document.getElementById("newQuestion").value = "";
    optionsContainer.innerHTML = "";
    // errorContainer.classList.add("hidden");

    // Add only one set of initial options
    addOptionInput();
    addOptionInput();

    // Ensure radio buttons are properly grouped
    const radioButtons = optionsContainer.querySelectorAll(
      'input[type="radio"]'
    );
    radioButtons.forEach((radio) => {
      radio.name = "newCorrectAnswer"; // Ensure all radios share the same name
    });
  }

  // Add button handlers
  if (createModal) {
    // Close and Cancel buttons
    createModal.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        createModal.classList.add("hidden");
        clearForm();
      });
    });

    // Add option button
    if (addOptionBtn) {
      addOptionBtn.addEventListener("click", addOptionInput);
    }

    // Remove option buttons
    optionsContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".remove-option");
      if (removeBtn) {
        const optionsCount =
          optionsContainer.querySelectorAll(".option-input").length;
        if (optionsCount > 2) {
          removeBtn.closest(".option-input").remove();
          addOptionBtn.classList.toggle("hidden", optionsCount - 1 >= 4);
          // Regroup remaining radio buttons
          regroupRadioButtons(optionsContainer, "newCorrectAnswer");
        }
      }
    });

    // Save button
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const questionData = validateNewQuestion();
        if (!questionData) return;

        const questions = getQuestionsFromLocalStorage();
        const currentLevel = getCurrentLevel();
        const category = getCurrentCategory();

        // Ensure the structure exists
        if (!questions[currentLevel].categories[category]) {
          questions[currentLevel].categories[category] = [];
        }

        // Add new question
        questions[currentLevel].categories[category].push(questionData);
        saveQuestionsToLocalStorage(questions);

        // Show create toast (green)
        showToast(
          `Question "${questionData.question}" successfully created`,
          TOAST_TYPES.CREATE
        );

        // Re-render and close modal
        renderQuestion(currentLevel, getCurrentTabIndex(), category);
        createModal.classList.add("hidden");
        clearForm();
      });
    }
  }

  // Initialize the form
  clearForm();

  // Add radio change handler to the container
  optionsContainer.addEventListener("change", (e) => {
    if (e.target.type === "radio") {
      // Unselect all other radio buttons
      optionsContainer
        .querySelectorAll('input[type="radio"]')
        .forEach((radio) => {
          if (radio !== e.target) {
            radio.checked = false;
          }
        });

      // Update correct answer styling
      optionsContainer.querySelectorAll(".option-input").forEach((div) => {
        div.classList.remove("is-correct");
      });
      e.target.closest(".option-input").classList.add("is-correct");
    }
  });
}

function validateNewQuestion() {
  const questionInput = document.getElementById("newQuestion");
  const optionsContainer = document.getElementById("newOptionsContainer");

  const question = questionInput.value.trim();
  const options = Array.from(optionsContainer.querySelectorAll(".option")).map(
    (input) => input.value.trim()
  );
  const selectedAnswer = optionsContainer.querySelector(
    'input[name="newCorrectAnswer"]:checked'
  );

  if (!question) {
    showToast("Please enter a question", TOAST_TYPES.ERROR);
    return null;
  }

  if (options.length < 2) {
    showToast("Please provide at least 2 options", TOAST_TYPES.ERROR);
    return null;
  }

  if (options.some((opt) => !opt)) {
    showToast("Please fill in all options", TOAST_TYPES.ERROR);
    return null;
  }

  if (!selectedAnswer) {
    showToast("Please select the correct answer", TOAST_TYPES.ERROR);
    return null;
  }

  return {
    question,
    options,
    answer: options[selectedAnswer.value],
  };
}

function addRadioHandlers(container) {
  container.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      container.querySelectorAll(".option-input").forEach((div) => {
        div.classList.remove("is-correct");
      });
      e.target.closest(".option-input").classList.add("is-correct");
    });
  });
}

function addQuestionEventListeners(level, category) {
  // Edit button handlers
  /**
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      const questions = getQuestionsFromLocalStorage();
      const question = questions[level].categories[category][index];

      // Populate edit modal with question data
      document.getElementById("question").value = question.question;
      populateOptionsContainer(question.options, question.answer);

      // Show edit modal
      document.getElementById("editModal").classList.remove("hidden");
    });
  });
  */
  document.querySelectorAll(".edit-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      window.handleEdit(index, getCurrentLevel(), getCurrentCategory());
    });
  });
  // Delete button handlers
  document.querySelectorAll(".delete-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      handleDelete(index, getCurrentLevel(), getCurrentCategory());
    });
  });

  // Close buttons for modals
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (modal.id === "createModal") {
        clearForm(); // Clear create form
      }
      modal.classList.add("hidden");
    });
  });

  // Confirm delete handler
  document.getElementById("confirmDelete").addEventListener("click", () => {
    const btn = document.getElementById("confirmDelete");
    const index = parseInt(btn.dataset.index);
    const level = parseInt(btn.dataset.level);
    const category = btn.dataset.category;
    handleDelete(index, level, category);
  });
}

function populateOptionsContainer(options, correctAnswer) {
  const container = document.getElementById("optionsContainer");
  container.innerHTML = options
    .map(
      (option, index) => `
    <div class="option-input flex items-center gap-2 mb-2">
      <input type="text" value="${option}"
        class="option flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Enter option" />
      <input type="radio" name="correctAnswer" value="${index}" ${
        option === correctAnswer ? "checked" : ""
      } />
      <button class="remove-option text-red-500 hover:text-red-700">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
    )
    .join("");
}

// Add these handler functions
function handlePreview(index) {
  const previewModal = document.getElementById("previewModal");
  previewModal.classList.remove("hidden");
  // ... rest of preview logic
}

function handleDelete(index) {
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.classList.remove("hidden");
  // ... rest of delete logic
}

function initializeDeleteHandler() {
  const deleteModal = document.getElementById("deleteModal");
  const confirmDelete = document.getElementById("confirmDelete");

  if (deleteModal) {
    // Close and Cancel buttons
    deleteModal.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteModal.classList.add("hidden");
      });
    });

    // Confirm delete button
    if (confirmDelete) {
      confirmDelete.addEventListener("click", () => {
        // Get stored data attributes
        const index = parseInt(confirmDelete.getAttribute("data-index"));
        const level = parseInt(confirmDelete.getAttribute("data-level"));
        const category = confirmDelete.getAttribute("data-category");

        // Debug log to verify values
        console.log("Attempting to delete:", { index, level, category });

        // Validate that we have all required values
        if (isNaN(index) || isNaN(level) || !category) {
          console.error("Missing required delete parameters:", {
            index,
            level,
            category,
          });
          return;
        }

        try {
          // Get questions
          const questions = getQuestionsFromLocalStorage();

          // Validate the structure exists
          if (!questions[level]?.categories?.[category]) {
            throw new Error("Invalid question structure");
          }

          // Remove question
          questions[level].categories[category].splice(index, 1);

          // Save updated questions
          saveQuestionsToLocalStorage(questions);

          // Re-render questions
          renderQuestion(level, getCurrentTabIndex(), category);

          // Close modal
          deleteModal.classList.add("hidden");
        } catch (error) {
          console.error("Error during deletion:", error);
        }
      });
    }
  }
}

// Helper function to ensure we always get a valid questions structure
function getQuestionsFromLocalStorage() {
  const questions = localStorage.getItem("questions");
  if (!questions) {
    // Return default structure if localStorage is empty
    const defaultStructure = Array(6)
      .fill()
      .map(() => ({
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      }));
    localStorage.setItem("questions", JSON.stringify(defaultStructure));
    return defaultStructure;
  }
  return JSON.parse(questions);
}

// Helper function to get current tab index
function getCurrentTabIndex() {
  const tabs = document.querySelectorAll("#questions-section .tab");
  const activeTab = document.querySelector("#questions-section .tab.active");
  if (!activeTab) return 0;

  const index = Array.from(tabs).indexOf(activeTab);
  return index !== -1 ? index : 0;
}

// Helper function to validate question data
function validateQuestionData(data) {
  if (!data.question.trim()) {
    showError("Question text is required");
    return false;
  }
  if (data.options.length < 2 || data.options.length > 4) {
    showError("Questions must have between 2 and 4 options");
    return false;
  }
  if (data.options.some((opt) => !opt.trim())) {
    showError("All options must be filled");
    return false;
  }
  if (!data.answer) {
    showError("Please select a correct answer");
    return false;
  }
  return true;
}

// Add this function to create and show toasts
function showToast(message, type = TOAST_TYPES.CREATE) {
  const toastContainer =
    document.getElementById("toast-container") || createToastContainer();

  const toast = document.createElement("div");
  toast.className = `fixed right-0 transform translate-x-full transition-all duration-300 ease-in-out 
    flex items-center gap-3 p-4 rounded-l-lg shadow-lg max-w-sm mt-16 mr-0 z-50 ${getToastStyles(
      type
    )}`;

  const icon = getToastIcon(type);

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <p class="flex-1 text-sm font-medium">${message}</p>
  `;

  toastContainer.appendChild(toast);

  // Trigger entrance animation
  setTimeout(() => {
    toast.classList.remove("translate-x-full");
    toast.classList.add("translate-x-0");
  }, 100);

  // Remove toast after delay
  setTimeout(() => {
    toast.classList.remove("translate-x-0");
    toast.classList.add("translate-x-full");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "fixed top-0 right-0 flex flex-col gap-2 p-4 z-50";
  document.body.appendChild(container);
  return container;
}

function getToastStyles(type) {
  switch (type) {
    case TOAST_TYPES.CREATE:
      return "bg-green-50 text-green-700 border-l-4 border-green-500";
    case TOAST_TYPES.UPDATE:
      return "bg-blue-50 text-blue-700 border-l-4 border-blue-500";
    case TOAST_TYPES.DELETE:
      return "bg-red-50 text-red-700 border-l-4 border-red-500";
    case TOAST_TYPES.ERROR:
      return "bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500";
    default:
      return "bg-gray-50 text-gray-700 border-l-4 border-gray-500";
  }
}

function getToastIcon(type) {
  switch (type) {
    case TOAST_TYPES.CREATE:
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>`;
    case TOAST_TYPES.UPDATE:
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>`;
    case TOAST_TYPES.DELETE:
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>`;
    case TOAST_TYPES.ERROR:
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>`;
  }
}

// Add this new helper function to regroup radio buttons
function regroupRadioButtons(container, groupName) {
  const radioButtons = container.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((radio, index) => {
    radio.name = groupName;
    radio.value = index;
  });
}

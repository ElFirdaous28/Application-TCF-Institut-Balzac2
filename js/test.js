const tabs = document.querySelectorAll("#questions-section .tab");
const contentContainer = document.querySelector(
  "#questions-section .content-container"
);

let questions = [];
let filtered_questions = [];

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
    ];
    localStorage.setItem("questions", JSON.stringify(initialStructure));
  }

  // Load questions from localStorage and render initial view
  renderQuestion(0, 0, "Grammaire");

  // Initialize all modal handlers
  initializeModalHandlers();
});

function initializeModalHandlers() {
  // Debug helper
  function checkElement(id, context) {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Missing element: #${id} (${context})`);
      return null;
    }
    return element;
  }

  // Validate question data
  function validateQuestionData(question, options, answer) {
    if (!question.trim()) {
      showError("Question text is required");
      return false;
    }
    if (options.length < 2 || options.length > 4) {
      showError("Questions must have between 2 and 4 options");
      return false;
    }
    if (options.some((opt) => !opt.trim())) {
      showError("All options must be filled");
      return false;
    }
    if (!answer) {
      showError("Please select a correct answer");
      return false;
    }
    return true;
  }

  // Add new option to container
  function addOptionToContainer(container, isNewQuestion = false) {
    const optionsCount = container.querySelectorAll(".option-input").length;
    if (optionsCount >= 4) return;

    const radioName = isNewQuestion ? "newCorrectAnswer" : "correctAnswer";
    const newOption = document.createElement("div");
    newOption.className = "option-input flex items-center gap-2 mb-2";
    newOption.innerHTML = `
      <input type="text" class="option flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" 
        placeholder="Enter option" />
      <input type="radio" name="${radioName}" value="${optionsCount}" />
      ${
        optionsCount > 1
          ? `
        <button class="remove-option text-gray-400 hover:text-red-500">
          <i class="fas fa-trash-alt"></i>
        </button>
      `
          : ""
      }
    `;

    container.appendChild(newOption);
    updateAddOptionButtonVisibility(container);
  }

  // Update add option button visibility
  function updateAddOptionButtonVisibility(container) {
    const modal = container.closest(".modal");
    const addButton = modal.querySelector('[id^="addOption"]');
    if (addButton) {
      addButton.classList.toggle(
        "hidden",
        container.querySelectorAll(".option-input").length >= 4
      );
    }
  }

  // Initialize create modal
  const createModal = checkElement("createModal", "Create modal");
  const newOptionsContainer = checkElement(
    "newOptionsContainer",
    "New options container"
  );
  const addOptionButton = checkElement("addOptionButton", "Add option button");
  const saveNewQuestion = checkElement(
    "saveNewQuestion",
    "Save new question button"
  );

  if (
    createModal &&
    newOptionsContainer &&
    addOptionButton &&
    saveNewQuestion
  ) {
    // Add initial options when opening create modal
    document.getElementById("addQuestionBtn")?.addEventListener("click", () => {
      newOptionsContainer.innerHTML = "";
      addOptionToContainer(newOptionsContainer, true);
      addOptionToContainer(newOptionsContainer, true);
      createModal.classList.remove("hidden");
    });
    // Add option button handler
    addOptionButton.addEventListener("click", () => {
      addOptionToContainer(newOptionsContainer, true);
    });

    // Save new question handler
    saveNewQuestion.addEventListener("click", () => {
      const questionText = document.getElementById("newQuestion").value;
      const options = [...newOptionsContainer.querySelectorAll(".option")].map(
        (input) => input.value.trim()
      );
      const selectedRadio = newOptionsContainer.querySelector(
        'input[name="newCorrectAnswer"]:checked'
      );
      const answer = selectedRadio ? options[selectedRadio.value] : null;

      if (validateQuestionData(questionText, options, answer)) {
        const level = getCurrentLevel();
        const category = getCurrentCategory();
        const questions = getQuestionsFromLocalStorage();

        questions[level].categories[category].push({
          question: questionText,
          options: options,
          answer: answer,
        });

        saveQuestionsToLocalStorage(questions);
        renderQuestion(level, getCurrentTabIndex(), category);
        createModal.classList.add("hidden");
        document.getElementById("newQuestion").value = "";
      }
    });
  }

  // Initialize edit modal
  const editModal = checkElement("editModal", "Edit modal");
  const optionsContainer = checkElement(
    "optionsContainer",
    "Options container"
  );
  const addEditOption = checkElement("addEditOption", "Add edit option button");
  const saveChanges = checkElement("saveChanges", "Save changes button");

  if (editModal && optionsContainer && addEditOption && saveChanges) {
    // Add option button handler
    addEditOption.addEventListener("click", () => {
      addOptionToContainer(optionsContainer);
    });

    // Save changes handler
    saveChanges.addEventListener("click", () => {
      const editModal = document.getElementById("editModal");
      const index = parseInt(editModal.dataset.index);
      const level = parseInt(editModal.dataset.level);
      const category = editModal.dataset.category;

      const questionText = document.getElementById("question").value.trim();
      const optionsContainer = document.getElementById("optionsContainer");
      const options = [...optionsContainer.querySelectorAll(".option")].map(
        (input) => input.value.trim()
      );
      const selectedRadio = optionsContainer.querySelector(
        'input[name="correctAnswer"]:checked'
      );

      if (
        validateQuestionData(
          questionText,
          options,
          selectedRadio ? options[selectedRadio.value] : null
        )
      ) {
        const answer = options[selectedRadio.value];

        // Update storage
        const questions = getQuestionsFromLocalStorage();
        questions[level].categories[category][index] = {
          question: questionText,
          options: options,
          answer: answer,
        };
        saveQuestionsToLocalStorage(questions);

        // Update DOM
        renderQuestion(level, getCurrentTabIndex(), category);

        // Close modal
        editModal.classList.add("hidden");
      }
    });
  }

  // Remove option handler (for both modals)
  document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-option");
    if (removeBtn) {
      const container = removeBtn.closest(".options-container");
      if (container.querySelectorAll(".option-input").length > 2) {
        removeBtn.closest(".option-input").remove();
        updateAddOptionButtonVisibility(container);

        // Update radio button values
        container
          .querySelectorAll('input[type="radio"]')
          .forEach((radio, index) => {
            radio.value = index;
          });
      }
    }
  });

  // Close buttons for all modals
  document.querySelectorAll(".modal .close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      modal.classList.add("hidden");
      if (modal.id === "createModal") {
        document.getElementById("newQuestion").value = "";
        newOptionsContainer.innerHTML = "";
      }
    });
  });

  // Edit modal handler
  window.handleEdit = function (index) {
    const editModal = document.getElementById("editModal");
    const level = getCurrentLevel();
    const category = getCurrentCategory();

    // Get current question data
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
    const optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";

    questionData.options.forEach((option, idx) => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "option-input flex items-center gap-2 mb-2";
      optionDiv.innerHTML = `
        <input type="text" value="${option}"
          class="option flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter option" />
        <input type="radio" name="correctAnswer" value="${idx}" ${
        option === questionData.answer ? "checked" : ""
      } />
        ${
          questionData.options.length > 2
            ? `
          <button class="remove-option text-gray-400 hover:text-red-500">
            <i class="fas fa-trash-alt"></i>
          </button>
        `
            : ""
        }
      `;
      optionsContainer.appendChild(optionDiv);
    });

    // Update add option button visibility
    const addEditOption = document.getElementById("addEditOption");
    addEditOption.classList.toggle("hidden", questionData.options.length >= 4);

    // Show modal
    editModal.classList.remove("hidden");
  };

  // Preview modal handler
  window.handlePreview = function (index) {
    const previewModal = document.getElementById("previewModal");
    const level = getCurrentLevel();
    const category = getCurrentCategory();
    const questions = getQuestionsFromLocalStorage();
    const question = questions[level].categories[category][index];

    // ... rest of preview modal code ...
  };

  // Delete modal handler
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
      questions[level].categories[category].splice(index, 1);
      saveQuestionsToLocalStorage(questions);

      renderQuestion(level, getCurrentTabIndex(), category);
      document.getElementById("deleteModal").classList.add("hidden");
    });
  }
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
  const levelButtons = document.querySelectorAll(".level-btn");
  return Array.from(levelButtons).indexOf(activeLevel);
}

function getCurrentCategory() {
  return (
    document
      .querySelector("#questions-section .tab.active")
      ?.textContent.trim() || "Grammaire"
  );
}

function getCurrentTabIndex() {
  return Array.from(
    document.querySelectorAll("#questions-section .tab")
  ).findIndex((tab) => tab.classList.contains("active"));
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
    const currentLevel = getCurrentLevel(); // Get the current selected level
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
    const currentTab = Array.from(tabs).findIndex((tab) =>
      tab.classList.contains("active")
    );
    const category = getCurrentCategory();

    // Update current level and re-render
    renderQuestion(index, currentTab, category);
  });
});

function renderQuestion(level, tab_index, category) {
  const questions = getQuestionsFromLocalStorage();
  const categoryQuestions = questions[level].categories[category];

  // Clear existing content
  contentContainer.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">${category}</h2>
        <p class="text-sm text-gray-500">Level ${level + 1} • ${
    categoryQuestions.length
  } questions</p>
      </div>
      <button id="addQuestionBtn" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
        <i class="fas fa-plus"></i>
        Add Question
      </button>
    </div>
  `;

  // Render each question
  categoryQuestions.forEach((question, index) => {
    const questionHTML = `
      <div id="q-${index}" class="bg-white rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-all duration-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-4">${
              question.question
            }</h3>
            <div class="space-y-2">
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
          </div>
          
          <div class="flex items-start space-x-2">
            <button onclick="handlePreview(${index}, ${level}, '${category}')" 
              class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="handleEdit(${index}, ${level}, '${category}')" 
              class="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all duration-200">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="handleDelete(${index}, ${level}, '${category}')" 
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    contentContainer.innerHTML += questionHTML;
  });

  // Add event listener for the Add Question button
  document.getElementById("addQuestionBtn").addEventListener("click", () => {
    const createModal = document.getElementById("createModal");
    createModal.classList.remove("hidden");
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
}

// Helper functions
function getQuestionsFromLocalStorage() {
  const questions = localStorage.getItem("questions");
  if (!questions) {
    // Return default structure if localStorage is empty
    return [
      {
        categories: {
          Grammaire: [],
          Compréhension: [],
          Vocabulaire: [],
        },
      },
    ];
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
      editQuestion(index, level, category);
    });
  });

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      deleteQuestion(index, level, category);
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
            (option, i) => `
          <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="radio" name="preview-answer" class="w-4 h-4 text-purple-600" ${
              option === question.answer ? "checked" : ""
            }>
            <span class="text-gray-700">${option}</span>
            ${
              option === question.answer
                ? `
              <span class="ml-auto flex items-center gap-1 text-green-600 text-sm">
                <i class="fas fa-check-circle"></i>
                Correct Answer
              </span>
            `
                : ""
            }
          </label>
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
  const level = getCurrentLevel(); // Get the current level
  const category = getCurrentCategory(); // Get the current category

  // Get current question data
  const questions = getQuestionsFromLocalStorage();
  const questionData = questions[level].categories[category][index];

  if (!questionData) {
    console.error("Question not found");
    return;
  }

  // Store metadata for save operation
  editModal.dataset.index = index; // Store the index for later use
  editModal.dataset.level = level; // Store the level
  editModal.dataset.category = category; // Store the category

  // Populate question text
  const questionTextarea = document.getElementById("question");
  questionTextarea.value = questionData.question; // Set the question text

  // Clear and populate options container
  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = ""; // Clear existing options

  questionData.options.forEach((option, idx) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "option-input flex items-center gap-2 mb-2";
    optionDiv.innerHTML = `
      <input type="text" value="${option}"
        class="option flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Enter option" />
      <input type="radio" name="correctAnswer" value="${idx}" ${
      option === questionData.answer ? "checked" : ""
    } />
      <button class="remove-option text-red-500 hover:text-red-700">
        <i class="fas fa-times"></i>
      </button>
    `;
    optionsContainer.appendChild(optionDiv);
  });

  // Show modal
  editModal.classList.remove("hidden");
}

function handleDelete(index, level, category) {
  const deleteModal = document.getElementById("deleteModal");
  const confirmDelete = document.getElementById("confirmDelete");

  // Store data for delete operation
  confirmDelete.dataset.index = index;
  confirmDelete.dataset.level = level;
  confirmDelete.dataset.category = category;

  deleteModal.classList.remove("hidden");
}

function generateQuestionHTML(question, index) {
  return `
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-4">
          <div class="bg-purple-100 p-2 rounded-lg">
            <i class="fas fa-question text-purple-500"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900">${
            question.question
          }</h3>
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
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="flex items-start space-x-2">
        <button onclick="handlePreview(${index})" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200" title="Preview">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="handleEdit(${index})" class="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all duration-200" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="handleDelete(${index})" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200" title="Delete">
          <i class="fas fa-trash-alt"></i>
        </button>
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

  // Initialize with 2 default option inputs
  function addOptionInput() {
    const optionCount =
      optionsContainer.querySelectorAll(".option-input").length;
    const optionInput = document.createElement("div");
    optionInput.classList.add("option-input", "flex", "items-center", "gap-2");
    optionInput.innerHTML = `
            <div class="flex-1 flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                <input type="text" 
                    class="new-option flex-1 bg-transparent focus:outline-none" 
                    placeholder="Enter option ${optionCount + 1}" />
                <div class="flex items-center gap-2">
                    <label class="flex items-center gap-1 text-sm text-gray-600">
                        <input type="radio" 
                            name="newCorrectAnswer" 
                            value="${optionCount}"
                            class="text-purple-500 focus:ring-purple-500" />
                        Correct
                    </label>
                    ${
                      optionCount > 1
                        ? `
                        <button class="remove-option text-gray-400 hover:text-red-500">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
    optionsContainer.appendChild(optionInput);

    // Add remove button handler
    const removeBtn = optionInput.querySelector(".remove-option");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        if (optionsContainer.querySelectorAll(".option-input").length > 2) {
          optionInput.remove();
          updateOptionLabels();
        }
      });
    }
  }

  function updateOptionLabels() {
    optionsContainer.querySelectorAll(".new-option").forEach((input, index) => {
      input.placeholder = `Enter option ${index + 1}`;
    });
  }

  function clearForm() {
    document.getElementById("newQuestion").value = "";
    optionsContainer.innerHTML = "";
    errorContainer.textContent = "";
    // Add two default options
    addOptionInput();
    addOptionInput();
  }

  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");
  }

  function validateInputs() {
    const questionText = document.getElementById("newQuestion").value.trim();
    const options = Array.from(optionsContainer.querySelectorAll(".new-option"))
      .map((input) => input.value.trim())
      .filter(Boolean);
    const selectedAnswer = document.querySelector(
      'input[name="newCorrectAnswer"]:checked'
    );

    // Clear previous errors
    errorContainer.textContent = "";

    if (!questionText) {
      showError("Please enter a question");
      return null;
    }

    if (options.length < 2) {
      showError("Please provide at least 2 options");
      return null;
    }

    if (options.some((option) => !option)) {
      showError("Please fill in all options");
      return null;
    }

    if (!selectedAnswer) {
      showError("Please select the correct answer");
      return null;
    }

    const correctAnswer = options[selectedAnswer.value];

    return {
      id: Date.now(),
      question: questionText,
      options: options,
      answer: correctAnswer,
    };
  }

  // Event Listeners
  addOptionBtn.addEventListener("click", () => {
    addOptionInput();
  });

  saveBtn.addEventListener("click", () => {
    const newQuestion = validateInputs();
    if (!newQuestion) return;

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
    createModal.classList.add("hidden");
    clearForm();
  });

  // Initialize form with default options
  clearForm();
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
      handleEdit(index); // Pass the index of the question
    });
  });
  // Delete button handlers
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);

      // Store the index for use when confirming deletion
      document.getElementById("confirmDelete").dataset.index = index;

      // Show delete modal
      document.getElementById("deleteModal").classList.remove("hidden");
    });
  });

  // Close buttons for modals
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").classList.add("hidden");
    });
  });

  // Confirm delete handler
  document.getElementById("confirmDelete").addEventListener("click", () => {
    const index = parseInt(
      document.getElementById("confirmDelete").dataset.index
    );
    const questions = getQuestionsFromLocalStorage();

    // Remove the question
    questions[level].categories[category].splice(index, 1);
    saveQuestionsToLocalStorage(questions);

    // Re-render and hide modal
    renderQuestion(
      level,
      Array.from(tabs).findIndex((tab) => tab.classList.contains("active")),
      category
    );
    document.getElementById("deleteModal").classList.add("hidden");
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
  const confirmDelete = document.getElementById("confirmDelete");
  if (confirmDelete) {
    confirmDelete.addEventListener("click", () => {
      const index = parseInt(confirmDelete.dataset.index);
      const level = parseInt(confirmDelete.dataset.level);
      const category = confirmDelete.dataset.category;

      // Get questions
      const questions = getQuestionsFromLocalStorage();

      // Remove question
      questions[level].categories[category].splice(index, 1);

      // Save updated questions
      saveQuestionsToLocalStorage(questions);

      // Re-render questions
      renderQuestion(level, getCurrentTabIndex(), category);

      // Close modal
      document.getElementById("deleteModal").classList.add("hidden");
    });
  }
}

// Helper function to get current tab index
function getCurrentTabIndex() {
  const tabs = document.querySelectorAll(".tab");
  return Array.from(tabs).findIndex((tab) => tab.classList.contains("active"));
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

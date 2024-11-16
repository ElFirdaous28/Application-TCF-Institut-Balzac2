const tabs = document.querySelectorAll('.tab');
const contentContainer = document.querySelector('.content-container');
let questions = [];

// Load questions from JSON file
async function loadData() {
    const response = await fetch('../questions.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Initialize the application
async function init() {
    try {
        questions = await loadData();
        console.log(questions);
        localStorage.setItem('questions', JSON.stringify(questions));
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render questions based on selected tab
function renderQuestion(level, tabIndex, category) {
    let filteredQuestions = getFilteredQuestions(level, tabIndex);
    contentContainer.innerHTML = '';

    contentContainer.innerHTML += `
        <div class="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">${category} (${filteredQuestions.length} questions)</h2>
            </div>
            <div class="space-y-4">`;

    filteredQuestions.forEach((question, index) => {
        const optionsContainer = createQuestionContainer(question, index);
        contentContainer.innerHTML += optionsContainer;
    });

    handleEventListeners(level, category);
}

// Get filtered questions based on the selected tab
function getFilteredQuestions(level, tabIndex) {
    if (tabIndex === 0) return questions[level].categories.Grammaire;
    if (tabIndex === 1) return questions[level].categories.Compréhension;
    return questions[level].categories.Vocabulaire;
}

// Create HTML for a question container
function createQuestionContainer(question, index) {
    return `
        <div id="q-${index}" class="question-container bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-grip-vertical text-gray-400"></i>
                    <span class="text-sm font-medium">Multiple Choice</span>
                </div>
                <div class="flex justify-end space-x-2 mt-2">  
                    <i id="preview-${index}" class="previewQuestionBtn fas fa-eye text-gray-400 cursor-pointer"></i>
                    <i id="edit-${index}" class="editQuestionBtn fas fa-pen text-gray-400 cursor-pointer"></i>
                    <i id="delete-${index}" class="deleteQuestionBtn fas fa-trash text-gray-400 cursor-pointer"></i>
                </div>
            </div>
            <div class="mb-2">
                <p class="text-sm font-medium">${question.question}</p>
                <p class="text-sm text-gray-500">Answer choices</p>
            </div>
            <div class="space-y-1">${createOptionsHTML(question.options, question.answer)}</div>
        </div>`;
}

// Create HTML for the answer options
function createOptionsHTML(options, correctAnswer) {
    return options.map(answer => {
        const isCorrect = answer === correctAnswer;
        return `
            <div class="flex items-center space-x-2">
                <i class="fas ${isCorrect ? 'fa-check text-green-500' : 'fa-times text-red-500'}"></i>
                <span class="text-sm">${answer}</span>
            </div>`;
    }).join('');
}

// Handle tab clicks
function setupTabListeners() {
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
            contentContainer.innerHTML = '';
            tabs.forEach(t => t.classList.remove('active', 'border-blue-500', 'text-blue-500'));
            e.target.classList.add('active', 'border-blue-500', 'text-blue-500');
            const category = getCategoryByIndex(index);
            renderQuestion(0, index, category);
        });
    });
}

// Get category name by index
function getCategoryByIndex(index) {
    if (index === 0) return 'Grammaire';
    if (index === 1) return 'Compréhension';
    return 'Vocabulaire';
}

// Handle event listeners for CRUD operations
function handleEventListeners(level, category) {
    const previewBtns = document.querySelectorAll('.previewQuestionBtn');
    const editBtns = document.querySelectorAll('.editQuestionBtn');
    const deleteBtns = document.querySelectorAll('.deleteQuestionBtn');

    previewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const questionId = e.target.id.slice(-1);
            const question = getFilteredQuestions(level, category)[questionId];
            displayPreview(question);
        });
    });

    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentEditingIndex = e.target.id.slice(-1);
            openEditModal(currentEditingIndex);
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentDeletingIndex = e.target.id.slice(-1);
            openDeleteModal(currentDeletingIndex);
        });
    });
}

// Display question preview
function displayPreview(question) {
    const optionsList = question.options.map(option => 
        option === question.answer ? `${option} (Correct)` : option
    ).join(', ');
    alert(`Question: ${question.question}\nOptions: ${optionsList}`);
}

// Open edit modal and populate fields
function openEditModal(index) {
    const question = getFilteredQuestions(0, 0)[index]; // Adjust level and tab index as needed
    document.getElementById('question').value = question.question;
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = ''; // Clear existing options

    question.options.forEach((option, idx) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option-input');
        optionDiv.innerHTML = `
            <input type="text" class="option" value="${option}" placeholder="Enter option" />
            <input type="radio" name="correctAnswer" value="${idx}" ${option === question.answer ? 'checked' : ''} />
        `;
        optionsContainer.appendChild(optionDiv);
    });

    document.getElementById('editModal').classList.remove('hidden');
}

// Open delete confirmation modal
function openDeleteModal(index) {
    document.getElementById('deleteModal').classList.remove('hidden');
    document.getElementById('confirmDelete').onclick = () => confirmDelete(index);
}

// Confirm delete action
function confirmDelete(index) {
    const filteredQuestions = getFilteredQuestions(0, 0); // Adjust level and tab index as needed
    filteredQuestions.splice(index, 1);
    renderQuestion(0, 0, getCategoryByIndex(0)); // Refresh the question list
    document.getElementById('deleteModal').classList.add('hidden');
}

// Save changes made in the edit modal
document.getElementById('saveChanges').addEventListener('click', () => {
    const updatedQuestion = document.getElementById('question').value;
    const options = Array.from(document.querySelectorAll('.option')).map(optionInput => optionInput.value);
    const correctAnswerIndex = Array.from(document.querySelectorAll('input[name="correctAnswer"]')).findIndex(radio => radio.checked);

    if (currentEditingIndex !== null) {
        const filteredQuestions = getFilteredQuestions(0, 0); // Adjust level and tab index as needed
        filteredQuestions[currentEditingIndex].question = updatedQuestion;
        filteredQuestions[currentEditingIndex].options = options;
        filteredQuestions[currentEditingIndex].answer = options[correctAnswerIndex];

        renderQuestion(0, 0, getCategoryByIndex(0)); // Refresh the question list
        document.getElementById('editModal').classList.add('hidden');
    }
});

// Initialize the application
init();
setupTabListeners();
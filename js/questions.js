
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.content');
const contentContainer = document.querySelector('.content-container');

let  questions = []
async function loadData() {
    const response = await fetch('../questions.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data; 
}

async function init() {
    try {
        questions = await loadData(); 
        // questions = getRandomQuestions(questions, numberOfQuestions);
        console.log(questions);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

init();


function renderQuestion(level, tab_index, category) {
    console.log(category)
    filtered_questions = []

    if (tab_index == 0)
        filtered_questions = questions[level].categories.Grammaire;
    else if (tab_index == 1)
        filtered_questions = questions[level].categories.Compréhension;
    else 
        filtered_questions = questions[level].categories.Vocabulaire;
            contentContainer.innerHTML = `` 
            contentContainer.innerHTML += `    
            <div class="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">${category} ${questions.length} questions</h2>
                <span class="text-gray-500">(3 points)</span>
            </div>
            <div class="space-y-4">`
            filtered_questions.forEach((question, index) => {
                // console.log(`index: ${filtered_questions.indexOf(question)}`)
                // console.log(`hadak: ${index}`)
                contentContainer.innerHTML += `
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
                <div class="space-y-1">`
                question.options.forEach(answer => {
                    let answerDiv = document.createElement('div')
                    answerDiv.classList.add('flex',  'items-center', 'space-x-2');
                    // console.log(`${answer} || ${question.answer}`);
                    if (answer == question.answer)
                        answerDiv.innerHTML = `<i class="fas fa-check text-green-500"></i><span>`;
                    else 
                        answerDiv.innerHTML = `<i class="fas fa-times text-red-500"></i><span>`;
                    answerDiv.innerHTML += `<span class="text-sm">${answer}</span>`;
                    document.querySelector(`#q-${index}`).appendChild(answerDiv);
                })

                contentContainer.innerHTML += `</div>`;
            });
            handleEventListeners(level, category);
}


tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
        console.log(index)
        contentContainer.innerHTML = ''
        tabs.forEach(t => t.classList.remove('active', 'border-blue-500', 'text-blue-500'));
        e.target.classList.add('active', 'border-blue-500', 'text-blue-500');
        category = ''
        if (index == 0) 
            category = 'Grammaire'
        else if (index == 1) 
            category = 'Compréhension'
        else
            category = 'Vocabulaire'
        renderQuestion(0, index, category);
    })
})


// CRUD Functionality & EventListener Handling

function handleEventListeners(level, category) {    
    const previewBtns = document.querySelectorAll('.previewQuestionBtn');
    const editBtns = document.querySelectorAll('.editQuestionBtn');
    const deleteBtns = document.querySelectorAll('.deleteQuestionBtn');
    
previewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const questionId = e.target.id.slice(-1);
        const question = filtered_questions[questionId];

        // Display the question and options in an alert or modal
        let optionsList = question.options.map(option => {
            return option === question.answer ? `${option} (Correct)` : option;
        }).join(', ');

        alert(`Question: ${question.question}\nOptions: ${optionsList}`);
    });
});    

/* Editing */
    
let currentEditingIndex = null;

editBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentEditingIndex = e.target.id.slice(-1);
        const question = filtered_questions[currentEditingIndex];

        // Populate the modal fields
        document.getElementById('question').value = question.question;
        document.getElementById('options').value = question.options.join(', ');

        // Show the modal
        document.getElementById('editModal').classList.remove('hidden');
    });
});

// Close modal
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('editModal').classList.add('hidden');
});

// Save changes
document.getElementById('saveChanges').addEventListener('click', () => {
    const updatedQuestion = document.getElementById('question').value;
    const updatedOptions = document.getElementById('options').value.split(',').map(option => option.trim());

    // Update the question object
    if (currentEditingIndex !== null) {
        filtered_questions[currentEditingIndex].question = updatedQuestion;
        filtered_questions[currentEditingIndex].options = updatedOptions;

        // Update the DOM directly
        const questionContainer = document.querySelector(`#q-${currentEditingIndex}`);
        questionContainer.querySelector('p').textContent = updatedQuestion;

        // Update options in the DOM
        const optionsContainer = questionContainer.querySelector('.space-y-1');
        optionsContainer.innerHTML = ''; // Clear existing options
        updatedOptions.forEach(answer => {
            let answerDiv = document.createElement('div');
            answerDiv.classList.add('flex', 'items-center', 'space-x-2');
            answerDiv.innerHTML = `<span class="text-sm">${answer}</span>`;
            optionsContainer.appendChild(answerDiv);
        });
    }

    // Close the modal
    document.getElementById('editModal').classList.add('hidden');
});

/* Deleting */


let currentDeletingIndex = null;

deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentDeletingIndex = e.target.id.slice(-1);
        
        // Show the delete confirmation modal
        document.getElementById('deleteModal').classList.remove('hidden');
    });
});

// Close delete modal
document.querySelector('#deleteModal .close-btn').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.add('hidden');
});

// Confirm delete
document.getElementById('confirmDelete').addEventListener('click', () => {
    if (currentDeletingIndex !== null) {
        // Remove the question from the array
        filtered_questions.splice(currentDeletingIndex, 1);
        console.log(filtered_questions);
        
        // Remove the question container from the DOM
        const questionContainer = document.querySelector(`#q-${currentDeletingIndex}`);
        if (questionContainer) {
            questionContainer.remove();
        }
    }

    // Close the delete modal
    document.getElementById('deleteModal').classList.add('hidden');
});

// Cancel delete action
document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.add('hidden');
});
}
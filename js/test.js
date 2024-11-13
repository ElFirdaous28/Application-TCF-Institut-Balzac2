
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
        console.log(questions)
        localStorage.setItem('questions', JSON.stringify(questions));
        // questions = getRandomQuestions(questions, numberOfQuestions);
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
                <h2 class="text-xl font-semibold">${category} (${questions.length} questions)</h2>
                
            </div>
            <div class="space-y-4">`
            filtered_questions.forEach((question, index) => {
                // console.log(`index: ${filtered_questions.indexOf(question)}`)
                // console.log(`hadak: ${index}`)
                optionsContainer = document.createElement('div')
                optionsContainer.classList.add('options-container')
                optionsContainer.id = `question-${index}`
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
                    optionsContainer.appendChild(answerDiv)
                })
                document.querySelector(`#q-${index}`).appendChild(optionsContainer);

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
/** 
editBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentEditingIndex = e.target.id.slice(-1);
        const question = filtered_questions[currentEditingIndex];
        let optionsContainer = document.querySelector(`#question-${currentEditingIndex}`)
        
        // Populate the modal fields
        document.getElementById('question').value = question.question;
        // optionsContainer.innerHTML = ''; 
        //         question.options.forEach((answer, index) => {
        //             let answerDiv = document.createElement('div')
        //             answerDiv.classList.add('flex',  'items-center', 'space-x-2');
        //             if (answer == question.answer)
        //                 answerDiv.innerHTML = `<i class="fas fa-check text-green-500"></i><span>`;
        //             else 
        //                 answerDiv.innerHTML = `<i class="fas fa-times text-red-500"></i><span>`;
        //             answerDiv.innerHTML += `<span class="text-sm">${answer}</span>`;
        //             optionsContainer.appendChild(answerDiv)
        //         })
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option-input');
            optionDiv.innerHTML = `
                <input type="text" class="option" value="${option}" placeholder="Enter option" />
                <input type="radio" name="correctAnswer" value="${index}" ${option === question.answer ? 'checked' : ''} />
            `;
            optionsContainer.appendChild(optionDiv);
        });

        // Show the modal
        document.getElementById('editModal').classList.remove('hidden');
    });
});
*/

editBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentEditingIndex = e.target.id.slice(-1);
        const question = filtered_questions[currentEditingIndex];

        // Populate the modal fields
        document.getElementById('question').value = question.question;
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = ''; // Clear existing options

        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option-input');
            optionDiv.innerHTML = `
                <input type="text" class="option" value="${option}" placeholder="Enter option" />
                <input type="radio" name="correctAnswer" value="${index}" ${option === question.answer ? 'checked' : ''} />
            `;
            optionsContainer.appendChild(optionDiv);
        });

        // Show the modal
        document.getElementById('editModal').classList.remove('hidden');

    });
});



// Save changes
document.getElementById('saveChanges').addEventListener('click', () => {
    const updatedQuestion = document.getElementById('question').value;
    const options = Array.from(document.querySelectorAll('.option')).map(optionInput => optionInput.value);
    console.log(options)
    
    // Get the selected correct answer
    const correctAnswerIndex = Array.from(document.querySelectorAll('input[name="correctAnswer"]')).findIndex(radio => radio.checked);
    
    // Update the question object
    if (currentEditingIndex !== null) {
        filtered_questions[currentEditingIndex].question = updatedQuestion;
        filtered_questions[currentEditingIndex].options = options;
        
        correctAnswer = options[correctAnswerIndex];
        filtered_questions[currentEditingIndex].answer = correctAnswer // Update correct answer
        console.log(`correct Answer: ${correctAnswer}`)

        // Update the DOM directly
        const questionContainer = document.querySelector(`#q-${currentEditingIndex}`);
        const optionsContainer = document.querySelector(`#question-${currentEditingIndex}`);
        questionContainer.querySelector('p').textContent = updatedQuestion;
        optionsContainer.innerHTML = ''

        options.forEach(answer => {
                    let answerDiv = document.createElement('div')
                    answerDiv.classList.add('flex',  'items-center', 'space-x-2');
                    // console.log(`${answer} || ${question.answer}`);
                    if (answer == correctAnswer)
                        answerDiv.innerHTML = `<i class="fas fa-check text-green-500"></i><span>`;
                    else 
                        answerDiv.innerHTML = `<i class="fas fa-times text-red-500"></i><span>`;
                    answerDiv.innerHTML += `<span class="text-sm">${answer}</span>`;
                    optionsContainer.appendChild(answerDiv)
                })

    }

    // Close the modal
    document.getElementById('editModal').classList.add('hidden');
});

// Close modal
document.querySelector('.close-btn').addEventListener('click', () => {
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


/* Creating */

function addQuestion(questionText, options, correctAnswerIndex) {
    // Create a new question object
    const newQuestion = {
        question: questionText,
        options: options,
        answer: options[correctAnswerIndex] // Store the correct answer as the option text
    };

    // Determine the current tab index (0 for Grammaire, 1 for Compréhension, 2 for Vocabulaire)
    const currentTabIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));

    // Add the new question to the appropriate category
    if (currentTabIndex === 0) {
        questions[0].categories.Grammaire.push(newQuestion);
    } else if (currentTabIndex === 1) {
        questions[0].categories.Compréhension.push(newQuestion);
    } else if (currentTabIndex === 2) {
        questions[0].categories.Vocabulaire.push(newQuestion);
    }

    // Update the DOM to show the new question
    renderQuestion(0, currentTabIndex, tabs[currentTabIndex].textContent);
}

// Add event listener to the "Add Question" button
document.querySelector('.bg-purple-500').addEventListener('click', () => {
    document.getElementById('createModal').classList.remove('hidden');
});

// Close the create modal
document.querySelector('#createModal .close-btn').addEventListener('click', () => {
    document.getElementById('createModal').classList.add('hidden');
});

// Add option functionality
document.getElementById('addOption').addEventListener('click', () => {
    const optionInput = document.createElement('div');
    optionInput.classList.add('option-input', 'flex', 'items-center', 'mt-2');
    optionInput.innerHTML = `
        <input type="text" class="option block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" placeholder="Enter option" />
        <input type="radio" name="newCorrectAnswer" value="${document.querySelectorAll('.option-input').length}" class="ml-2" />
        <button class="remove-option ml-2 text-red-500 hover:text-red-700">Remove</button>
    `;
    document.getElementById('newOptionsContainer').appendChild(optionInput);

    // Add event listener to the remove option button
    optionInput.querySelector('.remove-option').addEventListener('click', () => {
        optionInput.remove();
    });
});

// Save new question
document.getElementById('saveNewQuestion').addEventListener('click', () => {
    const questionText = document.getElementById('newQuestion').value;
    const options = Array.from(document.querySelectorAll('#newOptionsContainer .option')).map(optionInput => optionInput.value);
    const correctAnswerIndex = Array.from(document.querySelectorAll('input[name="newCorrectAnswer"]')).findIndex(radio => radio.checked);

    if (questionText && options.length > 0 && correctAnswerIndex !== -1) {
        addQuestion(questionText, options, correctAnswerIndex);
        
        // Clear the modal fields
        document.getElementById('newQuestion').value = '';
        document.getElementById('newOptionsContainer').innerHTML = `
            <label class="block text-sm font-medium text-gray-700">Options:</label>
            <div class="option-input flex items-center mt-2">
                <input type="text" class="option block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" placeholder="Enter option" />
                <input type="radio" name="newCorrectAnswer" value="0" class="ml-2" />
                <button class="remove-option ml-2 text-red-500 hover:text-red-700 hidden">Remove</button>
            </div>
        `;

        // Close the modal
        document.getElementById('createModal').classList.add('hidden');
    } else {
        alert('Please fill in all fields and select a correct answer.');
    }
});
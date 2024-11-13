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
        localStorage.setItem('questions', JSON.stringify(questions));
        // questions = getRandomQuestions(questions, numberOfQuestions);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

init();


const users = [
    {
        id: 'user1',
        username: 'user1',
        levels: [
            {
                level: 'A1',
                tentative: 0,
                date: Date.now(),
                noteNiveau: 10,
                GrammerCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 1, chosenAnswer: "est", time: 0 },
                        { questionId: 2, chosenAnswer: "suis", time: 0 },
                        { questionId: 3, chosenAnswer: "ont", time: 0 },
                        { questionId: 4, chosenAnswer: "allez", time: 0 },
                        { questionId: 5, chosenAnswer: "mangent", time: 0 }
                    ]
                },
                VocabulaireCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 6, chosenAnswer: "froid", time: 0 },
                        { questionId: 7, chosenAnswer: "adieu", time: 0 },
                        { questionId: 8, chosenAnswer: "grand", time: 0 },
                        { questionId: 9, chosenAnswer: "voiture", time: 0 },
                        { questionId: 10, chosenAnswer: "gros", time: 0 }
                    ]
                },
                ComprehensionCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 11, chosenAnswer: "salutation", time: 0 },
                        { questionId: 12, chosenAnswer: "voisin", time: 0 },
                        { questionId: 13, chosenAnswer: "écouter", time: 0 },
                        { questionId: 14, chosenAnswer: "bienvenue", time: 0 },
                        { questionId: 15, chosenAnswer: "manger", time: 0 }
                    ]
                }
            },
            {
                level: 'A2',
                tentative: 0,
                date: Date.now(),
                noteNiveau: 9,
                GrammerCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 16, chosenAnswer: "étais", time: 0 },
                        { questionId: 17, chosenAnswer: "finis", time: 0 },
                        { questionId: 18, chosenAnswer: "vais", time: 0 },
                        { questionId: 19, chosenAnswer: "mangent", time: 0 },
                        { questionId: 20, chosenAnswer: "faisons", time: 0 }
                    ]
                },
                VocabulaireCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 21, chosenAnswer: "froid", time: 0 },
                        { questionId: 22, chosenAnswer: "adieu", time: 0 },
                        { questionId: 23, chosenAnswer: "grand", time: 0 },
                        { questionId: 24, chosenAnswer: "voiture", time: 0 },
                        { questionId: 25, chosenAnswer: "gros", time: 0 }
                    ]
                },
                ComprehensionCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 26, chosenAnswer: "salutation", time: 0 },
                        { questionId: 27, chosenAnswer: "voisin", time: 0 },
                        { questionId: 28, chosenAnswer: "écouter", time: 0 },
                        { questionId: 29, chosenAnswer: "bienvenue", time: 0 },
                        { questionId: 30, chosenAnswer: "manger", time: 0 }
                    ]
                }
            },
            {
                level: 'B1',
                tentative: 0,
                date: Date.now(),
                noteNiveau: 0,
                GrammerCat: {
                    valide: false,
                    noteCat:0,
                    responses: []
                },
                VocabulaireCat: {
                    valide: false,
                    noteCat:0,
                    responses: []
                },
                ComprehensionCat: {
                    valide: false,
                    noteCat:0,
                    responses: []
                }
            },
        ]
    },
    {
        id: 'user2',
        username: 'ABC',
        levels: [
            {
                level: 'A1',
                tentative: 0,
                date: 0,
                noteNiveau: 0,
                GrammerCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 1, chosenAnswer: "est", time: 0 },
                        { questionId: 2, chosenAnswer: "suis", time: 0 },
                        { questionId: 3, chosenAnswer: "ont", time: 0 },
                        { questionId: 4, chosenAnswer: "allez", time: 0 },
                        { questionId: 5, chosenAnswer: "mangent", time: 0 }
                    ]
                },
                VocabulaireCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 6, chosenAnswer: "froid", time: 0 },
                        { questionId: 7, chosenAnswer: "adieu", time: 0 },
                        { questionId: 8, chosenAnswer: "grand", time: 0 },
                        { questionId: 9, chosenAnswer: "voiture", time: 0 },
                        { questionId: 10, chosenAnswer: "gros", time: 0 }
                    ]
                },
                ComprehensionCat: {
                    valide: false,
                    noteCat:0,
                    responses: [
                        { questionId: 11, chosenAnswer: "salutation", time: 0 },
                        { questionId: 12, chosenAnswer: "voisin", time: 0 },
                        { questionId: 13, chosenAnswer: "écouter", time: 0 },
                        { questionId: 14, chosenAnswer: "bienvenue", time: 0 },
                        { questionId: 15, chosenAnswer: "manger", time: 0 }
                    ]
                }
            },
        ]
    }
];


// Save the users object to localStorage
localStorage.setItem("users", JSON.stringify(users));

// Retrieve and parse the users object from localStorage
const storedUsers = JSON.parse(localStorage.getItem("users"));


// Function to display users score

function usersScores() {
    // Iterate over storedUsers array directly
    storedUsers.forEach(user => {
        const usersScoreElement=document.getElementById('users_score');
        const lastNoteData = getLastNote(user);
        usersScoreElement.innerHTML+=`<div class="border border-[#BFCFE7] rounded-lg p-4 flex items-center justify-between">
                                            <div class="flex items-center">
                                                <div class="bg-[#BFCFE7] rounded-full h-12 w-12 flex items-center justify-center text-[#525CEB] text-xl font-bold mr-4">${user.username.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <div id="username" class="font-bold text-[#3D3B40] mb-3">${user.username}</div>
                                                    <div class="text-[#3D3B40] text-sm flex"><p class="w-36">Niveau Actuel:</p> <span>${lastNoteData ? lastNoteData.level : 'N/A'}</span></div>
                                                    <div class="text-[#3D3B40] text-sm flex"><p class="w-36">Note:</p> <span>${lastNoteData ? lastNoteData.noteNiveau+'/10' : 'N/A'}</span></div>
                                                    <div class="text-[#3D3B40] text-sm flex"><p class="w-36">Date:</p> <span id="niveau_actuel_date">${lastNoteData ? new Date(lastNoteData.date).toLocaleDateString() : 'N/A'}</span></div>
                                                </div>
                                            </div>
                                            <div class="text-3xl font-bold text-[#525CEB] mr-20">${lastNoteData ? lastNoteData.level : 'N/A'}</div>
                                        </div>`
    });
}

// Function to search users by username
function searchUser() {
    const userScoreBoxes = Array.from(document.getElementById('users_score').children);
    const searchInput = document.getElementById('username_search').value;
    

    userScoreBoxes.forEach(userScoreBox => {
        const userName = userScoreBox.querySelector('#username').textContent.toLowerCase();
        if (!userName.includes(searchInput)) {
            userScoreBox.style.display = "none";
        }
    });
    if(searchInput===''){
        const usersScoreElement=document.getElementById('users_score');
        usersScoreElement.innerHTML='';
        usersScores();
    }
}

// Function to search users by date
function searchByDate() {
    const userScoreBoxes = Array.from(document.getElementById('users_score').children);
    const dateInput = formatDateToMMDDYYYY(document.getElementById('date_search').value);

    // Check each userScoreBox for matching date
    userScoreBoxes.forEach(userScoreBox => {
        const niveauActuelDate = userScoreBox.querySelector('#niveau_actuel_date').textContent;

        // Compare the date values and hide boxes that don't match
        console.log(niveauActuelDate);
        console.log(dateInput);
        
        if (niveauActuelDate !== dateInput) {
            userScoreBox.style.display = "none"; // Hide box if the date doesn't match
        }
        if(dateInput==="NaN/NaN/NaN"){
            location.reload();            
        }
        
    });
   
}


function getLastNote(user) {
    for (let i = user.levels.length - 1; i >= 0; i--) {
        const level = user.levels[i];
        if (level.noteNiveau !== 0) {
            return {
                noteNiveau: level.noteNiveau,
                level: level.level,
                date: level.date
            };
        }
    }
    return null;  // Return null if no valid note is found
}
// format date
function formatDateToMMDDYYYY(date) {
    const d = new Date(date);
    const month = d.getMonth() + 1; // Months are zero-based
    const day = d.getDate();
    const year = d.getFullYear();

    // Ensure two digits for day and month
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
}


usersScores();


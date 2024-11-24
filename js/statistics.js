let  questions = []

// Retrieve and parse the users object from localStorage
const storedUsers = JSON.parse(localStorage.getItem("userAccount"))||[];


// Function to display users score
function usersScores() {
    // Iterate over storedUsers array directly
    storedUsers.forEach(user => {
        const usersScoreElement=document.getElementById('users_score');
        const lastNoteData = getLastNote(user);
        usersScoreElement.innerHTML+=`<div onclick="reportByUser(event)" data-user-id=${user.id} data-total-score="${userTotalScoreCalculator(user)}" class="border border-[#BFCFE7] rounded-lg p-4 flex items-center justify-between cursor-pointer">
                                            <div class="flex items-center">
                                                <div class="bg-[#BFCFE7] rounded-full h-12 w-12 flex items-center justify-center text-[#525CEB] text-xl font-bold mr-4">${user.username.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <div id="username" class="font-bold text-[#3D3B40] mb-3">${user.username}</div>
                                                    <div class="text-[#3D3B40] text-sm flex"><p class="w-36">Niveau Actuel:</p> <span>${lastNoteData ? lastNoteData.level : 'N/A'}</span></div>
                                                    <div class="text-[#3D3B40] text-sm flex"><p class="w-36">Note:</p> <span>${lastNoteData ? lastNoteData.noteNiveau+'/10' : 'N/A'}</span></div>
                                                    <div class="text-[#3D3B40] text-sm flex"><p class="w-36">Date:</p> <span id="niveau_actuel_date">${lastNoteData ? new Date(lastNoteData.date).toLocaleDateString() : 'pas encore commence'}</span></div>
                                                </div>
                                            </div>
                                            <div class="text-3xl font-bold text-[#525CEB] mr-20 cursor-default">${lastNoteData ? lastNoteData.level : 'N/A'}</div>
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

// Function to sort users by date
function sortByDate() {
    const usersScoreElement=document.getElementById('users_score');
    const userScoreBoxes = Array.from(document.getElementById('users_score').children);
    const dateSelect = document.getElementById('date_select').value;

    // Sort the userScoreBoxes based on the date
    userScoreBoxes.sort((a, b) => {
        const date1 = new Date(a.querySelector('#niveau_actuel_date').textContent.trim());
        const date2 = new Date(b.querySelector('#niveau_actuel_date').textContent.trim());

        // Compare dates based on the selected option
        if (dateSelect === "ancienne") {
            return date1 - date2; //old to new 
        } else if (dateSelect === "recente") {
            return date2 - date1; //new to old
        }
        return 0;  // No change if no valid option selected
    });

    usersScoreElement.innerHTML='';
    userScoreBoxes.forEach((userScoreBox) => {
        usersScoreElement.innerHTML += userScoreBox.outerHTML;
    });    
}

// Function to sort users by Level
function sortByLevel() {
    const usersScoreElement=document.getElementById('users_score');
    const userScoreBoxes = Array.from(document.getElementById('users_score').children);
    const levelSelect = document.getElementById('level_select').value;

    // Sort the userScoreBoxes based on the date
    userScoreBoxes.sort((a, b) => {
        const userTotal1 = a.getAttribute('data-total-score');
        const userTotal2 = b.getAttribute('data-total-score');        

        // Compare total scores based on the selected option
        if (levelSelect === "low") {            
            return userTotal1 - userTotal2; //low to high
        } else if (levelSelect === "high") {
            return userTotal2 - userTotal1; //high to low
        }
        return 0;  // No change if no valid option selected
    });

    usersScoreElement.innerHTML='';
    userScoreBoxes.forEach((userScoreBox) => {
        usersScoreElement.innerHTML += userScoreBox.outerHTML;
    });  
   
}

function userTotalScoreCalculator(user) {
    let userTotalScore = 0;

    // Loop through each level (e.g., "A1", "A2", "B1")
    for (let level in user.levels) {
        userTotalScore += user.levels[level].noteNiveau;
    }

    return userTotalScore;
}

function getLastNote(user) {
    if (!user.levels || typeof user.levels !== "object") {
        return null; // Return null if levels is not a valid object
    }

    // Get all level keys (e.g., "A1", "A2") in natural order
    const levelsKeys = Object.keys(user.levels);

    for (let key of levelsKeys) {
        const level = user.levels[key];

        // Check the `valide` property directly
        if (!level.valide) {
            return {
                noteNiveau: level.noteNiveau,
                level: key, // Use the level key (e.g., "A1")
                date: level.date
            };
        }
    }

    return null; // Return null if all levels are valid
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



// dsiplay level boxes

function levelsStatistics(){

    levels=['A1','A2','B1','B2','C1','C2'];
    const levelsBoxesContainer = document.getElementById('levels_boxes_container');
    levels.forEach((level)=>{
        levelsBoxesContainer.innerHTML+=`<div class="border border-[#BFCFE7] rounded-lg flex items-end justify-center gap-8 py-12">
                                            <div class="text-4xl font-bold text-[#525CEB]">${level}</div>
                                            <div>
                                                <div class="flex">
                                                    <p class="w-20">Au niveau</p>
                                                    <span>${usersAtLevel(level)}</span>
                                                </div>
                                                <div class="flex">
                                                    <p class="w-20">Tentatives</p>
                                                    <span>${tentativesByLevel(level)}</span>
                                                </div>
                                                <div class="flex">
                                                    <p class="w-20">Réussites</p>
                                                    <span>${usersSucceed(level)}</span>
                                                </div>
                                            </div>
                                        </div>`
    });

}
levelsStatistics();

// calculate number of tentatives in a level
function tentativesByLevel(l) {
    let levelTentativ = 0;
    storedUsers.forEach((user) => {
        // Check if the level exists in the user.levels object
        const level = user.levels[l];  // Access the level by key
        if (level) {
            levelTentativ += level.tentative; // Accumulate the tentative count
        }
    });
    return levelTentativ;
}

// calculate number of users at this level
function usersAtLevel(l){
    let usersAtLevel=0;
    storedUsers.forEach((user)=>{
        const lastNoteData = getLastNote(user);
        if(lastNoteData.level===l){
            usersAtLevel++;
        }
    });
    return usersAtLevel;
}

function usersSucceed(l) {
    let usersSucceed = 0;
    storedUsers.forEach((user) => {
        if (user.levels[l] && user.levels[l].valide===true) {
            usersSucceed++; // Increment if the user succeeded at this level (noteNiveau === 10)
        }
    });
    return usersSucceed;
}

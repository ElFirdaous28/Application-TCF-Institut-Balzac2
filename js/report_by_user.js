// display user report

const storedUsers = JSON.parse(localStorage.getItem("userAccount"));
const storedQuestions = JSON.parse(localStorage.getItem("questions"));
const currentUserId=localStorage.getItem('currentUser');
const currentUser = storedUsers.find(user => user.id === Number(currentUserId));

document.addEventListener("DOMContentLoaded",showScoreDEtails(getLevel(),getCategory()));
document.getElementById('level_select').addEventListener("change",()=>{showScoreDEtails(getLevel(),getCategory());})
document.getElementById('category_select').addEventListener("change",()=>{showScoreDEtails(getLevel(),getCategory());})

function getCategory(){
    return categorySelected = document.getElementById('category_select').value;
}
function getLevel(){
    return levelSelected = document.getElementById('level_select').value;
}

function showScoreDEtails(level,category){    
    const levelData = currentUser.levels[level];        
    const categoryData = category === "Compréhension" ? levelData.Compréhension :
                         category === "Vocabulaire" ? levelData.Vocabulaire :
                         levelData.Grammaire;  // Default to Grammaire if no match                        
        

    document.getElementById('username').innerHTML=currentUser.username;
    document.getElementById('niveau').innerHTML=level;
    document.getElementById('points').innerHTML=categoryData.noteCat;
    document.getElementById('duree').innerHTML=timeByCategory(categoryData);
    if(categoryData.responses.length>0){
        document.getElementById('moyenne').innerText=`${categoryData.noteCat/categoryData.responses.length*100}%`;    
    }
    else{
        document.getElementById('moyenne').innerText=`0%`;    
    }
    document.getElementById('cercle_level').style.background=`conic-gradient(#525CEB 0% ${categoryData.noteCat/categoryData.responses.length*100}%, #BFCFE7 ${categoryData.noteCat/categoryData.responses.length*100}% 100%)`;

    answersType=nbrAnswersEachType(categoryData.responses,level,category);
    document.getElementById('nbr_correct').innerHTML=`${answersType.correctAnswers}/${categoryData.responses.length}`;
    document.getElementById('non_repondu').innerHTML=`${answersType.timeout}/${categoryData.responses.length}`;
    document.getElementById('nbr_incorrect').innerHTML=`${answersType.incorrectAnswers}/${categoryData.responses.length}`;

}

function timeByCategory(categoryData) {
    let totalTimeInSeconds = 0;
    categoryData.responses.forEach(response => {
        totalTimeInSeconds += response.time;
    });

    const minutes = Math.floor(totalTimeInSeconds / 60);
    const seconds = totalTimeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function nbrAnswersEachType(responses,level,category){
    let correctAnswers=0,incorrectAnswers=0,timeout=0;
    questionCategory = category === "GrammerCat" ? "Grammaire" : category === "VocabulaireCat" ? "Vocabulaire" : category === "ComprehensionCat" ? "Compréhension" :  category;
    const categorystoredQuestions=storedQuestions.find(l => l.level === level).categories[questionCategory];

    responses.forEach((r)=>{
        const question = categorystoredQuestions.find(q => q.id === r.questionId);
        if (question){
            if(correct(question,r.chosenAnswer)){
                correctAnswers++;
            }
            else incorrectAnswers++;
            if(r.chosenAnswer === "" && r.time===20){
                timeout++;
            }
        }
    })
    return { correctAnswers, incorrectAnswers, timeout }    
}


function correct(question,chosenAnswer){
    if (chosenAnswer === question.answer)
        return true;
    else
    return false;
}


// user asnewrs details

function showUseranswers(responses,level,category){
    const bilanDuQuiz = document.getElementById('bilan_du_quiz');
    bilanDuQuiz.innerHTML='';
    if(responses.length>0){
        questionCategory = category === "GrammerCat" ? "Grammaire" : category === "VocabulaireCat" ? "Vocabulaire" : category === "ComprehensionCat" ? "Compréhension" :  category;
        const categorystoredQuestions=storedQuestions.find(l => l.level === level).categories[questionCategory];

        for(let i=0;i<categorystoredQuestions.length;i++){
            currentUserAnswer=responses[i].chosenAnswer;
            
            htmlQuestoinDiv =`<div data-correct="${correct(categorystoredQuestions[i], currentUserAnswer)?"true":"false"}" class="question_answer border-2 border-[#BFCFE7] rounded-xl flex flex-col justify-center items-center py-10">
                                            <h1 class="text-[#525CEB] text-2xl">Question <span>${i+1}</span></h1>
                                            <p class="mb-10 text-center mx-1 text-2xl">${categorystoredQuestions[i].question}</p>
                                            <!-- answers -->
                                            <div class="w-2/3 lg:w-1/2 md:w-1/2">`;
        
            
            categorystoredQuestions[i].options.forEach((option)=>{
                if (correct(categorystoredQuestions[i], option)) {
                    optiontSyle = 'style="background-color:rgba(107, 191, 89, 0.4);border:none;"';
                } else if (option === currentUserAnswer && !correct(categorystoredQuestions[i], option)) {
                    optiontSyle = 'style="background-color:rgba(217, 83, 79, 0.4);border:none;"';
                } else {
                    optiontSyle = "";
                }                  
                
                htmlQuestoinDiv+=`<div class="text-start mb-3 pl-6 py-1 rounded-xl border-2 border-[#BFCFE7]" ${optiontSyle}> ${option}</div>`
            });
            if(responses[i].time===20){
                htmlQuestoinDiv+=`<div class="w-fit m-auto mb-3 py-1 px-2 rounded-xl border-2 border-[#BFCFE7]" style="background-color:rgba(217, 83, 79, 0.4);border:none;"> TimeOut!</div>`
            }
            htmlQuestoinDiv+=`</div>
                            </div>`
            bilanDuQuiz.innerHTML+=htmlQuestoinDiv;
        } 
    }
}


// Show only incorrect or all answers select
const incorrectSelect = document.getElementById('incorrect_select');
incorrectSelect.addEventListener("change", () => {
    const questionAnswerBox = Array.from(document.querySelectorAll('.question_answer'));

    // Check the selected value
    if (incorrectSelect.value === "incorrect") {
        questionAnswerBox.forEach((element) => {
            // Hide elements marked as correct
            if (element.getAttribute('data-correct') === "true") {
                element.classList.add('hidden');
            } else {
                element.classList.remove('hidden');
            }
        });
    } else {
        // Show all elements if "all" is selected
        questionAnswerBox.forEach((element) => {
            element.classList.remove('hidden');
        });
    }
});

let numbreOfQuestion = 1;
let maxOfQuestin = 10;
let timer = 10; //10s
let nevueIndex; // 1 2 3
let nevueName; // A1 A2 ..
let categorie;
let indexOFQ = 0;
let Chrono = 7; //chrono 7s
let noteOFuser = 0; // note of user in categori /10
let noteTotaleOFlevel = 0; // note of user in level somme of all categore /3 = x /10
let tentative = 0;
let date;

function selectQuestions() {
  // btn of all neveux
  let BtnNevA1 = document.getElementById("testA1");
  let BtnNevA2 = document.getElementById("testA2");
  let BtnNevB1 = document.getElementById("testB1");

  // btn of all categores
  let Btncate = document.querySelectorAll(".categore");
  // div of all catefore
  let divOFCate = document.getElementById("menu");
  BtnNevA1.addEventListener("click", () => {
    nevue = 0;
    nevueName = "A1";
    divOFCate.classList.remove("hidden");
    displayCategoryScores();
    calculateAndSaveTotalScore();
  });
  BtnNevA2.addEventListener("click", () => {
    nevue = 1;
    nevueName = "A2";
    divOFCate.classList.remove("hidden");
    displayCategoryScores();
    calculateAndSaveTotalScore();
  });
  BtnNevB1.addEventListener("click", () => {
    nevue = 2;
    nevueName = "B1";
    divOFCate.classList.remove("hidden");
    displayCategoryScores();
    calculateAndSaveTotalScore();
  });
  Btncate[0].addEventListener("click", () => {
    categorie = "Grammaire";
    StartQueez();

    Chrono = 7;
    indexOFQ = 0;
    numbreOfQuestion = 1;

    AfficheeQuestion();
  });
  Btncate[1].addEventListener("click", () => {
    categorie = "Vocabulaire";
    StartQueez();

    Chrono = 7;
    indexOFQ = 0;
    numbreOfQuestion = 1;

    AfficheeQuestion();
  });
  Btncate[2].addEventListener("click", () => {
    categorie = "Compréhension";
    StartQueez();

    Chrono = 7;
    indexOFQ = 0;
    numbreOfQuestion = 1;

    AfficheeQuestion();
  });
}
selectQuestions();

// call questionf from json
let questions = [];
async function loadData() {
  const response = await fetch("../questions.json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
}

async function init() {
  try {
    questions = await loadData();

    localStorage.setItem("questions", JSON.stringify(questions));
    // questions = getRandomQuestions(questions, numberOfQuestions);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

init();

function StartQueez() {
  let divOfquez = document.getElementById("quiz_container");
  let Select_level = document.getElementById("Select_level");
  divOfquez.classList.toggle("hidden");
  Select_level.classList.toggle("hidden");
}

function AfficheeQuestion() {
  statrSecons();

  let NumberOfQuestion = document.getElementById("NumberOfQuestion");
  let QuestionDiv = document.querySelector(".QuestionDiv");
  let divOfOptions = document.getElementById("divOfOptions");

  let questionsFromLocalsrotage = JSON.parse(localStorage.getItem("questions"));
  //   console.log(questionsFromLocalsrotage[nevue].categories[categorie][indexOFQ]);

  const totalQuestions =
    questionsFromLocalsrotage[nevue].categories[categorie].length;

  NumberOfQuestion.textContent = numbreOfQuestion + "/" + totalQuestions;
  QuestionDiv.textContent =
    questionsFromLocalsrotage[nevue].categories[categorie][indexOFQ].question;
  QuestionDiv.id =
    questionsFromLocalsrotage[nevue].categories[categorie][indexOFQ].id;

  let alloptines = "";
  questionsFromLocalsrotage[nevue].categories[categorie][
    indexOFQ
  ].options.forEach((element, index) => {
    alloptines += `<button   id="${index}"
                class="answers w-full max-w-96 text-start mb-3 pl-5 h-9 rounded-full border-2 border-[#BFCFE7] hover:text-white hover:bg-[#525CEB] hover:border-[#525CEB]"
               
              >${index + 1}- <span>${element}</span></button>`;
  });
  divOfOptions.innerHTML = alloptines;
  ChoosetheAnswer();
}

// ChoosetheAnswer:
function ChoosetheAnswer() {
  let answers = document.querySelectorAll(".answers");
  answers.forEach((ele) => {
    ele.addEventListener("click", () => {
      let questionsFromLocalStorage = JSON.parse(
        localStorage.getItem("questions")
      );

      const span = ele.querySelector("span");
      if (numbreOfQuestion == 1) {
        noteOFuser = 0;
      }
      //
      if (
        span.textContent ==
        questionsFromLocalStorage[nevue].categories[categorie][indexOFQ].answer
      ) {
        noteOFuser++;
      }

      //     LocalStorage
      saveanswerinLocalstorage(span.textContent);
      const totalQuestions =
        questionsFromLocalStorage[nevue].categories[categorie].length;
      //
      if (numbreOfQuestion === totalQuestions) {
        clearInterval(intervalId);
        afficherResult(); //
      } else {
        goTonextQuetion();
      }
    });
  });
}

function saveanswerinLocalstorage(chosenAnswer) {
  let userAccount = JSON.parse(localStorage.getItem("userAccount"));
  let username = localStorage.getItem("nameOFuser");
  let QuestionDiv = document.querySelector(".QuestionDiv");
  let timer = document.getElementById("timer");

  const index = userAccount.findIndex((user) => user.username === username);

  if (numbreOfQuestion == 1) {
    if (userAccount[index].levels[nevueName][categorie].responses.length > 0) {
      tentative++;
      userAccount[index].levels[nevueName][categorie].tentativeCat++;
      userAccount[index].levels[nevueName].date =
        new Date().toLocaleDateString();
      userAccount[index].levels[nevueName].tentative++;
    }

    userAccount[index].levels[nevueName][categorie].responses = [];
    userAccount[index].levels[nevueName].noteNiveau -=
      userAccount[index].levels[nevueName][categorie].noteCat;
  }
  if (
    userAccount[index].levels[nevueName][categorie].responses.length ===
    userAccount[index].levels[nevueName][categorie].noteCat
  ) {
    userAccount[index].levels[nevueName][categorie].valide = true;
  } else {
    userAccount[index].levels[nevueName][categorie].valide = false;
  }

  userAccount[index].levels[nevueName][categorie].noteCat = noteOFuser;

  let infoOfQuestion = {
    questionId: parseInt(QuestionDiv.id),
    chosenAnswer: chosenAnswer,
    time: 7 - parseInt(timer.textContent),
  };

  userAccount[index].levels[nevueName][categorie].responses.push(
    infoOfQuestion
  );
  userAccount[index].levels[nevueName].date = new Date().toISOString();
  localStorage.setItem("userAccount", JSON.stringify(userAccount));
}

function Timer() {
  let timer = document.getElementById("timer");
  timer.textContent = Chrono;
  Chrono--;
  if (Chrono < 0) {
    let questionsFromLocalsrotage = JSON.parse(
      localStorage.getItem("questions")
    );
    const totalQuestions =
      questionsFromLocalsrotage[nevue].categories[categorie].length;

    if (numbreOfQuestion === totalQuestions) {
      clearInterval(intervalId);
      afficherResult();
    } else {
      saveTimeoutData();
      goTonextQuetion();
    }
  }
}

function statrSecons() {
  intervalId = setInterval(Timer, 1000);
}

function goTonextQuetion() {
  clearInterval(intervalId);
  numbreOfQuestion++;
  indexOFQ++;
  Chrono = 7;
  AfficheeQuestion();
}

function afficherResult() {
  // Get the container that holds the quiz
  let divOfQuiz = document.getElementById("quiz_container");

  // Assume data exists in LocalStorage
  let userAccount = JSON.parse(localStorage.getItem("userAccount"));
  let username = localStorage.getItem("nameOFuser");
  const index = userAccount.findIndex((user) => user.username === username);

  // Retrieve the score and level for the current user
  let noteNiveau = userAccount[index].levels[nevueName][categorie].noteCat || 0;
  let level = nevueName || "Unknown";
  let questionsFromLocalsrotage = JSON.parse(localStorage.getItem("questions"));
  const totalQuestions =
    questionsFromLocalsrotage[nevue].categories[categorie].length;

  // Replace the quiz content with the results display
  divOfQuiz.innerHTML = `
    <div class="bg-white shadow-md rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-4">Language Test Results</h1>
      <div class="flex items-center mb-4">
        <span class="text-xl font-semibold">Score:</span>
        <span class="text-3xl font-bold text-blue-600 ml-2">${noteNiveau}/${totalQuestions}</span>
      </div>
      <div class="flex items-center mb-4">
        <span class="text-xl font-semibold">Level:</span>
        <span class="text-3xl font-bold text-green-600 ml-2">${level} - ${categorie}</span>
      </div>
      <div class="flex items-center mb-4">
        <span class="text-xl font-semibold">tentative:</span>
        <span class="text-3xl font-bold text-red-400 ml-2">${userAccount[index].levels[nevueName][categorie].tentativeCat}</span>
      </div>
      <div class="flex space-x-4 justify-center">
        <button id="testAgainBtn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          <i class="fas fa-redo-alt mr-2"></i>Test Again
        </button>
      
      </div>
    </div>
  `;

  // Add button event listeners
  document.getElementById("testAgainBtn").addEventListener("click", () => {
    location.reload(); // Reload the page to restart the quiz
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    window.location.href = "menu.html"; // Navigate to the menu page
  });
}

function saveTimeoutData() {
  let userAccount = JSON.parse(localStorage.getItem("userAccount"));
  let username = localStorage.getItem("nameOFuser");
  let QuestionDiv = document.querySelector(".QuestionDiv");

  const index = userAccount.findIndex((user) => user.username === username);

  // If it's first question, handle attempt counting
  if (numbreOfQuestion == 1) {
    if (userAccount[index].levels[nevueName][categorie].responses.length > 0) {
      userAccount[index].levels[nevueName][categorie].tentativeCat++;
      userAccount[index].levels[nevueName].date =
        new Date().toLocaleDateString();
    }
    userAccount[index].levels[nevueName][categorie].responses = [];

    noteOFuser = 0;
  }
  if (
    userAccount[index].levels[nevueName][categorie].responses.length ===
    userAccount[index].levels[nevueName][categorie].noteCat
  ) {
    userAccount[index].levels[nevueName][categorie].valide = true;
  } else {
    userAccount[index].levels[nevueName][categorie].valide = false;
  }

  userAccount[index].levels[nevueName][categorie].noteCat = noteOFuser;

  // Save timeout response
  let infoOfquestion = {
    questionId: parseInt(QuestionDiv.id),
    chosenAnswer: "", // Indicating no answer was selected
    time: 7, // Full time used
  };

  userAccount[index].levels[nevueName][categorie].responses.push(
    infoOfquestion
  );
  localStorage.setItem("userAccount", JSON.stringify(userAccount));
}

function displayCategoryScores() {
  // Get user data from localStorage
  const userAccount = JSON.parse(localStorage.getItem("userAccount"));
  const username = localStorage.getItem("nameOFuser");
  const userIndex = userAccount.findIndex((user) => user.username === username);

  // Get buttons
  const grammaireBtn = document.getElementById("grammaire");
  const vocabulaireBtn = document.getElementById("vocabulaire");
  const comprehensionBtn = document.getElementById("comprehension");
  let questionsFromLocalsrotage = JSON.parse(localStorage.getItem("questions"));

  // Only proceed if we have a valid user and level selected
  grammaireBtn.textContent =
    Object.keys(userAccount[userIndex].levels)[nevue] +
    "- Grammaire" +
    " " +
    userAccount[userIndex].levels[nevueName].Grammaire.noteCat +
    "/" +
    questionsFromLocalsrotage[nevue].categories.Grammaire.length;
  vocabulaireBtn.textContent =
    Object.keys(userAccount[userIndex].levels)[nevue] +
    "- Vocabulaire" +
    " " +
    userAccount[userIndex].levels[nevueName].Vocabulaire.noteCat +
    "/" +
    questionsFromLocalsrotage[nevue].categories.Vocabulaire.length;
  comprehensionBtn.textContent =
    Object.keys(userAccount[userIndex].levels)[nevue] +
    "- Compréhension" +
    " " +
    userAccount[userIndex].levels[nevueName].Compréhension.noteCat +
    "/" +
    questionsFromLocalsrotage[nevue].categories.Compréhension.length;
}

function calculateAndSaveTotalScore() {
  // Get data from localStorage
  let userAccount = JSON.parse(localStorage.getItem("userAccount"));
  let username = localStorage.getItem("nameOFuser");
  let questionsFromLocalsrotage = JSON.parse(localStorage.getItem("questions"));
  const totalQuestionsGrammaire =
    questionsFromLocalsrotage[nevue].categories.Grammaire.length;
  const totalQuestionsVocabulaire =
    questionsFromLocalsrotage[nevue].categories.Vocabulaire.length;
  const totalQuestionsCompréhension =
    questionsFromLocalsrotage[nevue].categories.Compréhension.length;

  const index = userAccount.findIndex((user) => user.username === username);

  // Get the current level data
  const noteGrammere = userAccount[index].levels[nevueName].Grammaire.noteCat;
  const noteVocabulaire =
    userAccount[index].levels[nevueName].Vocabulaire.noteCat;
  const noteComprehnsion =
    userAccount[index].levels[nevueName].Compréhension.noteCat;
  const currentLevel = userAccount[index].levels;

  userAccount[index].levels[nevueName].noteNiveau =
    ((noteGrammere + noteVocabulaire + noteComprehnsion) * 10) /
    (totalQuestionsGrammaire +
      totalQuestionsVocabulaire +
      totalQuestionsCompréhension);
      if(userAccount[index].levels[nevueName].noteNiveau>6){
        userAccount[index].levels[nevueName].valide=true;
      }
 // Calculate total score from all categories
  const noteOfneveux = userAccount[index].levels[nevueName].noteNiveau;
  // Save total score to noteNiveau
  // userAccount[index].levels[nevueName].noteNiveau = totalScore

  // Save back to localStorage
  localStorage.setItem("userAccount", JSON.stringify(userAccount));

  

  // return totalScore;
}

function openOtherneveu() {
  let BtnNevA1 = document.getElementById("testA1");
  let BtnNevA2 = document.getElementById("testA2");
  let BtnNevB1 = document.getElementById("testB1");
 
  let userAccount = JSON.parse(localStorage.getItem("userAccount"));
  let username = localStorage.getItem("nameOFuser");
  const index = userAccount.findIndex((user) => user.username === username);

  const validGrammaireA1 = userAccount[index].levels.A1.Grammaire.valide ;
  const validVocabulaireA1 = userAccount[index].levels.A1.Vocabulaire.valide ;
  const validCompréhensionA1 = userAccount[index].levels.A1.Compréhension.valide ;

  const validGrammaireA2 = userAccount[index].levels.A2.Grammaire.valide
  const validVocabulaireA2 = userAccount[index].levels.A2.Vocabulaire.valide
  const validCompréhensionA2 = userAccount[index].levels.A2.Compréhension.valide

  const validGrammaireB1 = userAccount[index].levels.B1.Grammaire.valide
  const validVocabulaireB1 = userAccount[index].levels.B1.Vocabulaire.valide
  const validCompréhensionB1 = userAccount[index].levels.B1.Compréhension.valide

  if(validCompréhensionA1 && validGrammaireA1 && validVocabulaireA1){
    BtnNevA1.textContent =  BtnNevA1.textContent + "(valide)" ;
    
    BtnNevA2.disabled = false;
    BtnNevA2.classList.toggle("cursor-not-allowed") ;
    BtnNevA2.classList.add("bg-blue-500") ;
    BtnNevA2.classList.remove("bg-gray-400") ;
    

  }
  if(validCompréhensionA2 && validGrammaireA2 && validVocabulaireA2 && validCompréhensionA1 && validGrammaireA1 && validVocabulaireA1 ){
    BtnNevA2.textContent =  BtnNevA2.textContent + "(valide)" ;
    
    BtnNevB1.disabled = false;
    BtnNevB1.classList.toggle("cursor-not-allowed") ;
    BtnNevB1.classList.add("bg-blue-500") ;
    BtnNevB1.classList.remove("bg-gray-400") ;
    

  }
  if(validGrammaireB1 && validVocabulaireB1 && validCompréhensionB1 && validCompréhensionA2 && validGrammaireA2 && validVocabulaireA2 && validCompréhensionA1 && validGrammaireA1 && validVocabulaireA1 ){
    BtnNevB1.textContent =  BtnNevB1.textContent + "(valide)" ;
    
    // BtnNevB1.disabled = false;
    // BtnNevB1.classList.toggle("cursor-not-allowed") ;
    // BtnNevB1.classList.add("bg-blue-500") ;
    // BtnNevB1.classList.remove("bg-gray-400") ;
    

  }
  
}
openOtherneveu();

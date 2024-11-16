let numbreOfQuestion = 1;
let maxOfQuestin = 10;
let timer = 10; //10s
let nevueIndex; // 1 2 3 
let nevueName; // A1 A2 ..
let categorie;
let indexOFQ = 0;
let Chrono = 7; //chrono 7s
let noteOFuser = 0 // note of user in categori /10
let noteTotaleOFlevel = 0 // note of user in level somme of all categore /3 = x /10
let tentative = 0 ;
let date ; 

function selectQuestions() {
  // btn of all neveux
  let BtnNevA1 = document.getElementById("testA1");
  let BtnNevA2 = document.getElementById("testA2");
  let BtnNevB1 = document.getElementById("testB1");
  BtnNevA2.disabled = false;
  BtnNevB1.disabled = false;
  // btn of all categores
  let Btncate = document.querySelectorAll(".categore");
  // div of all catefore
  let divOFCate = document.getElementById("menu");
  BtnNevA1.addEventListener("click", () => {
    nevue = 0;
    nevueName = "A1"
    divOFCate.classList.remove("hidden");
    Btncate[0].textContent = "A1- Grammaire";
    Btncate[1].textContent = "A1- Vocabulaire";
    Btncate[2].textContent = "A1- Compréhension";
  });
  BtnNevA2.addEventListener("click", () => {
    nevue = 1;
    nevueName = "A2"
    divOFCate.classList.remove("hidden");

    Btncate[0].textContent = "A2- Grammaire";
    Btncate[1].textContent = "A2- Vocabulaire";
    Btncate[2].textContent = "A2- Compréhension";
  });
  BtnNevB1.addEventListener("click", () => {
    nevue = 2;
    nevueName = "B1"
    divOFCate.classList.remove("hidden");

    Btncate[0].textContent = "B1- Grammaire";
    Btncate[1].textContent = "B1- Vocabulaire";
    Btncate[2].textContent = "B1- Compréhension";
  });
  Btncate[0].addEventListener("click", () => {
    categorie = "Grammaire";
    StartQueez();
    Chrono = 7 ;
    indexOFQ = 0 ;
    numbreOfQuestion = 1
    
    AfficheeQuestion();
  });
  Btncate[1].addEventListener("click", () => {
    categorie = "Vocabulaire";
    saveanswerinLocalstorage()
    StartQueez();
    AfficheeQuestion();
  });
  Btncate[2].addEventListener("click", () => {
    categorie = "Compréhension";
    StartQueez();
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
    statrSecons() ;
   
  let NumberOfQuestion = document.getElementById("NumberOfQuestion");
  let QuestionDiv = document.querySelector(".QuestionDiv");
  let divOfOptions = document.getElementById("divOfOptions");
 
  let questionsFromLocalsrotage = JSON.parse(localStorage.getItem("questions"));
//   console.log(questionsFromLocalsrotage[nevue].categories[categorie][indexOFQ]);

  NumberOfQuestion.textContent = numbreOfQuestion;
  QuestionDiv.textContent = questionsFromLocalsrotage[nevue].categories[categorie][indexOFQ].question;
  QuestionDiv.id =  questionsFromLocalsrotage[nevue].categories[categorie][indexOFQ].id ;
 
  let alloptines = "";
  questionsFromLocalsrotage[nevue].categories[categorie][
    indexOFQ
  ].options.forEach((element, index) => {
    alloptines += `<button   id="${index}"
                class="answers w-full max-w-96 text-start mb-3 pl-5 h-9 rounded-full border-2 border-[#BFCFE7] hover:text-white hover:bg-[#525CEB] hover:border-[#525CEB]"
               
              >${index + 1}- <span>${element}</span></button>`;
  });
  divOfOptions.innerHTML = alloptines;
  ChoosetheAnswer() ;
}
function ChoosetheAnswer() {
    let answers = document.querySelectorAll(".answers") ;
    answers.forEach((ele , index)  =>{
        ele.addEventListener('click',()=>{
            let questionsFromLocalsrotage = JSON.parse(localStorage.getItem("questions"));
            // let CorrectOne =  ;
            let answerOfuser = index;
            const span = ele.querySelector("span");
            if(span.textContent == questionsFromLocalsrotage[nevue].categories[categorie][indexOFQ].answer){
                noteOFuser++ ;
            }
            
            
            if (numbreOfQuestion === 5) {
                clearInterval(intervalId);
                StartQueez();
              } else {
                  goTonextQuetion() ;
              }
        })
    })
    
}


function Timer() {
  let timer = document.getElementById("timer");
  timer.textContent = Chrono;
  Chrono--;
  if (Chrono < 0) {
    if (numbreOfQuestion === 5) {
      clearInterval(intervalId);
      StartQueez();
    } else {
        goTonextQuetion()
    }
  }

  
}
function statrSecons() {
  intervalId = setInterval(Timer, 1000);
}

function goTonextQuetion(){
    clearInterval(intervalId);
      numbreOfQuestion++;
      indexOFQ++;
      Chrono = 7;
      AfficheeQuestion();
}
function saveanswerinLocalstorage(){
    let userAccount = JSON.parse(localStorage.getItem("userAccount"));
    let username = localStorage.getItem("nameOFuser");
    
    console.log(username) ;
    const index = userAccount.findIndex(user => user.username === username);
    console.log(userAccount[index].levels[nevueName][categorie]) ;
}

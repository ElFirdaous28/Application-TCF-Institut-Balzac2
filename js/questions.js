function selectQuestions(){
    document.getElementById('testA1').addEventListener('click', function() {
        document.getElementById('menu').classList.toggle('hidden');
    });

    document.getElementById('grammaire').addEventListener('click', function() {
        
        StartQueez()
    });

    document.getElementById('vocabulaire').addEventListener('click', function() {
        alert('Quiz de Vocabulaire commencé!');
    });

    document.getElementById('comprehension').addEventListener('click', function() {
        alert('Quiz de Compréhension commencé!');
    });
}
selectQuestions()

// call questionf from json
let questionsArray = [];
async function loadQuestions() {
    try {
        const response = await fetch('../questions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        questionsArray = await response.json();
        
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}


async function init() {
    await loadQuestions() ;
    console.log(questionsArray)
    
}
init()
function StartQueez(){
  let divOfquez = document.getElementById("quiz_container") ;
  let Select_level = document.getElementById("Select_level");
  divOfquez.classList.toggle("hidden")
  Select_level.classList.toggle("hidden")
 
}



       

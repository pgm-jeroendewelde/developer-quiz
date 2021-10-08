/**
 * The Quiz API Application
 */
/* Imports */
import { fetchQuestions } from './api/QuizAPI.js';
import { createForm, createContainer, createInput, createLabel, createHeading, createParagraph, createUnorderedList, createListItem, createSpan } from './lib/Elements.js';
import * as CS from './Constants.js';
import { readFromStorage } from './storage.js';

/* Global variables */
let activeQuestion = 0;
let allAnswers = [];
let score = 0;
let time = 0;
let timer;
let currentUser = '';

/* Cache quiz-area */
const $quizArea = document.querySelector('.quizArea');

/**
 * Initialize Application
 */
const init = async () => {
  buildFilterForm();
}

/**
 * Build Filter-Form
 */
const buildFilterForm = () => {
  const form = createForm({id: 'filterForm'});

  // Name input for user visible on load
  const nameContainer = createContainer({classList: ['nameContainer']});
  const headingName = createHeading({type: 2, content: 'What is your name?'});
  const nameInput = createInput({type: 'text', name: 'username', id: 'username', placeholder: 'Fill in your Game Name'});
  const nameConfirm = createContainer({content: 'OK', id: 'username-confirm',  classList : ['button', 'button--next']});
  nameConfirm.textContent = 'OK';
  nameContainer.append(headingName, nameInput, nameConfirm);

  // Click event when user presses 'OK' to show filters and hide name input
  nameConfirm.addEventListener('click', () => {
    nameContainer.classList.toggle('hide');
    filterContainer.classList.toggle('hide');
  })

  // Filters visible after Users presses 'OK' 
  // Containers created for categories & difficulty
  const filterContainer = createContainer({classList: ['filterContainer', 'hide']});
  const heading = createHeading({type: 2, content: 'Selecteer jouw filters'});
  const categoriesFilter = createButtonGroup({title: 'category', filters : CS.categories});
  const difficultyFilter = createButtonGroup({title: 'difficulty', filters : CS.difficulty});
  
  // Elements for question numbers + eventlistener to show amount of questions on change
  const buttonGroup = createContainer({classList : ['filterGroup']});
  const amountHeading = createHeading({type: 3, content: 'Amount'});
  const amountHeadingCount = createHeading({type: 4, classList: ['subTitle']});
  
  const slider = createInput({type: 'range', name: 'limit', id: 'limit-filter', value : '10', min: '1', max: '20', classList : ['slider']});
  slider.addEventListener('input', () => {
    amountHeadingCount.textContent = `${slider.value} Questions`;
  })
  amountHeadingCount.textContent = `${slider.value} Questions`;
  buttonGroup.append(amountHeading, amountHeadingCount, slider);


  const submit = createInput({type: 'submit', value: 'Start Quiz', id: 'submit-filter'})
  filterContainer.append(heading,categoriesFilter, difficultyFilter, buttonGroup, submit);
  form.append(nameContainer, filterContainer);
  // Submitting form Starts the Quiz
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    startQuiz(e);
  })
  $quizArea.appendChild(form);
}

/**
 * Create Button group for filter-form with data from Constants.js
 * @param {*} param0 
 */
const createButtonGroup = ({title, filters = [] }) => {
  const buttonGroup = createContainer({classList : ['filterGroup']});
  const groupHeading = createHeading({type: 3, content: title});
  buttonGroup.appendChild(groupHeading);

  filters.forEach((filter, i) => {  
    const button = createInput({type: 'radio', name: title, value : filter,  classList : ['button', 'button--filter']});
    i === 0 ? button.checked = true : '';
    const label = createLabel({name: `${title}-${filter}`, content: filter});
    buttonGroup.append(button, label);
  });
  return buttonGroup;
}

/**
 * Triggered event to get questions and start quiz
 * @param { Event } e 
 */
const startQuiz = async (e) => {
  const formData = new FormData(e.target);
  const keys = Array.from(formData.keys());
  const filters = {};

  //Get all keys from filter-form, loop trough them
  // add key-value pair with data from each filter
  keys.forEach(key => {
    // If the username is filled in OR the user selected 'ALL' on filter,
    // key-value pair isn't added to object filters
    if(formData.has(key) && key !== 'username' && formData.get(key) !== 'all') {
      filters[key] = formData.get(key);
    }

    // If User inputed his name, the global 'currentUser' gets filled in with the name
    // else his username is just 'user'
    if(key === 'username') {
      formData.get(key) !== '' ? (currentUser = formData.get(key)) : (currentUser = 'User');
    }
  });

  //Data gets fetched, Questions UI gets build and first answer gets shown
  const questions = await fetchQuestions(filters);  
  localStorage.setItem('questions', JSON.stringify(questions));
  buildQuestionForm();
  showQuestion();
}

/**
 * Question form UI gets build with navigation,
 * area to load in selected question is empty
 */
const buildQuestionForm = () => {
  $quizArea.innerHTML = '';
  const heading = createHeading({type: 2, id: 'question-title'});
  const heading2 = createHeading({type: 6, id: 'question-progress'});
  const buttonGroup = createContainer({id: 'question-area', classList : ['question-answsers']});

  const buttonGroupNavigation = createContainer({classList : ['question-navigation']});
  const stop = createInput({type: 'button', value: 'Stop', id: 'question-stop'});
  const next = createInput({type: 'button', value: 'Next', id: 'question-next'});
  buttonGroupNavigation.append(stop, next);

  // When user presses 'Next', the timer gets stopped and the given answers gets checked
  next.addEventListener('click', (e) => {
    e.preventDefault();
    clearInterval(timer);
    checkQuestion();
  }); 

  // When the user presses 'Stop', the timer gets stopped, the given answers gets checked,
  // the isStop boolean is set to true, to STOP the quiz.
  stop.addEventListener('click', (e) => {
    e.preventDefault();
    clearInterval(timer);
    checkQuestion(true);
  })

  // Progress-bar is build
  const outerDiv = createContainer({classList: ['progress-outer']});
  const innerDiv = createContainer({classList: ['progress-inner']});
  outerDiv.appendChild(innerDiv);

  $quizArea.append( heading, heading2, outerDiv, buttonGroup, buttonGroupNavigation);
}

/**
 * All the buttons get looped trough to check if they 'are pressed'
 * If the last question is selected or boolean is set to true: Results are shown
 * else: next Question is shown
 * @param { Boolean } isStop 
 */
const checkQuestion = (isStop = false) => {
  const questions = readFromStorage('questions');

  const answers = {};
  const $answers = document.querySelectorAll('.button--answer');

  // Object gets build with key-value pair, afterwards pushed to global variable 'allAnswers'
  for (const answer of $answers) {
    if(answer.classList.contains('clicked')) answers[answer.id] = "true"
    else answers[answer.id] = "false";
  }
  allAnswers.push(answers);

  // If boolean is set to true, results are shown
  // If there are still questions left, next question gets shown,
  // Else the results get shown
  if(isStop) {
    showResults();
  } else if(activeQuestion < questions.length) {  
    showQuestion();
  } else { 
    showResults();
  }
}

/**
 * Question-info is shown in already created DOM-elements, timer is activated
 */
const showQuestion = () => {
  setTimer();
  const questions = readFromStorage('questions');
  const selectedQuestion = questions[activeQuestion];
  const $title = document.getElementById('question-title');
  const $progress = document.getElementById('question-progress');
  const $questionArea = document.getElementById('question-area');

  $title.innerHTML = `Question ${activeQuestion+1} : ${selectedQuestion.question}`;
  $progress.innerText = `Question ${activeQuestion+1} / ${questions.length}`;
  
  $questionArea.innerText = '';
  
  // Possible answers for selectedQuestion gets show IF it isn't 'null'
  // Button toggles active state of selected element
  for (const key in selectedQuestion.answers) {
    if (selectedQuestion.answers[key] !== null) {
      const button = createContainer({id: key, content: selectedQuestion.answers[key], classList: ['button--answer']});
      button.addEventListener('click', (e) => {
        e.preventDefault();
        checkActiveClass(e);
      })
      $questionArea.appendChild(button);
    }
  }

  // Next question number is set
  activeQuestion++
}

/**
 * 'clicked'-class gets toggled on button
 * IF it ISN'T multiple choice, all the other buttons get checked to remove 'clicked'-class
 * @param { Event } e 
 */
const checkActiveClass = (e) => {
  const questions = readFromStorage('questions');
  const question = questions[activeQuestion-1];
  const $buttons = document.querySelectorAll('.button--answer');

  e.target.classList.toggle('clicked');

  for (const button  of $buttons) {
    if(question.multiple_correct_answers === "false") {
      if(button.classList.contains('clicked') && button.id !== e.target.id) {
        button.classList.remove('clicked')
      } 
    } 
  }
}

/**
 * Global Timer gets set for 15s
 */
const setTimer = () => {
  time = 15;

  const progress = document.querySelector('.progress-inner');
  progress.style.width = '0%';

  // Interval is set to 1s,
  // Progress-div gets updated
  // if time reaches 0, answers get checked
  timer = setInterval(() => {
    time--;
    if(time >= 0) {
      const progress = document.querySelector('.progress-inner');
      progress.style.width = (100-(6.666*time))  + '%';
    } else {
      console.log('einde tijd');
      clearInterval(timer);    
      checkQuestion();
    }
  },1000);
}

/**
 * When All questions are answered or Quiz is 'stopped', results get shown
 */
const showResults = () => {
  const questions = readFromStorage('questions');

  // Username + 'score' gets shown
  $quizArea.innerHTML = '';
  const heading = createHeading({type: 2, id: 'results-title'});
  const scoreText = createSpan({classList: ['score']});
  heading.innerHTML = `${currentUser}, these are your results`;
  $quizArea.append(scoreText, heading);

  // All questions get looped trough, user answers & correct answers get shown
  questions.forEach((question, i) => {
    const questionTitle = createHeading({type: 2, id: 'results-question', classList: ['results-question-title','hidden']});
    questionTitle.textContent = `Question ${i+1}: ${question.question}`;

    // If the user presses the title, the answers for that question gets shown
    questionTitle.addEventListener('click', () => {
      questionTitle.classList.toggle('hidden');
    })

    // Container is created to 'hide' answers
    const questionContent = createContainer({classList: ['results-question-content']});  
    const subTitle = createHeading({type: 4, classList: ['subTitle']});
    subTitle.textContent = 'Your answers:';
    const userAnswersList = createUnorderedList({classList: ['results-userAnswers']})
    
    const subTitleCorrect = createHeading({type: 4, classList: ['subTitle']});
    subTitleCorrect.textContent = 'Correct answers:';
    const correctAnswersList = createUnorderedList({classList: ['results-correctAnswers']})
    
    const answers = Object.values(question.answers);
    let correctAnswers = Object.values(question.correct_answers);
    
    // If the Quiz gets stopped, the allANswers Array will be 'smaller' than the questions Array
    if(i < allAnswers.length) {
      // The correctAnswers gets sliced to have the correct amount of possible answers
      let userAnswers = Object.values(allAnswers[i]);
      correctAnswers = correctAnswers.slice(0, userAnswers.length);
      
      // The user Answers & correct answers get joined to 1 string for ex 'true,false,true,true,false....'
      // If ALL answers are correct, "1" gets added to the score
      const ua  = userAnswers.join(',');
      const ca = correctAnswers.join(',');
      if(ca === ua) {
        console.log('+1');
        score++;
      }
    
      // All the User Answers get looped trough,
      // If the user selected the button, it gets added to the UL of user-answers
      // If the answer matches the correct answers, the css-class 'correct' is added to the title
      // else the 'incorrect' class gets added
      userAnswers.forEach((uA,i) => {
        if(uA === "true") {
          const li = createListItem({classList: ['user-answer']});
          li.textContent = answers[i];
          userAnswersList.appendChild(li);

          if(correctAnswers[i] === "true") {
            questionTitle.classList.add('correct');
            li.classList.add('correct');
          } else {
            questionTitle.classList.add('incorrect');
            li.classList.add('incorrect');
          }
        }
      });

      // If the user didn't press any button or time ran out, the class 'skipped' gets added to the title,
      // li get's the content 'YOu skipped this question'
      let allFalse = ["false","false","false","false","false","false","false"];
      allFalse =  allFalse.slice(0,userAnswers.length);
      allFalse = allFalse.join(',');
      if(allFalse === ua) {
        userAnswersList.innerHTML = '';
        const li = createListItem({classList: ['user-answer']});
        li.textContent = 'You skipped this question';
        li.classList.add('skipped');
        userAnswersList.appendChild(li);
        questionTitle.classList.add('skipped');
      }

      // All the correct answers get looped trough, if "true" it gets added to the correct-answers UL
      correctAnswers.forEach((cA,i) => {
        if(cA === "true") {
          const li = createListItem({classList: ['correct-answer']});
          li.textContent = answers[i];
          correctAnswersList.appendChild(li);
        }
      });
    } 
    
    // If the Quiz got Stopped earlier, the array would be smaller, 
    // On the user-answers it'll be defined as 'skipped'
    // All the correct answers get shown 
    else {
      userAnswersList.innerHTML = '';
      const li = createListItem({classList: ['user-answer']});
      li.textContent = 'You skipped this question';
      li.classList.add('skipped');
      userAnswersList.appendChild(li);
      questionTitle.classList.add('skipped');

      correctAnswers.forEach((cA,i) => {
        if(cA === "true") {
          const li = createListItem({classList: ['correct-answer']});
          li.textContent = answers[i];
          correctAnswersList.appendChild(li);
        }
      })
    }

    questionContent.append(subTitle, userAnswersList, subTitleCorrect, correctAnswersList);
      $quizArea.append(questionTitle, questionContent);
  });

  // Score gets adjusted in the header
  scoreText.textContent = `${score} / ${questions.length}`;
    }

window.addEventListener('DOMContentLoaded', init);

const randomWords = ["hello", "world", "price", "is", "be", "he", "she", "of", "lean", "ready", "kid", "crawl", "absorb", "fuzzy", "reply", "late", "vessel", "do", "street", "neck", "ban", "fear", "silly", "quiet", "fair", "vanish", "permit", "compare", "hill", "loose", "drink", "wild", "pail", "want", "cute", "wobble", "own", "bat", "ball", "secret", "cold", "yarn", "clean", "collect", "coil", "cable", "refuse", "cry", "party", "fruit", "face", "bouncy", "home", "second", "cats", "strip", "drag", "uncle", "hose", "this", "angle", "pedal", "mail", "way", "legal", "trucks", "feeble", "things", "stone", "guide", "baby", "damage", "tickle", "guess", "care", "basket", "square", "purple", "orange", "apple", "grapes", "banana", "melon", "red", "blue", "green", "white", "black", "motivation", "toy", "bottle", "house", "castle", "curtain", "program", "laptop", "tablet", "phone", "desk", "chair", "cable", "scratch", "internet", "script", "video", "pretty", "towel", "movie", "window", "great", "joy", "a", "an", "the", "boy", "girl", "child", "second", "diamond", "gold", "silver", "record", "up", "down", "manage", "kick", "lift", "tip", "exciting", "car", "hit", "bus", "scooter", "bike", "pull", "push", "dark", "light", "colors", "version", "performance", "trick", "best", "dynamic", "code", "verbose", "heal"];
let quoteWords = [];
const textElement = document.querySelector(".text"), inputElement = document.querySelector(".input"), timerElement = document.querySelector(".timer"), modeElementsArray = document.querySelectorAll(".mode .text-button"), timeElementsArray = document.querySelectorAll(".time .text-button"), caretElement = document.querySelector(".caret"), timeElement = document.querySelector(".time"), typingTestElement = document.querySelector(".typing-test"), resultElement = document.querySelector(".result"), wpmElement = document.querySelector(".wpm"), accElement = document.querySelector(".acc");
let activeWordElement, activeWordInd = 0, prevWordText, prevInputLength, activeWordText, wordCorrectlyTyped, mode = "random", time = 30, timer, testStarted = false, countDown, countUp, lineNo = 1, firstLineElements = [], acc, wpm, correctLetters, incorrectLetters, correctWords;

modeElementsArray.forEach(modeElement => {
   modeElement.onclick = () => {
      if (!modeElement.classList.contains("active")) {
         modeElementsArray.forEach(modeElement2 => {
            modeElement2.classList.remove("active");
         })
         modeElement.classList.add("active");
         mode = modeElement.innerText;
         timeElement.style.visibility = (modeElement.innerText == "quote" ? "hidden" : "visible");
         restartTest();
      }
   }
})

timeElementsArray.forEach(timeElement => {
   timeElement.onclick = () => {
      if (!timeElement.classList.contains("active")) {
         time = timeElement.innerText;
         timeElementsArray.forEach(timeElement2 => {
            timeElement2.classList.remove("active");
         })
         timeElement.classList.add("active");
         restartTest();
      }
   }
})

inputElement.addEventListener("keydown", (event) => {

   if (event.key == ' ' && inputElement.value != '') {
      if (wordCorrectlyTyped) correctWords++;
      else activeWordElement.classList.add("error");
      activeWordInd++;
      inputElement.value = '';
      activeWordElement.classList.remove("active");
      if (activeWordElement.nextSibling == null) { // For quote mode
         time = timer;
         stopTest();
      }
      else {
         activeWordElement = activeWordElement.nextSibling;
      }
      activeWordElement.classList.add("active");
      activeWordText = (mode == "random" ? randomWords : quoteWords)[activeWordInd];

      // Allow more words by deleting previous if 2 lines breaked
      if (activeWordElement.getBoundingClientRect().top != activeWordElement.previousSibling.getBoundingClientRect().top) {
         lineNo++;
         if (lineNo == 3) {
            let currWordElement = textElement.firstChild;
            while (currWordElement.previousSibling == null || currWordElement.getBoundingClientRect().top == currWordElement.previousSibling.getBoundingClientRect().top) {
               firstLineElements.push(currWordElement);
               currWordElement = currWordElement.nextSibling;
            }
            while (firstLineElements.length > 0) firstLineElements.pop().remove();
            lineNo--;
         }
      }
   }

   if (event.key == "Backspace" && inputElement.value == '' && activeWordElement.previousSibling != null && activeWordElement.previousSibling.classList.contains("error")) {
      activeWordInd--;
      activeWordElement.classList.remove("active");
      activeWordElement = activeWordElement.previousSibling;
      activeWordElement.classList.add("active");
      activeWordElement.classList.remove("error");
      activeWordText = (mode == "random" ? randomWords : quoteWords)[activeWordInd];
      if (activeWordElement.getBoundingClientRect().top != activeWordElement.nextSibling.getBoundingClientRect().top) {
         lineNo--;
      }
      // Regenerate input
      setTimeout(() => {
         activeWordElement.childNodes.forEach(letterElement => {
            if (letterElement.classList.contains("correct") || letterElement.classList.contains("extra")) inputElement.value += letterElement.innerText;
            else if (letterElement.classList.contains("incorrect")) inputElement.value += "$";
         })
         moveCaret();
      }, 1);
   }
})

inputElement.addEventListener("input", () => {

   // Start test
   if (!testRunning) {
      testRunning = true;
      shouldTimerRun(true);
   }

   // Re-render letters of active word
   activeWordElement.innerHTML = '';
   activeWordText.split('').forEach(letter => {
      const letterElement = document.createElement("letter");
      letterElement.innerText = letter;
      activeWordElement.append(letterElement);
   })

   inputElement.value = inputElement.value.slice(0, 15).trim();
   const letterElementsArray = activeWordElement.children;
   const inputText = inputElement.value;
   const inputTextLength = inputText.length;

   if (inputTextLength > prevInputLength) {
      if (inputText[inputTextLength - 1] != activeWordText[inputTextLength - 1]) incorrectLetters++;
      else correctLetters++;
   }

   // Matching letters
   wordCorrectlyTyped = true;
   for (let i = 0; i < Math.max(inputTextLength, activeWordText.length); i++) {
      if (i >= activeWordText.length) {
         const letterElement = document.createElement("letter");
         letterElement.innerText = inputText[i];
         letterElement.classList.add("incorrect", "extra");
         activeWordElement.append(letterElement);
         wordCorrectlyTyped = false;
      }
      else if (i >= inputText.length) {
         if (letterElementsArray[i].classList.contains("extra")) letterElementsArray[i].remove();
         wordCorrectlyTyped = false;
      }
      else if (inputText[i] == activeWordText[i]) {
         letterElementsArray[i].classList.add("correct");
      }
      else if (inputText[i] != activeWordText[i]) {
         letterElementsArray[i].classList.add("incorrect");
         wordCorrectlyTyped = false;
      }
   }

   prevInputLength = inputTextLength;
   moveCaret();
})

function moveCaret() {
   let currLetterPos = activeWordElement.childNodes[Math.max(inputElement.value.length - 1, 0)].getBoundingClientRect();
   caretElement.style.top = currLetterPos.top + "px";
   caretElement.style.left = (inputElement.value.length == 0 ? currLetterPos.left : currLetterPos.right) + "px";
}

function shouldTimerRun(flag) {
   if (flag) {
      timerElement.classList.remove("hidden");
      if (mode == "random") {
         timer = time;
         timerElement.innerText = timer;
         countDown = setInterval(() => {
            timer--;
            timerElement.innerText = timer;
            if (timer == 0) stopTest();
         }, 1000);
      }
      else if (mode == "quote") {
         timer = 0;
         timerElement.innerText = timer;
         countUp = setInterval(() => {
            timer++;
            timerElement.innerText = timer;
         }, 1000);
      }
   }
   else {
      timerElement.classList.add("hidden");
      clearInterval(countDown);
      clearInterval(countUp);
   }
}

async function getQuote() {
   return fetch("https://api.quotable.io/random")
      .then(response => response.json())
      .then(data => data.content)
}

async function restartTest() {
   shouldTimerRun(false);
   timer = time;
   testRunning = false;
   activeWordInd = 0;
   lineNo = 1;
   correctWords = 0;
   prevInputLength = 0;
   correctLetters = incorrectLetters = 0;
   textElement.innerHTML = '';
   inputElement.value = '';

   if (mode == "random") {
      randomWords.sort(() => Math.random() - 0.5);
      renderWords(randomWords);
   }
   else if (mode == "quote") {
      let quote = await getQuote();
      quoteWords = quote.split(" ");
      renderWords(quoteWords);
   }

   resultElement.classList.add("hidden");
   typingTestElement.classList.remove("hidden");
   inputElement.focus();
   moveCaret();
}

function stopTest() {
   shouldTimerRun(false);
   renderStats();
   typingTestElement.classList.add("hidden");
   resultElement.classList.remove("hidden");
}

function renderWords(wordsArray) {
   wordsArray.forEach((word, i) => {
      const wordElement = document.createElement("div");
      wordElement.classList.add("word");
      if (i == 0) {
         wordElement.classList.add("active");
         activeWordElement = wordElement;
      }
      word.split('').forEach(letter => {
         const letterElement = document.createElement("letter");
         letterElement.innerText = letter;
         wordElement.append(letterElement);
      })
      activeWordText = activeWordElement.innerText;
      textElement.append(wordElement);
   })
}

function renderStats() {
   acc = Math.round(correctLetters / (correctLetters + incorrectLetters) * 100);
   wpm = Math.round(correctWords * (60 / time));
   wpmElement.innerText = wpm;
   accElement.innerHTML = acc + "<span class='acc-percent-symbol rgb'>%</span>";
}

restartTest();
// F.A.Q
const faqList = document.querySelectorAll(".faq__list-elem");

function closeAnswer(elem) {
    const answer = elem.querySelector(".faq__list-elem__answer");
    elem.classList.remove("active");
    answer.style.height = `0px`;
}

function closeOpenedAnswers() {
    faqList.forEach((elem) => {
        closeAnswer(elem)
    });
}

faqList.forEach((elem) => {
    const question = elem.querySelector(".faq__list-elem__question");
    const answer = elem.querySelector(".faq__list-elem__answer");
    question.addEventListener("click", () => {
        if (elem.classList.contains("active")) {
            closeAnswer(elem);
            return;
        }
        closeOpenedAnswers();
        elem.classList.toggle("active");
        answer.style.height = `${answer.scrollHeight + 36}px`;
    });
});
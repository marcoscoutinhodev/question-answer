const express = require("express");
const bodyParser = require("body-parser");
const connection = require("./database/database");

//Models
const Question = require("./database/Question");
const Answer = require("./database/Answer");

const app = express();
const port = 3000;

// Database
connection
    .authenticate()
    .then(() => {
        console.log("Connected Database");
    })
    .catch((err) => {
        console.log(`An unexpected error has occurred: ${err}`);
    });

app.set("view engine", "ejs");  // Informando a Engine EJS
app.use(express.static("public"));  // Informando pro Express que os arquivos estaticos tao na pasta Public

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    Question
        .findAll({ 
            raw: true, order: [ ["id", "desc"] ]    // ASC = Crescente | DESC = Decrescente
        }) 
        .then((questions) => {
            res.render("index", {
                questions
            });
        })
});

app.get("/newquestion", (req, res) => {
    res.render("newquestion");
});

app.post("/savequestion", (req, res) => {
    const { title, description } = req.body;
    
    if(title && description) {
        Question
            .create({
                title,
                description 
            })
            .then(() => {
                res.redirect('/');
            });
    } else {
        res.redirect('/');
    }
});

app.get("/question/:id", (req, res) => {
    const idLink = req.params.id;

    Question
        .findOne({
            where: { id: idLink }
        })
        .then((question) => {
            if(question) {
                Answer.findAll({
                    where: {
                        questionId: question.id
                    },
                    order: [ ["id", "desc"] ]
                })
                .then((answers) => {
                    res.render("question", {
                        question,
                        answers
                    });
                });
            } else {
                res.redirect("/");
            }
        })
});

app.post("/answer", (req, res) => {
    const { answer, questionId } = req.body;

    if(answer && questionId) {
        Answer
            .create({
                answer,
                questionId
            })
            .then(() => {
                res.redirect(`/question/${questionId}`);
            });
    } else {
        res.redirect('/');
    }
});

app.listen(port, () => {
    console.log("Server is Running!");
})
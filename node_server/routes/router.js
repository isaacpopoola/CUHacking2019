const express = require("express");
const router = express.Router();

const gitHubUser_GetData = require('../get_data');
const test = require('../test');
const User = require("../models/user");

router.route("/")
    .get((req,res) => {
        res.redirect('home');
    });

router.route("/home")
    .get((req,res) => {
        res.render('home', { welcomeText: "Welcome to our GitHub Analyzer" });
    });

router.route("/gitHubUsers")
    .get((req,res) => {
        User.find().then((foundUser) => {
            // res.send(foundUser)
            res.render('home', { welcomeText: "Welcome to our GitHub Analyzer" });
        }).catch((err) => res.status(400).send(err) );
    })
    .post((req,res) => {
        const userName = req.body.userName;
        delete req.body.userName;
        const repositories = req.body.repositories;

        const newUser = {userName, repositories};

        User.create(newUser).then(() => {
            console.log("Successfully added a new user.");
            res.render('home', {welcomeText: 'Successfully added a new user.'});
        })
            .catch((err) => {
                res.status(400).send(err);
            });
    });

router.route("/gitHubUser")
    .get(async (req,res) => {
        const gitHubUsername = req.query.gitHubUsername;
        let nestedFoundUser;
        User.findOne({userName: gitHubUsername}, { _id: 0 }).then(async (foundUser) => {
            if(!!foundUser) {
                console.log("Successfully found user");
                console.log(JSON.stringify(foundUser,undefined,2));
                nestedFoundUser = test.translateFromDatabase(foundUser);
                console.log(JSON.stringify(nestedFoundUser,undefined,2));
                res.render('user', { 
                    foundUser: nestedFoundUser 
                });
            } else {
                // Makes query to restful api
                // save JSON to database
                // return JSON
                try {
                    const data = await gitHubUser_GetData.get_all(gitHubUsername);
                    nestedFoundUser = {
                        userName: gitHubUsername,
                        repositories: data
                    };
                    const userData = test.translateToDatabase(nestedFoundUser);
                    console.log(JSON.stringify(userData,undefined,2));
                    const newUser = new User(userData);
                    newUser.save().then(() => {
                        console.log("Did NOT find any user");
                        return res.render('user', { foundUser: userData });
                    });
                }catch(e) {
                    console.log(e);
                }
               
            }
        })
        .catch((err) => res.status(400).send(err));
    });
    // .put((req,res) => {
    //     const userName = req.body.userName;
    //     delete req.body.userName;
    //     const repositories = req.body.repositories;

    //     User.replaceOne(
    //         {userName: userName},
    //         {userName: userName, repositories: repositories}
    //     ).then(() => {
    //         console.log('UserName: ' + userName);
    //         console.log(repositories);
    //         res.status(200).send(repositories);
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //         res.status(400).send(err);
    //     });
    // })
    // .patch((req,res) => {
    //     User.updateOne(
    //         {userName: req.params.gitHubUsername},
    //         {$set: req.body}
    //     ).then(() => res.send("Successfully updated user."))
    //     .catch((err) => res.status(400).send(err));
    // })
    // .delete((req,res) => {
    //     User.deleteOne({userName: req.params.gitHubUsername}).then(() => {
    //         res.send("User has been sucessfully deleted");
    //     })
    //     .catch((err) => res.status(400).send(err));
    // });

module.exports = router;
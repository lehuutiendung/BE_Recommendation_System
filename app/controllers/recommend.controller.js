const Post = require("../models/post.model");
const User = require("../models/user.model");
const React = require("../models/react.model");
const Base = require("./base.controller");
const mongoose = require('mongoose');
const State = require("../enums/state.js");
const fs = require('fs');

module.exports = {
    recommendPost: async(req, res, next) => {
        // try {
        //     var spawn = require('child_process').spawn;
        //     var process = spawn('python', ['../MachineLearning/main.py']  
        //     );
        //     process.stdout.on('data', (data) => {
        //         res.write(data.toString());
        //     });
        
        //     process.on('close', (code) => {
        //         if (code !== 0) {
        //             console.log(`grep process exited with code ${code}`);
        //         }
        //         res.end(); // finish the request
        //     });
        // } catch (error) {
        //     next(error);
        // }

        try {
            let rawdata = fs.readFileSync('G:/SocialNetwork_RecommendationSystems/BE-social-network/app/controllers/fakedata/view_data.json');
            // let view_data = JSON.parse(rawdata);
            // console.log(view_data);
            var spawn = require('child_process').spawn;
            var process = spawn('python', ['../MachineLearning/recommend_main.py', rawdata]  
            );
            process.stdout.on('data', (data) => {
                res.write(data.toString());
            });
        
            process.on('close', (code) => {
                if (code !== 0) {
                    console.log(`grep process exited with code ${code}`);
                }
                res.end(); // finish the request
            });
        } catch (error) {
            next(error);
        }
    },
}
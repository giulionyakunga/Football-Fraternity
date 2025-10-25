const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require("fs");
const axios = require('axios');
const { execFile } = require("child_process");
const { Op } = require('sequelize');
const ping = require('ping');
const path = require('path')



const server = express();
server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const User = require('./src/database/models/User');
const Footballer = require('./src/database/models/Footballer');
const Message = require('./src/database/models/Message');
const Request = require('./src/database/models/Request');


server.post('/api2/add_user', async (req, res) => {
    console.log("User: ", req.body)

    const first_name = req.body.first_name;
    const middle_name = req.body.middle_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
    const role = req.body.role;
    const password = req.body.password;
    const region = req.body.region;
    const district = req.body.district;
    const ward = req.body.ward;
    const street = req.body.street;

    const duplicateCheck = await checkDuplicateFields(0, req.body);
    if (duplicateCheck) {
        console.log(duplicateCheck); // Log the custom error message
        res.send(duplicateCheck);
    } else {

        User.create({
            first_name: first_name,
            middle_name: middle_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number,
            role: role,
            password: password,
            region: region,
            district: district,
            ward: ward,
            street: street,
            selected_card_type: "",
            card_number: "",
        }
        ).catch(async err => {
            console.log("User not created, Error : ", err);
        }).then(async (user) => {
            if (user) {
                res.send("User added successfully!");
            }else {
                res.send("User not created!");
            }
        })

    }

});

server.post('/api2/update_user', async (req, res) => {
    console.log("User: ", req.body)

    const user_id = req.body.user_id;
    const first_name = req.body.first_name;
    const middle_name = req.body.middle_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
    const password = req.body.password;
    const region = req.body.region;
    const district = req.body.district;
    const ward = req.body.ward;
    const street = req.body.street;

    const duplicateCheck = await checkDuplicateFields_4(req.body);
    if (duplicateCheck) {
        console.log(duplicateCheck); // Log the custom error message
        res.send(duplicateCheck);
    } else {
        await User.findOne({ where: { id: user_id } })
        .catch(err => {
            console.error("User not found, Error : ", err);
        })
        .then((user) => {
            if(user) {
                user.first_name = first_name;
                user.middle_name = middle_name;
                user.last_name = last_name;
                user.email = email;
                user.phone_number = phone_number;
                if (password) user.password = password;
                user.region = region;
                user.district = district;
                user.ward = ward;
                user.street = street;

                user.save()
                .catch(async err => {
                    console.log("User not saved, Error : ", err);
                }).then(async (user) => {
                    if (user) {
                        res.send("User profile updated successfully!");
                    }else {
                        res.send("User profile not updated!");
                    }
                })
                
            }
        })
    }

});

async function checkDuplicateFields(data) {
    const { full_name } = data;    

    let duplicateFields = [];

    try {
        // Check if full_name exists
        const fullNameExists = await Footballer.findOne({ where: { full_name } })
        .catch(err => {
            console.error("Footballer not found, Error : ", err);
        });

        if (fullNameExists) {
            duplicateFields.push(full_name);
        }

        // If no duplicates, return null
        if (duplicateFields.length === 0) {
            return null; // No duplicates found, safe to insert
        }

        if(fullNameExists){
            return `Footballer with this name already exist: ${duplicateFields.join(', ')}`;
        }
        return;
    } catch (error) {
        console.error('Error checking for duplicate fields:', error);
        return 'An error occurred while checking for duplicates.';
    }
}

async function checkDuplicateFields1(data) {
    const { full_name, id } = data;  

    let duplicateFields = [];

    try {
        // Check if full_name exists
        const fullNameExists = await Footballer.findOne({ where: { full_name } })
        .catch(err => {
            console.error("Footballer not found, Error : ", err);
        });

        if(fullNameExists) {            

            if (fullNameExists.id != id) {
                duplicateFields.push(full_name);
            }

            // If no duplicates, return null
            if (duplicateFields.length === 0) {
                return null; // No duplicates found, safe to insert
            }

            if(fullNameExists){
                return `Footballer with this name already exist: ${duplicateFields.join(', ')}`;
            }
        }
        return;
    } catch (error) {
        console.error('Error checking for duplicate fields:', error);
        return 'An error occurred while checking for duplicates.';
    }
}

server.post('/add_footballer', async (req, res) => {
    console.log("Footballer: ", req.body);
  
    const { user_id, full_name, position, club, nationality, age, salary, preferred_foot, height, weight, matches, goals, assists, rating, contract_status, contract_start, contract_end, date_of_birth, footballer_image, file_type } = req.body;

    if (!footballer_image) {
        console.log('No image data received.');
        return res.status(400).send("Footballer image is required.");
    }

    const image_url = `footballer-${user_id}${Date.now()}${file_type}`;

    const duplicateCheck = await checkDuplicateFields(req.body);
    if (duplicateCheck) {
        console.log(duplicateCheck); // Log the custom error message
        res.send(duplicateCheck);
    } else {
        Footballer.create({
            full_name,
            position,
            club,
            nationality,
            age,
            salary,
            date_of_birth,
            preferred_foot: 'N/A',
            height,
            weight,
            matches,
            goals,
            assists,
            rating,
            contract_status,
            contract_start,
            contract_end,
            image_url
        }
        ).catch(async err => {
            console.log("Footballer not created, Error : ", err);
        }).then(async (footballer) => {
            if (footballer) {
                // Save image
                const imageBuffer = Buffer.from(footballer_image, 'base64');
                const uploadDir = path.join(__dirname, 'uploads/images');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir);
                }
                const imagePath = path.join(uploadDir, image_url);
                fs.writeFileSync(imagePath, imageBuffer);
                console.log(`Footballer Image saved at: ${imagePath}`);

                res.send("Footballer added successfully!");
            }else {
                res.send("Footballer not created!");
            }
        })
    }
});

server.post('/update_footballer', async (req, res) => {
    console.log("Footballer: ", req.body);
  
    const { user_id, id, full_name, position, club, nationality, age, salary, preferred_foot, height, weight, matches, goals, assists, rating, contract_status, contract_start, contract_end, date_of_birth, footballer_image, file_type } = req.body;

    // if (!footballer_image) {
    //     console.log('No image data received.');
    //     return res.status(400).send("Footballer image is required.");
    // }

    let image_url;
    if (file_type) {
        image_url = `footballer-${user_id}${Date.now()}${file_type}`;
    }

    const duplicateCheck = await checkDuplicateFields1(req.body);
    if (duplicateCheck) {
        console.log(duplicateCheck); // Log the custom error message
        res.send(duplicateCheck);
    } else {
        const footballer = await Footballer.findOne({ where: { id } })
        .catch(err => {
            console.error("Footballer not found, Error : ", err);
        });

        if(!footballer) {
            console.log("Footballer not found");
            return res.status(404).send("Footballer not found!");
        }

        const prev_image_url = footballer.image_url;

        footballer.full_name = full_name;
        footballer.position = position;
        footballer.club = club;
        footballer.nationality = nationality;
        footballer.age = age;
        footballer.salary = salary;
        footballer.date_of_birth = date_of_birth;
        footballer.preferred_foot = 'N/A';
        footballer.height = height;
        footballer.weight = weight;
        footballer.matches = matches;
        footballer.goals = goals;
        footballer.assists = assists;
        footballer.rating = rating;
        footballer.contract_status = contract_status;
        footballer.contract_start = contract_start;
        footballer.contract_end = contract_end;
        if(file_type) footballer.image_url = image_url;

        await footballer.save()
        .catch(err => {
            console.log("Footballer not updated, Error : ", err)
        })

        if (footballer_image) {
            // Save image
            const imageBuffer = Buffer.from(footballer_image, 'base64');
            const uploadDir = path.join(__dirname, 'uploads/images');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }

            const imagePath = path.join(uploadDir, image_url);
            fs.writeFileSync(imagePath, imageBuffer);
            console.log(`Footballer Image saved at: ${imagePath}`);

            const prevImagePath = path.join(__dirname, 'uploads/images', prev_image_url);
            fs.unlink(prevImagePath, (error) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        console.warn(prevImagePath + " file not found");
                    } else {
                        console.error('Error deleting file:', error);
                    }
                } else {
                    console.log(prevImagePath + " file deleted successfully");
                }
            });  

            res.send("Footballer updated successfully!");
        } else {
            res.send("Footballer updated successfully!");
        }
    }
});

server.get('/footballers/', async function (request, response) {
    try {
        const footballers = await Footballer.findAll();
        if(footballers){
            response.json(footballers);
        }
    } catch (err) {
        console.error("Footballer fetch error:", err);
        response.status(500).json({ error: "Failed to fetch Footballer" });
    }
});

// Route to get an image by name
server.get('/image/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '/uploads/images/', imageName);

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Getting image, imageName : ", imageName, ", imagePath : ", imagePath);

    // Check if the image exists and send it
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.log("An Error Occured: ", err)
            // res.status(404).json({ error: 'Image not found' });
        }
    });
});

server.post('/submit_request', async (req, res) => {
    console.log("Request: ", req.body);
    
    let random_string = '';
    const crypto = require('crypto');

    for (let i = 0; i < 5; i++) {
        random_string += `${crypto.randomInt(0, 9)}`;
    }
   
    const { name, phone_number, email, subject, case_title, opposing_party, description, service_type, consultancy_type, case_type, file_type, file_type1, file_type2, file_name, file_name1, file_name2, file, file1, file2 } = req.body;
    let content_type;
    let content_type1;
    let content_type2;
    let file_url;
    let file_url1;
    let file_url2;

    if(file_name) {
        const file_extension = file_name.split('.')[1];
        file_url = `request-${random_string}-${Date.now()}.${file_extension}`;
        content_type = `application/${file_extension}`
    }

    if(file_name1) {
        const file_extension = file_name1.split('.')[1];
        file_url1 = `request-${random_string}-1-${Date.now()}.${file_extension}`;
        content_type1 = `application/${file_extension}`
    }

    if(file_name2) {
        const file_extension = file_name2.split('.')[1];
        file_url2 = `request-${random_string}-2-${Date.now()}.${file_extension}`;
        content_type2 = `application/${file_extension}`
    }

    const request = await Request.create({
            client_name: name,
            phone_number,
            email,
            service_type,
            type: consultancy_type ? consultancy_type : case_type,
            subject: subject ? subject : `${case_title} with ${opposing_party}`,
            description,
            file_url,
            file_url1,
            file_url2,
    })
    .catch(async err => {
        console.log("Request not created, Error : ", err);
    })

    if(request) {
        if (file || file1 || file2) {
            // Save file1
            const uploadDir = path.join(__dirname, 'uploads/documents');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            
            let filePath;
            if(file_url && file) {
                const fileBuffer = Buffer.from(file, 'base64');
                filePath = path.join(uploadDir, file_url);
                fs.writeFileSync(filePath, fileBuffer);
            }

            // Save file1
            let filePath1;
            if(file_url1 && file1) {
                const fileBuffer1 = Buffer.from(file1, 'base64');
                filePath1 = path.join(uploadDir, file_url1);
                fs.writeFileSync(filePath1, fileBuffer1);
            }

            // Save file2
            let filePath2;
            if(file_url2 && file2) {            
                const fileBuffer2 = Buffer.from(file2, 'base64');
                filePath2 = path.join(uploadDir, file_url2);
                fs.writeFileSync(filePath2, fileBuffer2);
            }

            res.send("Request submitted successfully!");

            sendRequestEmail(name, phone_number, email, service_type, consultancy_type, subject, description, file_name, file_name1, file_name2, filePath, filePath1, filePath2, content_type, content_type1, content_type2 );

        } else {
            console.log('No file received.');
            
            res.send("Request submitted successfully!");

            sendRequestEmail(name, phone_number, email, service_type, consultancy_type, subject, description, "", "", "" );
        }
    }
});

server.get('/requests/', async function (request, response) {
    try {
        const requests = await Request.findAll();
        if(requests){
            response.json(requests);
        }
    } catch (err) {
        console.error("Request fetch error:", err);
        response.status(500).json({ error: "Failed to fetch Request" });
    }
});

server.post('/send_message', async (req, res) => {
    console.log("Message: ", req.body);
   
    const { name, phone_number, email, message } = req.body;
    
    const text_message = await Message.create({
        client_name: name,
        phone_number,
        email,
        text: message,
    })
    .catch(async err => {
        console.log("Message not created, Error : ", err);
    })

    if(text_message) {
        res.send("Message sent successfully!");
        sendMessageEmail(name, phone_number, email, message );
    }
});

server.get('/messages/', async function (request, response) {
    try {
        const messages = await Message.findAll();
        if(messages){
            response.json(messages);
        }
    } catch (err) {
        console.error("Message fetch error:", err);
        response.status(500).json({ error: "Failed to fetch Message" });
    }
});

const port = 8087;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    const { exec } = require('child_process');

    exec('dir', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    if(stdout) console.log(`stdout: ${stdout}`);
    if(stderr) console.error(`stderr: ${stderr}`);
    });
});


async function sendRequestEmail(name, phone_number, email, service_type, request_type, subject, message, file_name, file_name1, file_name2, path, path1, path2, content_type, content_type1, content_type2 ) {
    const nodemailer = require('nodemailer');
    try {
        console.log("Initiating email dispatch...");

        // Create reusable transporter object using the default SMTP transport

        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 587,
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: 'giulionyakunga@gmail.com',
        //         pass: 'japttnvreysoxzvs'
        //     }
        // });


        let transporter = nodemailer.createTransport({
            host: "mail.telabs.co.tz",   // replace with your Modoboa hostname or server IP
            port: 587,                   // 587 (STARTTLS) or 465 (SSL/TLS)
            secure: false,               // false = STARTTLS, true = SSL/TLS
            auth: {
                user: "no-reply@telabs.co.tz",   // use a real mailbox created in Modoboa
                pass: "NoReply123!"      // mailbox password
            },
            tls: {
                rejectUnauthorized: false   // allow self-signed certs if using one
            }
        });

        // Professional email content
        let htmlContent =  "<html>" +
                            "<head>" +
                            "<meta charset=\"UTF-8\">" +
                            "</head>" +
                            "<body>" +
                            "<br>" +
                            "<p style=color:blue;>Please find your Client request below </p>" +
                            "<hr>" +
                            "<p style=color:black;>Name : " + name + "</p>" +
                            "<p style=color:black;>phone_number : " + phone_number + "</p>" +
                            "<p style=color:black;>Email : " + email + "</p>" +
                            "<p style=color:black;>Service Type : " + service_type + "</p>" +
                            "<p style=color:black;>Request Type : " + request_type + "</p>" +
                            "<p style=color:black;>Subject : " + subject + "</p>" +
                            "<p style=color:black;>Message : " + message + "</p>" +
                            "<br>" +
                            "<br>" +
                            "<p style=color:black;>Regards :</p>" +
                            "<p style=color:black;>Admin</p>" +
                            "<p style=color:black;>Football Fraternity Company Limited</p>" +
                            "</body>" +
                            "</html>";
        
        // Send mail with defined transport object
        const emailSubject = 'Service Request - Football Fraternity Website';
        const emails = ['giulionyakunga@gmail.com'];
        
        console.log("Recipient addresses: ", emails);
        
        let mailOptions = {
            from: '"Football Fraternity Website" <no-reply@telabs.co.tz>',
            to: emails,
            subject: emailSubject,
            html: htmlContent,
            attachments: (file_name !== "" || file_name1 !== "" || file_name2 !== "") ? [{
                filename: file_name,
                path: path,  // Provide the file path here
                contentType: content_type,
                cid: 'content_id' // Content ID for embedding in HTML (if needed)
            },{
                filename: file_name1,
                path: path1,  // Provide the file path here
                contentType: content_type1,
                cid: 'content_id1' // Content ID for embedding in HTML (if needed)
            }, {
                filename: file_name2,
                path: path2,  // Provide the file path here
                contentType: content_type2,
                cid: 'content_id2' // Content ID for embedding in HTML (if needed)
            }
        ] : []
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email successfully dispatched: ' + info.response);
        return "Your request has been successfully sent to the email address.";
        
    } catch (error) {
        console.error("Error sending email:", error);
        return "We apologize, but we encountered an issue while sending your request. Please try again later or contact our support team.";
    }
}

async function sendMessageEmail(name, phone_number, email, message ) {
    const nodemailer = require('nodemailer');
    try {
        console.log("Initiating email dispatch...");

        // Create reusable transporter object using the default SMTP transport

        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 587,
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: 'giulionyakunga@gmail.com',
        //         pass: 'japttnvreysoxzvs'
        //     }
        // });


        let transporter = nodemailer.createTransport({
            host: "mail.telabs.co.tz",   // replace with your Modoboa hostname or server IP
            port: 587,                   // 587 (STARTTLS) or 465 (SSL/TLS)
            secure: false,               // false = STARTTLS, true = SSL/TLS
            auth: {
                user: "no-reply@telabs.co.tz",   // use a real mailbox created in Modoboa
                pass: "NoReply123!"      // mailbox password
            },
            tls: {
                rejectUnauthorized: false   // allow self-signed certs if using one
            }
        });

        // Professional email content
        let htmlContent =  "<html>" +
                            "<head>" +
                            "<meta charset=\"UTF-8\">" +
                            "</head>" +
                            "<body>" +
                            "<br>" +
                            "<p style=color:blue;>Please find your Client Message below </p>" +
                            "<hr>" +
                            "<p style=color:black;>Name : " + name + "</p>" +
                            "<p style=color:black;>phone_number : " + phone_number + "</p>" +
                            "<p style=color:black;>Email : " + email + "</p>" +
                            "<p style=color:black;>Message : " + message + "</p>" +
                            "<br>" +
                            "<br>" +
                            "<p style=color:black;>Regards :</p>" +
                            "<p style=color:black;>Admin</p>" +
                            "<p style=color:black;>Football Fraternity Company Limited</p>" +
                            "</body>" +
                            "</html>";
        
        // Send mail with defined transport object
        const emailSubject = 'Client Message - Football Fraternity Website';
        const emails = ['giulionyakunga@gmail.com'];
        
        console.log("Recipient addresses: ", emails);
        
        let mailOptions = {
            from: '"Football Fraternity Website" <no-reply@telabs.co.tz>',
            to: emails,
            subject: emailSubject,
            html: htmlContent,
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email successfully dispatched: ' + info.response);
        return "Your request has been successfully sent to the email address.";
        
    } catch (error) {
        console.error("Error sending email:", error);
        return "We apologize, but we encountered an issue while sending your request. Please try again later or contact our support team.";
    }
}

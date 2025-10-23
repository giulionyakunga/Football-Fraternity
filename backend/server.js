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
const Message = require('./src/database/models/Message')


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
    if (!file_type) {
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

        console.log("Done Saving Footballer")

        if (footballer_image) {
            console.log("Saving Image")
            // Save image
            const imageBuffer = Buffer.from(footballer_image, 'base64');
            const uploadDir = path.join(__dirname, 'uploads/images');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            const imagePath = path.join(uploadDir, image_url);
            fs.writeFileSync(imagePath, imageBuffer);
            console.log(`Footballer Image saved at: ${imagePath}`);

            console.log("Deleting Image")

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

            console.log("Done deletng Image")

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


function sendEmailMessage(fault_name, location, severity, status) {
    const reported_at = getHumanReadableDateTime();
    return new Promise(async (resolve, reject) => {
        console.log("Sending Email...");
        const nodemailer = require('nodemailer');

        // Fault descriptions for active faults (status == 1)
        const faultDescriptionsActive = {
            'LOW_PRESSURE': 'Low hydraulic pressure detected in autorecloser mechanism. This may affect operation reliability and should be addressed promptly.',
            'HIGH_TEMPERATURE': 'Elevated temperature detected in autorecloser compartment. Excessive heat can damage components and reduce equipment lifespan.',
            'DOOR_OPEN': 'Autorecloser enclosure door open detected. This poses safety risks and may expose equipment to environmental factors.',
            'AC_POWER_LOSS': 'Main AC power supply failure detected. System is operating on backup power. Verify power source and restoration timeline.',
            'BATTERY_LOW_VOLTAGE': 'Backup battery voltage below optimal level. Battery may need charging or replacement to ensure backup power availability.',
            'BATTERY_VOLTAGE_CRITICAL': 'Critical backup battery voltage level detected. Immediate attention required to prevent loss of backup power capability.',
            'BATTERY_ERROR': 'Battery system malfunction detected. This may affect backup power availability during outages.',
            'OVERCURRENT_I': 'Stage I overcurrent condition detected. This indicates a potential fault in the protected circuit.',
            'OVERCURRENT_II': 'Stage II overcurrent condition detected. The fault current has exceeded secondary protection thresholds.',
            'OVERCURRENT_III': 'Stage III overcurrent condition detected. Immediate action required - fault current approaching equipment limits.',
            'GROUND_E_F': 'Ground fault current detected. This indicates insulation failure or contact with earth potential.',
            'NEUTRAL_E_F': 'Neutral-to-earth fault detected. This may indicate unbalanced loading or insulation degradation.'
        };

        // Fault descriptions for cleared faults (status == 0)
        const faultDescriptionsCleared = {
            'LOW_PRESSURE': 'Hydraulic pressure has returned to normal operating range. System functionality restored.',
            'HIGH_TEMPERATURE': 'Temperature in autorecloser compartment has normalized. No further action required.',
            'DOOR_OPEN': 'Autorecloser enclosure door has been secured. Safety risk mitigated.',
            'AC_POWER_LOSS': 'Main AC power supply restored. System operating on primary power source.',
            'BATTERY_LOW_VOLTAGE': 'Backup battery voltage has returned to normal operating range.',
            'BATTERY_VOLTAGE_CRITICAL': 'Backup battery voltage has been restored to safe operating levels.',
            'BATTERY_ERROR': 'Battery system malfunction has been resolved. Backup power capability restored.',
            'OVERCURRENT_I': 'Stage I overcurrent condition has cleared. Circuit protection maintained.',
            'OVERCURRENT_II': 'Stage II overcurrent condition has cleared. System protection restored.',
            'OVERCURRENT_III': 'Stage III overcurrent condition has cleared. Emergency condition resolved.',
            'GROUND_E_F': 'Ground fault condition has cleared. Insulation integrity restored.',
            'NEUTRAL_E_F': 'Neutral-to-earth fault condition has cleared. System balance restored.'
        };

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'giulionyakunga@gmail.com',
                pass: 'japttnvreysoxzvs'
            }
        });

        // Determine color and status text based on severity and status
        let severityColor;
        let statusText;
        let statusColor;
        let description;
        
        if (status == 1) {
            statusText = 'ACTIVE FAULT';
            statusColor = '#ff0000';
            description = faultDescriptionsActive[fault_name] || 'Active fault condition detected. Immediate attention recommended.';

            if (severity.toLowerCase().includes('critical')) {
                severityColor = '#ff0000';
            } else if (severity.toLowerCase().includes('warning')) {
                severityColor = '#ffa500';
            } else {
                severityColor = '#000000';
            }
        } else {
            statusText = 'FAULT CLEARED';
            statusColor = '#008000';
            severityColor = '#008000'; // Green for cleared faults
            description = faultDescriptionsCleared[fault_name] || 'Fault condition has been resolved. System operating normally.';
        }

        let htmlContent = `
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        color: #0056b3;
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 14px;
                        color: #666;
                    }
                    .divider {
                        border-top: 1px solid #eaeaea;
                        margin: 20px 0;
                    }
                    .details-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .details-table th {
                        text-align: left;
                        padding: 8px;
                        background-color: #f5f5f5;
                        width: 30%;
                    }
                    .details-table td {
                        text-align: left;
                        padding: 8px;
                        border-bottom: 1px solid #eaeaea;
                    }
                    .status-banner {
                        padding: 10px;
                        color: white;
                        font-weight: bold;
                        text-align: center;
                        margin-bottom: 20px;
                        border-radius: 4px;
                    }
                    .action-required {
                        background-color: #fff8e1;
                        padding: 15px;
                        border-left: 4px solid #ffc107;
                        margin: 20px 0;
                        font-size: 14px;
                    }
                    .resolution-note {
                        background-color: #e8f5e9;
                        padding: 15px;
                        border-left: 4px solid #4caf50;
                        margin: 20px 0;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="status-banner" style="background-color: ${statusColor}">
                    ${status == 1 ? 'FAULT ALERT: IMMEDIATE ATTENTION REQUIRED' : 'FAULT RESOLUTION NOTIFICATION'}
                </div>
                
                <div class="header">Autorecloser Monitoring System - ${status == 1 ? 'Fault Notification' : 'Fault Cleared Notification'}</div>
                <div class="divider"></div>
                
                <table class="details-table">
                    <tr>
                        <th>Fault Name:</th>
                        <td>${fault_name.replace(/_/g, ' ')}</td>
                    </tr>
                    <tr>
                        <th>Location:</th>
                        <td>${location}</td>
                    </tr>
                    <tr>
                        <th>Severity:</th>
                        <td style="color: ${severityColor};">${severity}</td>
                    </tr>
                    <tr>
                        <th>Status:</th>
                        <td style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
                    </tr>
                    <tr>
                        <th>Reported At:</th>
                        <td>${reported_at}</td>
                    </tr>
                    <tr>
                        <th>Description:</th>
                        <td>${description}</td>
                    </tr>
                </table>
                
                ${status == 1 ? `
                <div class="action-required">
                    <strong>ACTION REQUIRED:</strong> This ${severity.toLowerCase()} fault requires attention to prevent equipment damage or service interruption.
                    ${severity.toLowerCase().includes('critical') ? 'IMMEDIATE RESPONSE NEEDED.' : 'Please investigate at the earliest opportunity.'}
                </div>
                ` : `
                <div class="resolution-note">
                    <strong>RESOLUTION NOTE:</strong> The fault condition has been cleared. No further action is required, but please review the event details for any necessary follow-up.
                </div>
                `}
                
                <div class="divider"></div>
                
                <div class="footer">
                    <p>This is an automated notification from the Autorecloser Monitoring System.</p>
                    <p>${status == 1 ? 'Please take appropriate action as required.' : 'This notification is for your records.'}</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>Grid Operations Team</strong></p>
                    <p>Tanzania Electronics Labs Co, Ltd</p>
                    <p>Email: operations@telabs.co.tz | Phone: +255 672 120 941</p>
                </div>
            </body>
        </html>`;
                 
        // send mail with defined transport object
        const email_subject = status == 1 
            ? `[GRID ALERT] ${severity.toUpperCase()}: ${fault_name.replace(/_/g, ' ')} at ${location}`
            : `[GRID RECOVERY] ${fault_name.replace(/_/g, ' ')} at ${location} - FAULT CLEARED`;
            
        const emails = ['giulionyakunga@gmail.com', 'julio.nyakunga@telabs.co.tz'];
        console.log("Emails : ", emails);
        
        let mailOptions = {
            from: 'Grid Monitoring System <giulionyakunga@gmail.com>',
            to: emails,
            subject: email_subject,
            html: htmlContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                resolve("Message Not Sent! An Error Occured : Errono = "+ error.errno + " code = " + error.code);
                console.log(error);
            } else {
                resolve("Your message was Sent successfully!");
                console.log('Email sent: ' + info.response);
            }
        });
    });
}

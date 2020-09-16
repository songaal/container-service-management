const nodemailer = require('nodemailer');

const Mail = {
    sendText: async ({to, subject, text}) => {
        return new Promise((resolve, reject) => {
            try {
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.smtp_user,
                        pass: process.env.smtp_password
                    }
                });

                let mailOptions = {
                    from: process.env.smtp_user,
                    to: to,
                    subject: subject,
                    text: text
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                        reject(error)
                    }
                    else {
                        resolve(info)
                        console.log('Email sent: ' + info.response);
                    }
                });
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    }
}

export default Mail;


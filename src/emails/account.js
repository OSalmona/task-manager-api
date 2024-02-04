const sgMail = require("@sendgrid/mail")
// const sendgridAPIKey = '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'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email , name)=>{
    sgMail.send({
        to: email,
        from:'Osama.Fawzy@codelabsys.com',
        subject:'Thanks for Joining us',
        text:`Welcome ${name} ,to Task app Community`
    })
}
const sendCancellationEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from:'Osama.Fawzy@codelabsys.com',
        subject:'Sorry to See you go',
        text:`Goodbye ${name} ,i hope to see u back again`
    })
}

module.exports = {
    sendWelcomeEmail ,
    sendCancellationEmail
}
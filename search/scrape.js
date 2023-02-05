
const fs = require('fs');
const axios = require('axios');

var ads, contacts;


function extractEmails(data, adUrl) {
    let emails = [];
    let matches = data.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
    // check if matches is not null
    if (matches !== null) {
        matches.forEach(email => {
            // console.log(`${adUrl} >> ${email}`)
            let elc = email.toLowerCase();
            let ulc = adUrl.toLowerCase()
            if (elc.includes(ulc))
                emails.push(elc);
        });
    } else {
        fs.writeFileSync(adUrl + '-BAD.html', data);
    }
    return [...new Set(emails)];
}

function extractPhoneNumber(str) {
    var phone_numbers = [];
    var regex = /0\d{7,9}/g;
    var match;
    while ((match = regex.exec(str)) !== null) {
        if (match[0][1] != 0)
            phone_numbers.push(match[0]);
    }
    return [...new Set(phone_numbers)];
}

async function getContatDetails(adsList) {  
    contacts = [];
    var phone_numbers, emails;
    //console.log((adsList.length) + ' Ads found in page');

    for (var i = 0; i < adsList.length; i++) {
        try {
            let adUrl =  adsList[i]
            const response = await axios.get(`https://${adsList[i]}`);
            var status = response.status;
            if (status = 200) {
                var data = response.data;
                if (data.includes('a href="tel:')) {
                    //console.log(data.includes('a href="mailto:'))
                    var tel = data.split('a href="tel:');
                    phone_numbers = tel[1].split('"')[0];
                } else {
                    // remove all spaces and dashes and new lines
                    var newData = data.replace(/[\n-\s]/g, "");
                    phone_numbers = extractPhoneNumber(newData);
                }
                if (typeof phone_numbers == 'string') { // found only one phone number
                    phone_numbers = phone_numbers.replace(/[\n-\s]/g, "")
                    let re = new RegExp('%20', "gi")
                    phone_numbers = phone_numbers.replace(re, "");
                } else { // found more than one phone number
                }

                if (data.includes('a href="mailto:')) {
                    //console.log(data.includes('a href="mailto:'))
                    var mail = data.split('a href="mailto:');
                    emails = mail[1].split('"')[0].replaceAll('\"', '');
                } else {
                    //console.log('No mailto found - try regex');
                    emails = extractEmails(data, adUrl);
                }
                let contact = {
                    url: adUrl,
                    phoneNumbers: phone_numbers,
                    emails: emails
                };
                contacts.push(contact)
            } else {
                fs.writeFileSync(adUrl + '-BAD.html', data);
                console.error('Error: ' + status);
            }
        } catch (err) {
            console.error(err.toString());
        }
    }
    return contacts
}

async function search(searchTerm) {
    ads = [];
    var searchUrl = `https://www.google.se/search?q=${searchTerm}`;
    //console.log('Will search: ' + searchTerm)
    try {
        const response = await axios.get(searchUrl);
        let status = response.status;
        if (status = 200) {
            let data = response.data;
            /*
            if (data.includes('captcha')) {
                //console.log('Captcha detected, solving...');
                // Solve the captcha here (not included in this example)
            } else {
                //console.log('Success - no captcha found.');
            }
            */
            let body = data.split('Annons">');
            let uEierd = body[0].split('<div class=\"uEierd\"');
            //console.log((uEierd.length - 1) + ' Ads found in page');

            for (var idx = 1; idx < uEierd.length; idx++) {
                if (uEierd[idx].indexOf('Annons') !== -1) {
                    var annons = uEierd[idx].split('Annons');
                    //console.log(annons[1])
                    if (annons[1].indexOf('data-dtld=') !== -1) {
                        let datadtld = annons[1].split('data-dtld=');
                        //console.log(datadtld[1])
                        let url = datadtld[1].split([' ']);
                        ads.push(url[0].replaceAll('\"', ''));
                    } else {
                        console.error('no data-dtld');
                    }
                } else {
                    console.error('no annons');
                }
            }
            contacts = await getContatDetails(ads);
            return contacts
        } else {
            console.error('Error: ' + status);
        }
    } catch (err) {
        console.error(err.toString());
    }
}

module.exports = { search }
const p = require("puppeteer");
const csv = require('csvtojson');
const stringify = require("csv-stringify")
const fs = require('fs');
const { time } = require("console");

const getnosurl = (geemente) => `https://app.nos.nl/op3/socialehuur/#/?gemeente=${geemente}`

const milltosecond = (s) => s * 1000

const getgeementewaitingdata = async (geemente, timeout) => {

    const browser = await p.launch({
        headless: true,
        devtools: false
    })

    const page = await browser.newPage()

    await page.goto(getnosurl(geemente))
    await page.waitForTimeout(milltosecond(timeout))

    let data = await page.evaluate(() => {
        let data = []
        let elements = document.getElementsByClassName("next")
        for (var element of elements){
            let entry = element.textContent
            let valid = entry.split(" ")[0]

            data.push(parseInt(valid))
        }
        return data;
    })

    await browser.close()

    const years = data[0]*10 + data[1]
    const months = data[2]*10 + data[3]

    return [years, months]
};



const runall = async (timeout) => {

    console.log("Start...")

    let raw = fs.readFileSync("data.csv").toString()

    let cities = []

    await csv().fromString(raw).subscribe(obj => {
        cities.push(obj["name"])
    })

    let waitingtime = [];

    let n = cities.length
    let i = 1

    for (let city of cities) {
        let result = await getgeementewaitingdata(city, timeout)

        console.log(`Working on city ${i} / ${n}`)
            
        if (!isNaN(result[0])) {
            console.log(`Retrieving ${city} succeeded!`)

            waitingtime.push(
                {city, years: result[0], months: result[1]}
            )
        } else {
            console.log(`Retrieving ${city} failed!`)
        }

        i += 1
    }

    stringify(waitingtime, function(err, output) {
        fs.writeFile(
            'out.csv', output, 'utf8', 
            function(err) {
                if (err) {
                    console.log('Some error occured - file either not saved or corrupted file saved.');
                } else {
                    console.log('It\'s saved!');
                }
            }
        );
    });
}

runall(12)
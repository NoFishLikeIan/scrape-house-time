const p = require("puppeteer");

const getnosurl = (geemente) => `https://app.nos.nl/op3/socialehuur/#/?gemeente=${geemente}`

const milltosecond = (s) => s * 1000

const getgeementewaitingdata = async (geemente) => {

    const browser = await p.launch({
        headless: true,
        devtools: false
    })

    const page = await browser.newPage()

    await page.goto(getnosurl(geemente))
    await page.waitForTimeout(milltosecond(10))

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

    console.log(years, months)


    return [years, months]
};



getgeementewaitingdata("amstelveen")
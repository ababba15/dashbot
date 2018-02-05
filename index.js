const TelegramBot = require("node-telegram-bot-api");
var fetchUrl = require("fetch").fetchUrl;
var http = require('http')

const keys = require('./keys.js')

const token = keys.bot_token;
// https://api.nasa.gov/neo/rest/v1/neo/3758838?api_key=${keys.nasa_key} NASA

const bot = new TelegramBot(token, {
    polling: true
});

const second = 1000;
const minute = second * 60;
const hour = minute * 60;

setInterval(() => {
    fetchUrl('https://meduza.io/api/v3/search?chrono=news&locale=ru&page=0&per_page=24', function(error, meta, body) {
        // console.log(body.toString());
        const data = JSON.parse(body.toString())
        if (data._count) {
            let collection = data.collection.slice(0, 8);
            let message = `*8 свежих новостей*
            
`;
            collection.forEach((it, ind) => {
                let article = data.documents[it]
                message = `${message}${ind + 1}. *${article.title}*
[даш](https://meduza.io/${article.url})

`;
            })

            bot.sendMessage('-1001060816045', message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })

        }
    });
}, hour * 12)

bot.onText(/слава украини|слава украине|слава україні/i, (msg, match) => {
    console.log('ДАШ >>>>>>', match);
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'героям слава');
});
bot.onText(/хто не скаче|кто не скачет|кто не скаче|хто нэ скаче/i, (msg, match) => {
    console.log('ДАШ >>>>>>', match);
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'той москаль');
});

bot.onText(/^даш$/i, (msg, match) => {
    console.log('ДАШ');
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'чо дать')
});
bot.onText(/^чо даш$/i, (msg, match) => {
    console.log('ДАШ >>>>>>', 'чо даш');
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '\n\n🎾 *чо дам* 🎾\n\n💧 медузу\n💦 свежую медузу\n🌃 гифку\n🐱 кота\n🐶 пса\n🐟 леща\n🥕 ебат', {
        parse_mode: 'Markdown',
    })
});
bot.onText(/даш (.+)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1].toLowerCase();
    console.log('ДАШ >>>>>>', resp);

    if (resp === 'свежую медузу') {
        fetchUrl('https://meduza.io/api/v3/search?chrono=news&locale=ru&page=0&per_page=24', function(error, meta, body) {
            // console.log(body.toString());
            const data = JSON.parse(body.toString())
            if (data._count) {
                let collection = data.collection.slice(0, 5);
                let message = `_5 последних новостей:_
                
`;
                collection.forEach((it, ind) => {
                    let article = data.documents[it]
                    message = `${message}${ind + 1}. *${article.title}*
[даш](https://meduza.io/${article.url})

`;
                })

                bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })

            }
        });
        return;
    }

    if (resp === 'медузу') {
        bot.sendMessage(chatId, '_сейчас выберу, что тебе дать..._', {
            parse_mode: 'Markdown'
        });



        let data = {};
        let collection = [];
        const pages = 20;

        for (let i = 0; i < pages; i++) {
            fetchUrl(`https://meduza.io/api/v3/search?chrono=news&locale=ru&page=${i}&per_page=24`, function(error, meta, body) {
                // console.log(body.toString());
                const localData = JSON.parse(body.toString());
                collection = collection.concat(collection, localData.collection)
                data = Object.assign({}, data, localData.documents);
                if (i === pages - 1) {
                    setTimeout(() => {
                        post(data, collection)
                    }, 3000)
                }
            })
        }

        function post(data, collection) {
            const rand = Math.floor(Math.random() * 240)
            const phrases = [
                'вот это почитай',
                'вот что нашла:',
                'зацени свежак',
                'во прекол',
                'ору ))',
                'ахах смари —',
            ]
            const oldPhrases = [
                'это не сегдняшняя, но интересно',
                'смари чо нарыла ))',
                'хм..',
                'этой новости уже пару дней',
                'ану-ка вот эту глянь',
                'не оч свежая статья, но норм',
            ]

            const phrase = (rand > 120) ? oldPhrases[Math.floor(Math.random() * 6)] : phrases[Math.floor(Math.random() * 6)]
            const article = data[collection[rand]]
            const message = `
_${phrase}_

*${article.title}*

[даш](https://meduza.io/${article.url})`;


            bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        }

        //     const rand = Math.floor(Math.random() * 240)

        return;
    }

    if (resp === 'кота') {
        fetchUrl('http://thecatapi.com/api/images/get?format=xml&results_per_page=1', function(error, meta, body) {
            const parser = require('xml2json');
            const data = body.toString()
            const json = JSON.parse(parser.toJson(data));
            const image = json.response.data.images.image.url
            bot.sendPhoto(chatId, image)
        });
        return;
    }
    if (resp === 'пса') {
        fetchUrl('https://dog.ceo/api/breeds/image/random', function(error, meta, body) {
            const json = JSON.parse(body.toString());
            const image = json.message
            bot.sendPhoto(chatId, image)
        });
        return;
    }
    if (resp === 'гифку') {
        fetchUrl(`https://api.giphy.com/v1/gifs/random?api_key=${keys.giphy_key}&tag=sex`, function(error, meta, body) {
            const response = JSON.parse(body.toString())
            bot.sendDocument(chatId, response.data.image_mp4_url)
        });
        return;
    }
    if (resp === 'ебат') {
        fetchUrl(`https://api.giphy.com/v1/gifs/random?api_key=${keys.giphy_key}&tag=sex`, function(error, meta, body) {
            const response = JSON.parse(body.toString())
            bot.sendDocument(chatId, response.data.image_mp4_url)
        });
        return;
    }
    if (resp === 'леща') {
        fetchUrl(`https://api.giphy.com/v1/gifs/random?api_key=${keys.giphy_key}&tag=fight`, function(error, meta, body) {
            const response = JSON.parse(body.toString())
            bot.sendDocument(chatId, response.data.image_mp4_url)
        });
        return;
    }

    const responses = ['неа', 'недам', 'отстань', 'а ты чо даш', 'чего?', 'сек..', 'а?', 'чо?', 'нету такого', 'отвянь', 'сам даш', "сек, ща поищу",
        'наглееш', 'а ты даш?', 'чо пристал', 'не наглей', 'сначало ты', '((']

    bot.sendMessage(chatId, responses[Math.floor(Math.random() * responses.length)])
});

http.createServer(function(request, response) {
    response.writeHead(200, {
        'Content-type': 'text/plan'
    });
    response.write('All fine');
    response.end();
}).listen(process.env.PORT || 5000);
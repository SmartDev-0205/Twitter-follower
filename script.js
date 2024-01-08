const readScreenNamesFromFile = require('./utils/readScreenNamesFromFile');
const readCommentsFromFile = require('./utils/readCommentsFromFile')
const getUserByScreenName = require('./utils/getUserByScreenName');
const getNotifications = require('./utils/getNotifications');
const fetchUserTweets = require('./utils/fetchUserTweets');
const postComment = require('./utils/postComment');
const NotificationsHandled = require('./models/NotificationsHandled');
const SubscriberAccounts = require('./models/SubscriberAccounts');
const CommenterAccounts = require('./models/CommenterAccounts');
const TweetsReplied = require('./models/TweetsReplied');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');



dotenv.config();
const scriptStartTime = new Date().getTime();


function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

mongoose.connect(process.env.MONGODB_URI);



const commentersFilePath = process.env.COMMENTER_ACCOUNTS_FILE_PATH
const commenters = readScreenNamesFromFile(commentersFilePath)
const commentsFileLocation = path.join(__dirname, process.env.COMMENTS_FILE_PATH)
const comments = readCommentsFromFile(commentsFileLocation)
const usernames = readScreenNamesFromFile(process.env.SUBSCRIBER_ACCOUNTS_FILE_PATH)
let commentIndex = 0;



async function script() {


    const fetchAccount = await CommenterAccounts
        .find({})
        .sort({ rateLimitRemaining: -1 })
        .limit(1)






    let {
        notifications,
        responseHeaders,
    } = await getNotifications(
        path.join(__dirname, fetchAccount[0].screenName + '-cookies.txt')
    )

    notifications = Object.values(notifications).filter(notification => {
        return notification.message.text.startsWith('New post notification');
    })

    for (const notification of notifications) {

        const isNotificationHandled = await NotificationsHandled.findOne({
            notificationId: notification.timestampMs
        })

        if (isNotificationHandled) {
            //console.log('Notification already handled')
            continue;
        }

        console.log('New notification found!')

        for (const entity of notification.message?.entities.slice(0, 2) || []) {
            const userId = entity.ref?.user?.id;
            if (!userId) {
                continue
            };

            const subscriberAccount = await SubscriberAccounts.findOne({
                id: userId
            })

            if (!subscriberAccount) {
                console.log('Notification is not related to a subscriber.')
                continue;
            }

            const tweets = await fetchUserTweets(
                path.join(__dirname, fetchAccount[0].screenName + '-cookies.txt'),
                userId
            )


            if (tweets.length === 0) {
                console.log('Tweets array length is 0.')
                continue;
            }

            const latestTweet = tweets[0]
            const latestTweetTime = new Date(latestTweet.created_at).getTime()

            if (latestTweetTime < scriptStartTime) {
                console.log('It is an old tweet.')
                continue;
            }
            console.log('New tweets found!')

            const tweetReplied = await TweetsReplied.findOne({
                tweetId: latestTweet.id_str
            })

            if (tweetReplied) {
                console.log('Already replied to this tweet.')
                continue;
            }

           
            const tweetId = latestTweet.id_str

            console.log(commenters)
            for (const commenter of commenters) {
                console.log(commenter + '-cookies.txt')
                let comment = comments[commentIndex]
                commentIndex = (commentIndex + 1) % comments.length
                await postComment(
                    path.join(__dirname, commenter + '-cookies.txt'),
                    tweetId,
                    comment
                )
                console.log(`Commented on ${commenter}'s behalf.`)
            }

            await TweetsReplied.create({
                tweetId: tweetId,
            })
        }

        await NotificationsHandled.create({
            notificationId: notification.timestampMs,
        })
    }



    await CommenterAccounts.findOneAndUpdate({
        screenName: fetchAccount[0].screenName,
    }, {
        rateLimitReset: Number(responseHeaders.get('x-rate-limit-reset')),
        rateLimitRemaining: Number(responseHeaders.get('x-rate-limit-remaining')),
    })


}



async function runScript() {

    await SubscriberAccounts.deleteMany({ screenName: { $nin: usernames } })
    await CommenterAccounts.deleteMany()


    for (const username of usernames) {
        const result = await getUserByScreenName(
            username,
            path.join(__dirname, commenters[0] + '-cookies.txt')
        )

        await SubscriberAccounts.create({
            screenName: username,
            id: result.id,
        })
    }

    for (const commenter of commenters) {
        const {
            responseHeaders,
        } = await getNotifications(
            path.join(__dirname, commenter + '-cookies.txt')
        )

        await CommenterAccounts.create({
            screenName: commenter,
            rateLimitReset: responseHeaders.get('x-rate-limit-reset'),
            rateLimitRemaining: responseHeaders.get('x-rate-limit-remaining'),
        })
    }


    while (true) {
        await script();
        const delay = parseFloat(process.env.REQUEST_DELAY) * 1000 ;
        console.log(`Waiting ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay))
    }
}

runScript()


//script()


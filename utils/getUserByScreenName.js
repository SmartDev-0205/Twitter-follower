const fetch = require("node-fetch");
const readCookiesFromFile = require('./readCookiesFromFile')
const writeCookiesToFile = require('./writeCookiesToFile')
const getGuestToken = require('./getGuestToken')
const GuestTokenRequestCounts = require('../models/GuestTokenRequestCounts')



async function getUserByScreenName(screenName, cookiesFilePath, forceNewGuestToken = false) {


    const cookies = readCookiesFromFile(cookiesFilePath);

    const oldGuestToken = cookies.find(cookie => cookie.name === 'guest_id').value;
    const guestTokenRequestCount = await GuestTokenRequestCounts.findOne({ 
        guestToken: oldGuestToken,
        cookiesHash: btoa(cookiesFilePath)
    })
    const guestTokenRateLimit = parseFloat(process.env.GUEST_TOKEN_RATE_LIMIT)
    const guestIdCookie = cookies.find(cookie => cookie.name === 'guest_id')

    if (forceNewGuestToken || !guestTokenRequestCount || guestTokenRequestCount.count >= guestTokenRateLimit) {
        console.log("Getting new guest token...")
        const guestToken = await getGuestToken();
        guestIdCookie.value = 'v1%3A' + guestToken.guest_token
    }



    const variables = {
        "screen_name": screenName,
        "withSafetyModeUserFields": true
    }


    const features = {
        "hidden_profile_likes_enabled": true,
        "hidden_profile_subscriptions_enabled": true,
        "responsive_web_graphql_exclude_directive_enabled": true,
        "verified_phone_label_enabled": false,
        "subscriptions_verification_info_is_identity_verified_enabled": true,
        "subscriptions_verification_info_verified_since_enabled": true,
        "highlights_tweets_tab_ui_enabled": true,
        "responsive_web_twitter_article_notes_tab_enabled": false,
        "creator_subscriptions_tweet_preview_api_enabled": true,
        "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
        "responsive_web_graphql_timeline_navigation_enabled": true
    }
    const fieldToggles = {
        "withAuxiliaryUserLabels": false
    }


    const baseUrl = "https://twitter.com/i/api/graphql/NimuplG1OB7Fd2btCLdBOw/UserByScreenName"
    const url = `${baseUrl}?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`


    const headers = {
        "authorization": "Bearer " + process.env.BEARER_AUTH_TOKEN,
        "content-type": "application/json",
        "x-csrf-token":  cookies.find(cookie => cookie.name === 'ct0').value,
        "cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
        "Referer": "https://twitter.com/",
    }

    const response = await fetch(url, {
        "headers": headers,
        "body": null,
        "method": "GET"
    });

    let result;
    try {
        const { data: { user } } = await response.json();
        result = user.result;
    } catch (err) {
        
        if (!forceNewGuestToken) {
            const result = await getUserByScreenName(screenName, cookiesFilePath, true)
            return result
        }
    }



    if(!result){
        return null;
    }
    await GuestTokenRequestCounts.findOneAndUpdate(
        { 
            guestToken: guestIdCookie.value,
            cookiesHash: btoa(cookiesFilePath) 
        },
        { $inc: { count: 1 } },
        { upsert: true }
    )

    writeCookiesToFile(cookiesFilePath, cookies);

    return {
        screenName,
        id: result.rest_id,
    }

}

module.exports = getUserByScreenName;
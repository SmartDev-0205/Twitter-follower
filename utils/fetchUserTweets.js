const fetch = require('node-fetch');
const readCookiesFromFile = require('./readCookiesFromFile');
const writeCookiesToFile = require('./writeCookiesToFile');
const getGuestToken = require('./getGuestToken');
const GuestTokenRequestCounts = require('../models/GuestTokenRequestCounts');


async function getTweetsArray(json) {
    const entries = json?.data?.user?.result?.timeline_v2?.timeline?.instructions?.[1]?.entries;

    if (!entries) {
        return [];
    }

    const tweets = [];

    for (const entry of entries) {
        if (!entry.entryId.startsWith('tweet-')) {
            continue;
        }

        const tweet = entry.content.itemContent.tweet_results.result.legacy;
        tweets.push(tweet);
    }
    return tweets;
}

async function fetchUserTweets(
    cookiesFilePath,
    userId,
    forceNewGuestToken = false
) {
    try {
        const cookies = readCookiesFromFile(cookiesFilePath);

        const oldGuestToken = cookies.find(cookie => cookie.name === 'guest_id').value;
        const guestTokenRequestCount = await GuestTokenRequestCounts.findOne({ 
            cookiesHash: btoa(cookiesFilePath),
            guestToken: oldGuestToken 
        });
        const guestTokenRateLimit = parseFloat(process.env.GUEST_TOKEN_RATE_LIMIT)
        const guestIdCookie = cookies.find(cookie => cookie.name === 'guest_id');


        if (forceNewGuestToken || !guestTokenRequestCount || guestTokenRequestCount.count >= guestTokenRateLimit) {
            console.log("Getting new guest token...");
            const guestToken = await getGuestToken();
            guestIdCookie.value = 'v1%3A' + guestToken.guest_token;
        }


        const variables = {
            "userId": userId,
            "count": 20,
            "includePromotedContent": true,
            "withQuickPromoteEligibilityTweetFields": true,
            "withVoice": true,
            "withV2Timeline": true
        };

        const features = '%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_home_pinned_timelines_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D';

        const url = `https://twitter.com/i/api/graphql/dh2lDmjqEkxCWQK_UxkH4w/UserTweets?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${features}`;

        const options = {
            method: "GET",
            headers: {
                "cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
                "authorization": "Bearer " + process.env.BEARER_AUTH_TOKEN,
                "content-type": "application/json",
                "referer": "https://twitter.com/",
                "user-agent": process.env.USER_AGENT,
                "x-csrf-token": cookies.find(cookie => cookie.name === 'ct0').value,
                "Content-Length": "0"
            }
        };

        const response = await fetch(url, options);

        let json;
        try {
            json = await response.json();
        } catch (err) {
            if (!forceNewGuestToken) {
                const tweets = await fetchUserTweets(cookiesFilePath, userId, true);
                return tweets;
            }
        }

        if (!json) {
            return [];
        }
        await GuestTokenRequestCounts.findOneAndUpdate(
            { 
                guestToken: guestIdCookie.value,
                cookiesHash: btoa(cookiesFilePath) 
            },
            { $inc: { count: 1 } },
            { upsert: true }
        );

        writeCookiesToFile(cookiesFilePath, cookies);

        const tweets = getTweetsArray(json);
        return tweets;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = fetchUserTweets;

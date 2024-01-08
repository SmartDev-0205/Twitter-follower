const fetch = require("node-fetch");
const readCookiesFromFile = require('./readCookiesFromFile')





async function getNotifications(cookiesFilePath) {

    try {
        const url = "https://twitter.com/i/api/2/notifications/all.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&include_ext_is_blue_verified=1&include_ext_verified_type=1&include_ext_profile_image_shape=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_views=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&requestContext=launch&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2CbirdwatchPivot%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl";

        const cookies = readCookiesFromFile(cookiesFilePath);
        const headers = {
            "cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
            "authorization": "Bearer " + process.env.BEARER_AUTH_TOKEN,
            "referer": "https://twitter.com/notifications",
            "user-agent": process.env.USER_AGENT,
            "x-csrf-token": cookies.find(cookie => cookie.name === "ct0").value,

        };

        const response = await fetch(url, { method: "GET", headers })
        const {globalObjects: { notifications }} = await response.json();
        return {
            notifications,
            responseHeaders: response.headers
        };
    } catch (err) {
        console.log(err)
    }
}

module.exports = getNotifications;

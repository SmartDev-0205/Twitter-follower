const fetch = require('node-fetch');
const readCookiesFromFile = require('./readCookiesFromFile');



async function postComment(cookiesFilePath, tweetId, content) {
  try {
    const url = "https://twitter.com/i/api/graphql/I_J3_LvnnihD0Gjbq5pD2g/CreateTweet";

    const cookies = readCookiesFromFile(cookiesFilePath);


    const headers = {
      "cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
      "authorization": "Bearer " + process.env.BEARER_AUTH_TOKEN,
      "content-type": "application/json",
      "user-agent": process.env.USER_AGENT,
      "x-csrf-token": cookies.find(cookie => cookie.name === 'ct0').value,
    };

    const data = {
      variables: {
        tweet_text: content,
        reply: { in_reply_to_tweet_id: tweetId, exclude_reply_user_ids: [] },
        dark_request: false,
        media: { media_entities: [], possibly_sensitive: false },
        semantic_annotation_ids: [],
      },
      features: {
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        tweetypie_unmention_optimization_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: false,
        tweet_awards_web_tipping_enabled: false,
        responsive_web_home_pinned_timelines_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        responsive_web_media_download_video_enabled: false,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_enhance_cards_enabled: false
      },
      queryId: 'I_J3_LvnnihD0Gjbq5pD2g',
    };

    await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    })

  } catch (error) {
    console.error('Error posting comment:', error.message);
    return [];
  }

}

module.exports = postComment;

const APP_URLS = {
    KEYWORDS_LIST:'/api/keywords/',
    KEYWORDS_DETAIL:'/api/keywords/${id}/',
    CREATORS_LIST:'/api/creators/',
    CREATORS_DETAIL:'/api/creators/${id}/',
    CONTENTS_LIST: '/api/contents/',
    CONTENT_DETAIL: '/api/contents/${id}/',
    DIRLAYOUT_LIST: '/api/dirlayouts/',
    DIRLAYOUT_DETAIL: '/api/dirlayouts/${id}/',
    DIRLAYOUT_CLONE: '/api/dirlayouts/${id}/clone/',
    DIRECTORY_LIST: '/api/directories/',
    DIRECTORY_DETAIL: '/api/directories/${id}/',
    ALLTAGS_LIST: '/api/alltags/',
    COVERAGES_LIST: '/api/coverages/',
    COVERAGES_DETAIL: '/api/coverages/${id}/',
    SUBJECTS_LIST: '/api/subjects/',
    SUBJECTS_DETAIL:'/api/subjects/${id}/',
    WORKAREAS_LIST:'/api/workareas/',
    WORKAREAS_DETAIL: '/api/workareas/${id}/',
    LANGUAGES_LIST:'/api/languages/',
    LANGUAGES_DETAIL:'/api/languages/${id}/',
    CATALOGERS_LIST:'/api/catalogers/',
    CATALOGERS_DETAIL:'/api/catalogers/${id}/'
}

function get_url(templateStringLiteral, context) {
    context = context || {};
    Object.keys(context).forEach(eachKey => {
        templateStringLiteral = templateStringLiteral.replace("${" + eachKey +"}", context[eachKey]);
    })
    return templateStringLiteral;
}

module.exports = {
    APP_URLS: APP_URLS,
    get_url: get_url
}

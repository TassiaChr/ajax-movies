$(document).ready(function() {
    let debounceTimeout = null
    $('#searchInput').on('input', function() {
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => getMovie(this.value.trim()), 1500)
    })

    $('#showMore').on('click', function(e) {
        e.preventDefault()
        onShowMoreClicked()
    })
})

function getMovie(title) {
    if (!title) {
        return
    }

    onBeforeSend()
    fetchMovieFromApi(title)
}


function fetchMovieFromApi(title) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open("GET", `https://www.omdbapi.com/?t=${title}&apikey=1f6e2c7a`, true)
    ajaxRequest.timeout = 2000
    ajaxRequest.onreadystatechange = function() {
        if(ajaxRequest.readyState == 4) {
            if(ajaxRequest.status === 200) {
                handleResults(JSON.parse(ajaxRequest.responseText))
            }
        }
    }
    ajaxRequest.send()
}

function handleResults(result) {
    if (result.Response === 'True') {
        let transformed = transformResponse(result)
        buildMovie(transformed)
    } else if (result.Response === 'False') {
        hideComponent('#waiting')
        $('.not-found').clone().removeClass('hidden').appendTo($('.center'))
    }
}

function buildMovie(apiResponse) {
    if (apiResponse.poster) {
        $('#image').attr('src', apiResponse.poster).on('load', function() {
            buildMovieMetadata(apiResponse, $(this))
        })
    } else {
        buildMovieMetadata(apiResponse)
    }
}

function onBeforeSend() {
    showComponent('#waiting')
    hideComponent('.movie')
    $('.center').find('.not-found').remove()
    $('#plot').removeClass('expanded')
    $('.extended').hide()
}

function buildMovieMetadata(apiResponse, imageTag) {
    hideComponent('#waiting')
    handleImage(imageTag)
    handleLiterals(apiResponse)
    showComponent('.movie')
}

function handleImage(imageTag) {
    imageTag ? $('#image').replaceWith(imageTag) : $('#image').removeAttr('src')
}

function handleLiterals(apiResponse) {
    $('.movie').find('[id]').each((index, item) => {
        if ($(item).is('a')) {
            $(item).attr('href', apiResponse[item.id])
        } else {
            let valueElement = $(item).children('span')
            let metadataValue = apiResponse[item.id] ? apiResponse[item.id] : '-'
            valueElement.length ? valueElement.text(metadataValue) : $(item).text(metadataValue)
        }
    })
}

function transformResponse(apiResponse) {
    let camelCaseKeysResponse = camelCaseKeys(apiResponse)
    clearNotAvailableInformation(camelCaseKeysResponse)
    buildImdbLink(camelCaseKeysResponse)
    return camelCaseKeysResponse
}

function camelCaseKeys(apiResponse) {
    return _.mapKeys(apiResponse, (v, k) => _.camelCase(k))
}

function buildImdbLink(apiResponse) {
    if (apiResponse.imdbId && apiResponse.imdbId !== 'N/A') {
        apiResponse.imdbId = `https://www.imdb.com/title/${apiResponse.imdbId}`
    }
}

function clearNotAvailableInformation(apiResponse) {
    for (var key in apiResponse) {
        if (apiResponse.hasOwnProperty(key) && apiResponse[key] === 'N/A') {
            apiResponse[key] = ''
        }
    }
}

function onShowMoreClicked() {
    $('#plot').toggleClass('expanded')
    if($('.extended').is(':visible')) {
        $('.extended').hide(700)
    }
    else {
        $('.extended').show(700)
    }
}

function hideComponent(jquerySelector) {
    return $(jquerySelector).addClass('hidden')
}

function showComponent(jquerySelector) {
    return $(jquerySelector).removeClass('hidden')
}
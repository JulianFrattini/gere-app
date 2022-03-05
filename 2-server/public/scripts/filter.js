// parse the subjects which are displayed in the rows of the table
const subjects = JSON.parse(document.currentScript.getAttribute('subjects'));

// in case there is a dimension with a limited number of characteristics (like a triple), build a status carousel to cycle through
var statuscarousel = null
if(document.currentScript.getAttributeNames().includes('triplevalues')) {
    const triplevalues = JSON.parse(document.currentScript.getAttribute('triplevalues'));
    statuscarousel = [
        { class: 'ficon_positive', color: 'rgb(146, 208, 80)', tooltipaddendum: ' is positive', value: triplevalues[1]}, 
        { class: 'ficon_negative', color: 'rgb(192, 0, 0)', tooltipaddendum: ' is negative', value: triplevalues[0]}, 
        { class: 'ficon_unknown', color: 'grey', tooltipaddendum: ' is unknown', value: triplevalues[2] },
        { class: 'ficon_default', color: 'rgb(49, 46, 46)', tooltipaddendum: '' }
    ]
}

// override the id property if necessary
var id = 'id'
if(document.currentScript.getAttributeNames().includes("id")) {
    id = document.currentScript.getAttribute('id');
}

window.onload = function() {
    for(const dimension of document.getElementsByClassName('dimension')) {
        dimension.getElementsByClassName('label')[0].onclick = function (evt) {
            if (dimension.classList.contains('visible'))
                dimension.classList.remove('visible');
            else
                dimension.classList.add('visible');
        }
    }

    for(const scopenote of document.getElementsByClassName('scopenote')) {
        const label = scopenote.getElementsByClassName('label')[0];
        const filter = scopenote.getElementsByClassName('textfilter')[0];
        label.onclick = function (evt) {
            if (filter.classList.contains('visible'))
                filter.classList.remove('visible');
            else
                filter.classList.add('visible');
        }
    }
}

function filterDimension(dimension, characteristic, visible) {
    for(const subject of subjects) {
        if(subject[dimension].toLowerCase() == characteristic.toLowerCase()) {
            document.getElementById(subject[id]).style.display = visible ? '' : 'none'
        }
    }
}

function filterTriple(dimension, icon) {
    for(const status of statuscarousel) {
        if(icon.classList.contains(status.class)) {
            const index = statuscarousel.indexOf(status)
            const nextindex = (index+1)%(statuscarousel.length)
            
            icon.classList.remove(statuscarousel[index].class);
            icon.classList.add(statuscarousel[nextindex].class);
            icon.style.color = statuscarousel[nextindex].color
            icon.title = `${dimension}` + statuscarousel[nextindex].tooltipaddendum + ' (click to filter)'

            for(const subject of subjects) {
                if('value' in statuscarousel[nextindex]) {
                    document.getElementById(subject[id]).style.display = subject[dimension] == statuscarousel[nextindex].value ? '' : 'none'
                } else {
                    document.getElementById(subject[id]).style.display = ''
                }
            }
            break
        }
    }
}

function filterScopenote(attribute, text) {
    for(const subject of subjects) {
        const entry = document.getElementById(subject[id]);
        if(text == "") {
            entry.style.display = ''
        } else {
            entry.style.display = subject[attribute].toLowerCase().includes(text) ? '' : 'none'
        }
    }
    
}
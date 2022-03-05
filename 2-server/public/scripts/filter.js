const subjects = JSON.parse(document.currentScript.getAttribute('subjects'));
const triplevalues = JSON.parse(document.currentScript.getAttribute('triplevalues'));
const statuscarusel = [
    { class: 'ficon_positive', color: 'rgb(146, 208, 80)', tooltipaddendum: ' is positive' }, 
    { class: 'ficon_negative', color: 'rgb(192, 0, 0)', tooltipaddendum: ' is negative' }, 
    { class: 'ficon_unknown', color: 'grey', tooltipaddendum: ' is unknown' },
    { class: 'ficon_default', color: 'rgb(49, 46, 46)', tooltipaddendum: '' }
]

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
    
    statuscarusel[0]['value'] = triplevalues[1];
    statuscarusel[1]['value'] = triplevalues[0];
    statuscarusel[2]['value'] = triplevalues[2];
}

function filterDimension(dimension, characteristic, visible) {
    for(const subject of subjects) {
        if(subject[dimension].toLowerCase() == characteristic.toLowerCase()) {
            document.getElementById(subject['id']).style.display = visible ? '' : 'none'
        }
    }
}

function filterTriple(dimension, icon) {
    for(const status of statuscarusel) {
        if(icon.classList.contains(status.class)) {
            const index = statuscarusel.indexOf(status)
            const nextindex = (index+1)%(statuscarusel.length)
            
            icon.classList.remove(statuscarusel[index].class);
            icon.classList.add(statuscarusel[nextindex].class);
            icon.style.color = statuscarusel[nextindex].color
            icon.title = `${dimension}` + statuscarusel[nextindex].tooltipaddendum + ' (click to filter)'

            for(const subject of subjects) {
                if('value' in statuscarusel[nextindex]) {
                    document.getElementById(subject['id']).style.display = subject[dimension] == statuscarusel[nextindex].value ? '' : 'none'
                } else {
                    document.getElementById(subject['id']).style.display = ''
                }
            }
            break
        }
    }
}

function filterScopenote(attribute, text) {
    for(const subject of subjects) {
        const entry = document.getElementById(subject['id']);

        //console.log(subject[attribute].toLowerCase())

        if(text == "") {
            entry.style.display = ''
        } else {
            entry.style.display = subject[attribute].toLowerCase().includes(text) ? '' : 'none'
        }
    }
    
}
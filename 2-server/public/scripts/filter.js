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

    // for all reflistfilters: check, if there is an initial value in the filter
    for(const reflistfilter of document.getElementsByClassName('reflistfilter')) {
        if(reflistfilter.value != '') {
            // if there is a value, trigger an input event to apply the filter
            reflistfilter.dispatchEvent(new Event('input', {bubbles: true}));
        }
    }

    // initially: hida all expandable objects
    for(const expandable of document.getElementsByClassName('expandable')) {
        console.log(expandable)
        expandable.style.display = 'none'
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

/**
 * Filter the subjects by whether a specific reflist contains at least one reference where the key contains the text
 * @param {String} attribute The name of the attribute in the current subjects which refers to another subject
 * @param {String} key The name of the id of the referred to subject (e.g., refkey for references)
 * @param {String} text The text to filter by
 */
function filterReflist(attribute, key, text) {
    for(const subject of subjects) {
        const entry = document.getElementById(subject[id]);

        if(text == "") {
            // in case the filter text is empty, display all subjects
            entry.style.display = ''
        } else {
            // in case the filter text is not empty, search if among the reference in the reflist one subject's key value contains the text
            var keyFound = false;
            for(const reference of subject[attribute]) {
                if(reference[key].includes(text)) {
                    entry.style.display = '';
                    keyFound = true;
                    break;
                }
            }

            if(!keyFound) {
                entry.style.display = 'none';
            }
        }
    }
    
}

function toggleExpander(classname) {
    const objects = document.getElementsByClassName(classname)
    if(objects[0].style.display == '') {
        for(const object of objects) {
            object.style.display = 'none'
        }
    } else {
        
        for(const object of objects) {
            object.style.display = ''
        }
    }
}
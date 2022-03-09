// parse the subjects which are displayed in the rows of the table
const subjects = JSON.parse(document.currentScript.getAttribute('subjects'));

var cycles = {};
if(document.currentScript.getAttributeNames().includes('cycles')) {
    const cs = JSON.parse(document.currentScript.getAttribute('cycles'));
    for(const c of cs) {
        cycles[c.id] = [{ class: 'ficon_default', color: 'rgb(49, 46, 46)', tooltipaddendum: '' }];
        if(Object.keys(c.values).includes("positive"))
            cycles[c.id].push({ class: 'ficon_positive', color: 'rgb(146, 208, 80)', tooltipaddendum: ' is positive', value: c.values.positive})
        if(Object.keys(c.values).includes("negative"))
            cycles[c.id].push({ class: 'ficon_negative', color: 'rgb(192, 0, 0)', tooltipaddendum: ' is negative', value: c.values.negative})
        if(Object.keys(c.values).includes("unknown"))
            cycles[c.id].push({ class: 'ficon_unknown', color: 'grey', tooltipaddendum: ' is unknown', value: c.values.unknown})
    }
}

// override the id property if necessary
var id = 'id'
if(document.currentScript.getAttributeNames().includes("id")) {
    id = document.currentScript.getAttribute('id');
}

// filter object containing all pairs of key -> expected value
var filters = []

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

    // initially: hide all expandable objects
    for(const expandable of document.getElementsByClassName('expandable')) {
        expandable.style.display = 'none'
    }
}

function filter() {
    for(const subject of subjects) {
        if(filters.length == 0) {
            // if no filter is active, display all elements
            document.getElementById(subject[id]).style.display = ''
        } else {
            violatesFilter = false
            for(const f of filters) {
                if(f.type == 'remove') {
                    if(f.filtered.includes(subject[f.attribute].toLowerCase())) {
                        violatesFilter = true;
                        break;
                    }
                } else if(f.type == 'allow') {
                    if(f.subdimension == null) {
                        if(f.characteristic != subject[f.attribute]) {
                            violatesFilter = true;
                            break;
                        }
                    } else {
                        if(f.characteristic) {
                            // if the filter is "true", filter for all subjects that have at least one reference where the subdimension value is true
                            if(subject[f.attribute].find(d => d[f.subdimension] == f.characteristic) == null) {
                                violatesFilter = true;
                                break;
                            }
                        } else {
                            // if the filter is false, filter for all subjects that have no reference where the subdimension is true
                            if(subject[f.attribute].find(d => d[f.subdimension] == !f.characteristic) != null) {
                                violatesFilter = true;
                                break;
                            }
                        }
                    }
                } else if(f.type == 'contains') {
                    if(!subject[f.attribute].toLowerCase().includes(f.text)) {
                        violatesFilter = true;
                        break;
                    }
                } else if(f.type == 'refersto') {
                    // check if it is only a straight reference or a list of references
                    if(Array.isArray(subject[f.attribute])) {
                        var keyFound = false;
                        for(const reference of subject[f.attribute]) {
                            if(reference[f.key].includes(f.text)) {
                                keyFound = true;
                                break;
                            }
                        }
    
                        if(!keyFound) {
                            violatesFilter = true;
                            break;
                        }
                    } else {
                        if(!subject[f.attribute][f.key].includes(f.text)) {
                            violatesFilter = true;
                            break;
                        }
                    }
                }
            }

            document.getElementById(subject[id]).style.display = violatesFilter ? 'none' : ''
            if(violatesFilter) {
                closeExpander(subject[id]+'D')
            }
        }
    }
}

/**
 * Add a filter to a dimension, where the given characteristic of a dimension is either allowed or not allowed
 * @param {String} dimension The dimension on which is filtered
 * @param {String} characteristic The characteristic which will be allowed or not allowed
 * @param {boolean} allowed True, if the characteristic is allowed, false if not
 */
function filterDimension(dimension, characteristic, allowed) {
    var f = filters.find(f => f.attribute == dimension);
    if(f == undefined) {
        if(!allowed) {
            filters.push({
                attribute: dimension,
                type: 'remove',
                filtered: [characteristic]
            });
        }
    } else {
        if(!allowed) {
            f.filtered.push(characteristic);
        } else {
            const index = f.filtered.indexOf(characteristic)
            if(index >= 0) {
                f.filtered.splice(index, 1)
            }

            // in case this was the only characteristic that was prevented in the dimension, remove the filter alltogether
            if(f.filtered.length == 0) {
                filters.splice(filters.indexOf(f), 1);
            }
        }
    }

    filter();
}

function cycleDimension(dimension, subdimension, cycleid, icon) {
    const cycle = cycles[cycleid]
    for(const status of cycle) {
        if(icon.classList.contains(status.class)) {
            const index = cycle.indexOf(status);
            const nextstatus = cycle[(index+1)%(cycle.length)]

            icon.classList.remove(status.class);
            icon.classList.add(nextstatus.class);
            icon.style.color = nextstatus.color
            icon.title = `${dimension}` + nextstatus.tooltipaddendum + ' (click to filter)'

            var f = filters.find(f => f.attribute == dimension && f.subdimension == subdimension);
            if(f == undefined) {
                if('value' in nextstatus) {
                    filters.push({
                        attribute: dimension,
                        subdimension: subdimension,
                        type: 'allow',
                        characteristic: nextstatus.value
                    });
                }
            } else {
                if('value' in nextstatus) {
                    f.characteristic = nextstatus.value;
                } else {
                    filters.splice(filters.indexOf(f), 1);
                }
            }

            break;
        }
    }

    filter();
}

/**
 * Add an additional filter, where the given scope note must contain the given text
 * @param {String} attribute The scope note that shall be filtered by
 * @param {*} text The string which the scope note has to contain
 */
function filterScopenote(attribute, text) {
    // identify, whethere there is already a filter on this scope note
    var f = filters.find(f => f.attribute == attribute);
    if(f == undefined) {
        // if not (and the text is not empty) create a new filter for the scope note
        if(text != "") {
            filters.push({
                attribute: attribute,
                type: 'contains',
                text: text
            });
        }
    } else {
        // if yes, update the filter by reassigning the text
        if(text != "") {
            f.text = text;
        } else {
            // if the text is empty, remove the filter alltogether
            filters.splice(filters.indexOf(f), 1);
        }
    }

    filter();
}

/**
 * Filter the subjects by whether a specific reflist contains at least one reference where the key contains the text
 * @param {String} attribute The name of the attribute in the current subjects which refers to another subject
 * @param {String} key The name of the id of the referred to subject (e.g., refkey for references)
 * @param {String} text The text to filter by
 */
function filterReflist(attribute, key, text) {
    // identify, whethere there is already a filter on this reflist
    var f = filters.find(f => f.attribute == attribute);
    if(f == undefined) {
        // if not (and the text is not empty) create a new filter for the reflist
        if(text != "") {
            filters.push({
                attribute: attribute,
                type: 'refersto',
                key: key,
                text: text
            });
        }
    } else {
        // if yes, update the filter by reassigning the text
        if(text != "") {
            f.text = text;
        } else {
            // if the text is empty, remove the filter alltogether
            filters.splice(filters.indexOf(f), 1);
        }
    }

    filter();
}
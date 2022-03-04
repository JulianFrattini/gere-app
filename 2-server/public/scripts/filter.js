const subjects = JSON.parse(document.currentScript.getAttribute('subjects'));

window.onload = function() {


    for(const dimension of document.getElementsByClassName('dimension')) {
        dimension.getElementsByClassName('label')[0].onclick = function (evt) {
            if (dimension.classList.contains('visible'))
                dimension.classList.remove('visible');
            else
                dimension.classList.add('visible');
        }
    }
}

function filterDimension(dimension, characteristic, visible) {
    for(const subject of subjects) {
        if(subject[dimension].toLowerCase() == characteristic) {
            document.getElementById(subject['id']).style.display = visible ? '' : 'none'
        }
    }
}
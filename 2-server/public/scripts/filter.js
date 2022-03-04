const subjects = JSON.parse(document.currentScript.getAttribute('subjects'));

window.onload = function() {

    var checkList = document.getElementById('list1');
    checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
        if (checkList.classList.contains('visible'))
            checkList.classList.remove('visible');
        else
            checkList.classList.add('visible');
    }

}

function checkedComplexity(dimension, characteristic, cb) {
    console.log(dimension + ' ' + characteristic + ' ' + cb)
    for(const subject of subjects) {
        if(subject[dimension] == characteristic) {
            if(cb) {
                var row = document.getElementById(subject['id']).style.display = ''
            } else {
                document.getElementById(subject['id']).style.display = 'none'
            }
        }
    }
}
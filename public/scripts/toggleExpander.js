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

function closeExpander(classname) {
    const objects = document.getElementsByClassName(classname)
    for(const object of objects) {
        object.style.display = 'none'
    }
}
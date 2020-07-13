const notes = document.querySelectorAll('.delete')

for (let i = 0; i < notes.length; i++) {
    notes[i].addEventListener('click', e => {
        var endPoint = '/delete/' + notes[i].getAttribute('data-noteID')
        deleteNote(endPoint)
    })
}

async function deleteNote(endPoint) {
    await fetch(endPoint)
    await window.location.reload()
}
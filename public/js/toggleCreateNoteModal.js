const createnote = document.querySelector('.createnote')
const closex = document.querySelector('.close-x')
const modal = document.querySelector('.new-form-modal')
const card = document.querySelector('.card')

// Opening the modal with 'Create Note' form
createnote.addEventListener('click', e => {
    modal.classList.remove('closed')
    card.classList.remove('closed')
})

//  CLosing the 'Create Note' modal when someone clicks on the X
closex.addEventListener('click', e => {
    modal.classList.add('closed')
    card.classList.add('closed')
})
// Closing the modal if someone clicks outside the modal card
modal.addEventListener('click', e => {
    modal.classList.add('closed')
    card.classList.add('closed')
})
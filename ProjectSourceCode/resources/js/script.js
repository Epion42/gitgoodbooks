// This is the client-side JS
const sidebar = document.querySelector('.sidebar');

function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    Array.from(sidebar.getElementsByClassName('nav-link')).forEach( a =>{
        a.classList.toggle('disabled');
    })
}
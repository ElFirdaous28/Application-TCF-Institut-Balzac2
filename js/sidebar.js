const listUsers = JSON.parse(localStorage.getItem('users'));
console.log(listUsers);
const usersList = document.getElementById('usersList');

listUsers.forEach(user => {   
    usersList.innerHTML+=`<div onclick="reportByUser(event)" data-user-id=${user.id} class="flex items-center ml-8 px-8 py-2 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100 cursor-pointer">${user.username}</div>`;
});

const usersDropDown = document.getElementById('usersDropDown');
usersDropDown.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    if (usersList.classList.contains('max-h-0')) {
        usersList.classList.remove('max-h-0');
        usersList.classList.add('max-h-screen'); // Set a maximum height for the animation
    } else {
        usersList.classList.add('max-h-0');
        usersList.classList.remove('max-h-screen');
    }
});
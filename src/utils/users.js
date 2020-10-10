const users = []

//add methods to users array
// addUser, removeUser, getUser, getUsersInRoom



//addUser
const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the inputs
    if (!username || !room) {
        return {
            error: 'Username and Room name are mandatory'
        }
    }

    const existingUser = users.find(user => user.room === room && user.username === username)

    // checking existing users
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }


    // if there is a new user and validated then the user is added to the users array
    const user = { id, username, room }
    users.push(user)
    return { user }
}




// removeUsers
const removeUser = (id) => {
    //obtain the id of the user in the users array
    const userIndex = users.findIndex(user => user.id === id)

    if (userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
}




// getUser
const getUser = id => {
    // const user = users.find(user => user.id === id)

    // if (!user) {
    //     return undefined
    // }
    // return user
    return users.find(user => user.id === id)
}




//getUsersInRoom
const getUsersInRoom = room => {
    return users.filter(user => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
const users = [];

//adduser, removeuser, getuser, getusersinroom//

const adduser = ({id,username, room}) => {
    if(!username || !room){
        return {
            error: 'Need username and room'
        }
    }

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    

    const existinguser = users.find(user => {
        return user.room === room && user.username===username;
    })

    if(existinguser){
        return {
            error: 'Need unique username'
        }
    }

    const user = {
        id, username, room
    }

    users.push(user);
    return {user};
}


const removeuser = (id)=>{
    const index = users.findIndex( (user) =>{
        return user.id === id;
    })

    if(index !== -1){
       return users.splice(index, 1)[0];
    }
}



const getuser = (id)=>{

    return users.find( (user) =>
        user.id === id
    )

}

const getusersinroom = (room)=>{

    return users.filter((user) =>
        user.room === room
        )

}


module.exports ={
    adduser,
    removeuser,
    getuser, 
    getusersinroom
}
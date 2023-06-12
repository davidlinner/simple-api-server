import bcrypt from "bcrypt";

const myPlaintextPassword= '123'
const saltRounds=10

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    console.log('Hash', hash)
});

module.exports ={
  jwt: {
    secret: process.env.Auth_secret || "default",
    expiresIn: "1d"
  }


}
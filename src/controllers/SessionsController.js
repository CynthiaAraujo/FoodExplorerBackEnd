const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const { compare } = require("bcryptjs");
const authConfig = require ("../configs/auth");
const { sign } = require("jsonwebtoken");


class SessionsController {
  async create(request, response){
    const { email, password} = request.body;

    const user = await knex("users").where({email}).first();

    if (!email || !password) {
      return new AppError("Preencha todos os campos");
    }

    if(!user){
      throw new AppError("E-mail e/ou senha incorreta", 401)
    }

    const passwordMatched = await compare(password, user.password);

    if(!passwordMatched){
      throw new AppError("E-mail e/ou senha incorreta", 401)
    }

    const isAdmin = user.isAdmin || false;

    const { secret, expiresIn} = authConfig.jwt;
    const token = sign({isAdmin}, secret,{
      subject: String(user.id),
      expiresIn
    })

    return response.json({user, token});
  }
}
module.exports = SessionsController;

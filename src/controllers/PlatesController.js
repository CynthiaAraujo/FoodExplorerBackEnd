const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require('../providers/DiskStorage');
const UserRepository = require('../repositories/UserRepository');
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

class PlatesController {

  async create(request, response) {
    const { title, price, description, ingredients, type } = request.body;
    const img = request.file;
    const { id } = request.user;

    const diskStorage = new DiskStorage();

    if (!title || !price || !description || !img.filename || !type || !ingredients) {
      throw new AppError('Não foi possivel realizar o cadastro do prato.')
    }

    const userRepository = new UserRepository();

    const user = await userRepository.findById(id);

    if (!user || user.email !== 'admin@email.com') {
      throw new AppError("Apenas usuários administradores podem criar novos pratos", 401);
    }

    const filename = await diskStorage.saveFile(img.filename)

    const [plate_id] = await knex('plates').insert({
      title,
      price,
      description,
      img: filename,
      type,
    })

    const ingredientsInsert = JSON.parse(ingredients).map((name)=> {
      return {
        plates_id: plate_id,
        name,
      };
    });

    await knex("ingredients").insert(ingredientsInsert);

    return response.json();
  };

  async show(request, response) {
    const { id } = request.params;

    const userExists = await knex("plates").where("id", id).first();

    if (!userExists) {
      throw new AppError("Esse prato não existe!");
    }

    const plate = await knex('plates').where({ id }).first()
    const ingredients = await knex("ingredients").where({ plates_id: id }).orderBy("name");

    return response.json({
      ...plate,
      ingredients,
    });
  };

  async delete(request, response) {
    const { id } = request.params;
    const idUser = request.user.id;

    const userExists = await knex("plates").where("id", id).first();

    if (!userExists) {
      throw new AppError("Esse prato não existe!.");
    }

    const userRepository = new UserRepository();

    const user = await userRepository.findById(idUser);

    if (!user || user.email !== 'admin@email.com') {
      throw new AppError("Apenas usuários administradores podem deletar os Pratos", 401);
    }


    await knex("plates").where({ id }).delete();
    await knex("ingredients").where({ plates_id: id }).delete();
    return response.json();

  };

  async index(request, response) {
    const { title } = request.query;
  
    let plates;
    if (title) {
      const platesWithIngredients = await knex('ingredients')
        .whereLike('name', `%${title}%`)
        .select('plates_id');

      plates = await knex('plates')
        .innerJoin('ingredients', 'plates.id', 'ingredients.plates_id')
        .select([
          'plates.id',
          'plates.title',
          'plates.price',
          'plates.description',
          'plates.type',
          'plates.img',
          knex.raw('GROUP_CONCAT(DISTINCT ingredients.name) as ingredients')
        ])
        .whereIn('plates.id', platesWithIngredients.map(plate => plate.plates_id))
        .orWhereLike('plates.title', `%${title}%`)
        .groupBy('plates.id')
        .orderBy('plates.title');
    } else {
      plates = await knex('plates')
        .leftJoin('ingredients', 'plates.id', 'ingredients.plates_id')
        .select([
          'plates.id',
          'plates.title',
          'plates.price',
          'plates.description',
          'plates.type',
          'plates.img',
          knex.raw('GROUP_CONCAT(DISTINCT ingredients.name) as ingredients')
        ])
        .groupBy('plates.id')
        .orderBy('plates.title');
    }
  
    return response.json(plates);
  };

  async update(request, response) {
    const { id } = request.params;
    const { title, price, description, ingredients, type } = request.body;
    const img = request.file;
    const idUser = request.user.id;
  
    const diskStorage = new DiskStorage()
  
    const plate = await knex('plates')
      .where({ id })
      .first();
  
    if (!plate) {
      throw new AppError('Prato não encontrado');
    }

    const userRepository = new UserRepository();
    const user = await userRepository.findById(idUser);
    
    if (!user || user.email !== 'admin@email.com') {
      throw new AppError("Apenas usuários administradores podem atualizar os Pratos", 401);
    }
  
    let filename = plate.img;
    if (img) {
      // Se houver uma nova imagem, exclui a antiga
      if (filename) {
        await diskStorage.deleteFile(filename);
      }
  
      // Salva a nova imagem e obtém o nome do arquivo
      filename = await diskStorage.saveFile(img.filename);
    } else {
      // Se não houver nova imagem, mantém o nome da imagem atual
      filename = plate.img;
    }
  
    const updatedPlate = await knex('plates')
      .where({ id })
      .update({ title, price, description, type, img: filename });
  
    // Atualiza os ingredientes
    if (ingredients) {
      const ingredientNames = ingredients.split(",").map(ingredient => ingredient.trim());
  
      // Remove as ingredientes existentes
      await knex("ingredients")
        .where("plates_id", id)
        .delete();
  
      // Insere as novas ingredients
      const ingredientsToInsert = ingredientNames.map(name => ({ name, plates_id: id }));
      await knex("ingredients").insert(ingredientsToInsert);
    }
  
    return response.json({ message: "Prato atualizado com sucesso!" });
  };

}


module.exports = PlatesController;
